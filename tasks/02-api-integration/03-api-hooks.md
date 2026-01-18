# Task: API Hooks (React Query)

**Priority:** 🔴 High
**Estimated Time:** 2 gün
**Dependencies:** 02-tanstack-query-setup

---

## Objective

TanStack Query (React Query) kullanarak tüm backend endpoint'leri için custom hook'lar oluşturmak. 34 endpoint için useQuery ve useMutation hook'ları. Cache management, optimistic updates ve error handling dahil.

---

## Technical Details

### File: `src/lib/api/hooks/useAuth.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../auth.api';
import { setAuthToken, removeAuthToken } from '@/utils/storage';
import type { LoginResponse, RegisterRequest, User } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';

// Query keys for cache management
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
  all: ['auth'] as const,
};

/**
 * Login mutation
 * Backend Docs: /backend-docs/api/01-authentication/02-login.md
 *
 * Usage:
 * const { mutate: login, isPending } = useLogin();
 * login({ email: 'user@example.com', password: 'pass123' });
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authAPI.login(email, password);
      return response;
    },
    onSuccess: (data: LoginResponse) => {
      // Save token to localStorage
      setAuthToken(data.access_token);

      // Prefetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });

      // Navigate to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error.message);
    },
  });
}

/**
 * Register mutation
 * Backend Docs: /backend-docs/api/01-authentication/01-register.md
 *
 * Usage:
 * const { mutate: register, isPending } = useRegister();
 * register({ email: 'user@example.com', password: 'pass123', fullName: 'John Doe' });
 */
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const user = await authAPI.register(data);
      return user;
    },
    onSuccess: () => {
      // Navigate to login after successful registration
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error.message);
    },
  });
}

/**
 * Get current user query
 * Backend Docs: /backend-docs/api/01-authentication/03-get-current-user.md
 *
 * Usage:
 * const { data: user, isLoading, error } = useCurrentUser();
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: async () => {
      const user = await authAPI.getCurrentUser();
      return user;
    },
    retry: false, // Don't retry on 401
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Logout mutation
 * Backend Docs: /backend-docs/api/01-authentication/04-logout.md
 *
 * Usage:
 * const { mutate: logout } = useLogout();
 * logout();
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await authAPI.logout();
    },
    onSuccess: () => {
      // Remove token from localStorage
      removeAuthToken();

      // Clear all queries
      queryClient.clear();

      // Navigate to login
      navigate('/login');
    },
    onError: (error: any) => {
      // Even if API call fails, clear local data
      removeAuthToken();
      queryClient.clear();
      navigate('/login');
    },
  });
}
```

---

### File: `src/lib/api/hooks/useFields.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fieldsAPI } from '../fields.api';
import type { Field, FieldCreateRequest, FieldUpdateRequest } from '@/types/field.types';

// Query keys for cache management
export const fieldKeys = {
  all: ['fields'] as const,
  lists: () => [...fieldKeys.all, 'list'] as const,
  list: (filters?: { category?: string; is_system_field?: boolean }) =>
    [...fieldKeys.lists(), filters] as const,
  details: () => [...fieldKeys.all, 'detail'] as const,
  detail: (id: string) => [...fieldKeys.details(), id] as const,
};

/**
 * List fields query
 * Backend Docs: /backend-docs/api/02-fields/02-list-fields.md
 *
 * Usage:
 * const { data: fields, isLoading } = useFields();
 * const { data: systemFields } = useFields({ is_system_field: true });
 */
export function useFields(filters?: { category?: string; is_system_field?: boolean }) {
  return useQuery({
    queryKey: fieldKeys.list(filters),
    queryFn: async () => {
      const fields = await fieldsAPI.list(filters);
      return fields;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get field by ID query
 * Backend Docs: /backend-docs/api/02-fields/03-get-field.md
 *
 * Usage:
 * const { data: field, isLoading } = useField('fld_12345678');
 */
export function useField(fieldId: string) {
  return useQuery({
    queryKey: fieldKeys.detail(fieldId),
    queryFn: async () => {
      const field = await fieldsAPI.getById(fieldId);
      return field;
    },
    enabled: !!fieldId, // Only run if fieldId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create field mutation
 * Backend Docs: /backend-docs/api/02-fields/01-create-field.md
 *
 * Usage:
 * const { mutate: createField, isPending } = useCreateField();
 * createField({ name: 'email', label: 'Email', type: 'email' });
 */
export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FieldCreateRequest) => {
      const field = await fieldsAPI.create(data);
      return field;
    },
    onSuccess: (newField: Field) => {
      // Invalidate all field lists
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });

      // Optimistic update: Add to cache
      queryClient.setQueryData(fieldKeys.detail(newField.id), newField);
    },
    onError: (error: any) => {
      console.error('Create field failed:', error.message);
    },
  });
}

/**
 * Update field mutation
 * Backend Docs: /backend-docs/api/02-fields/04-update-field.md
 *
 * Usage:
 * const { mutate: updateField } = useUpdateField();
 * updateField({ fieldId: 'fld_12345678', data: { label: 'New Label' } });
 */
export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, data }: { fieldId: string; data: FieldUpdateRequest }) => {
      const field = await fieldsAPI.update(fieldId, data);
      return field;
    },
    onSuccess: (updatedField: Field) => {
      // Update detail cache
      queryClient.setQueryData(fieldKeys.detail(updatedField.id), updatedField);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update field failed:', error.message);
    },
  });
}

/**
 * Delete field mutation
 * Backend Docs: /backend-docs/api/02-fields/05-delete-field.md
 *
 * WARNING: CASCADE delete - removes all object-field relationships!
 *
 * Usage:
 * const { mutate: deleteField } = useDeleteField();
 * deleteField('fld_12345678');
 */
export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      await fieldsAPI.delete(fieldId);
      return fieldId;
    },
    onSuccess: (deletedFieldId: string) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: fieldKeys.detail(deletedFieldId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Delete field failed:', error.message);
    },
  });
}
```

---

### File: `src/lib/api/hooks/useObjects.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectsAPI } from '../objects.api';
import type { Object, ObjectCreateRequest, ObjectUpdateRequest } from '@/types/object.types';

// Query keys for cache management
export const objectKeys = {
  all: ['objects'] as const,
  lists: () => [...objectKeys.all, 'list'] as const,
  list: (filters?: { category?: string }) => [...objectKeys.lists(), filters] as const,
  details: () => [...objectKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectKeys.details(), id] as const,
};

/**
 * List objects query
 * Backend Docs: /backend-docs/api/03-objects/02-list-objects.md
 *
 * Usage:
 * const { data: objects, isLoading } = useObjects();
 * const { data: standardObjects } = useObjects({ category: 'standard' });
 */
export function useObjects(filters?: { category?: string }) {
  return useQuery({
    queryKey: objectKeys.list(filters),
    queryFn: async () => {
      const objects = await objectsAPI.list(filters);
      return objects;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get object by ID query
 * Backend Docs: /backend-docs/api/03-objects/03-get-object.md
 *
 * Usage:
 * const { data: object, isLoading } = useObject('obj_12345678');
 */
export function useObject(objectId: string) {
  return useQuery({
    queryKey: objectKeys.detail(objectId),
    queryFn: async () => {
      const object = await objectsAPI.getById(objectId);
      return object;
    },
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create object mutation
 * Backend Docs: /backend-docs/api/03-objects/01-create-object.md
 *
 * Usage:
 * const { mutate: createObject } = useCreateObject();
 * createObject({ name: 'Contact', label: 'Contact', category: 'standard' });
 */
export function useCreateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ObjectCreateRequest) => {
      const object = await objectsAPI.create(data);
      return object;
    },
    onSuccess: (newObject: Object) => {
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
      queryClient.setQueryData(objectKeys.detail(newObject.id), newObject);
    },
  });
}

/**
 * Update object mutation
 * Backend Docs: /backend-docs/api/03-objects/04-update-object.md
 *
 * Usage:
 * const { mutate: updateObject } = useUpdateObject();
 * updateObject({ objectId: 'obj_12345678', data: { label: 'New Label' } });
 */
export function useUpdateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ objectId, data }: { objectId: string; data: ObjectUpdateRequest }) => {
      const object = await objectsAPI.update(objectId, data);
      return object;
    },
    onSuccess: (updatedObject: Object) => {
      queryClient.setQueryData(objectKeys.detail(updatedObject.id), updatedObject);
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
    },
  });
}

/**
 * Delete object mutation
 * Backend Docs: /backend-docs/api/03-objects/05-delete-object.md
 *
 * WARNING: CASCADE delete - removes all records and relationships!
 *
 * Usage:
 * const { mutate: deleteObject } = useDeleteObject();
 * deleteObject('obj_12345678');
 */
export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objectId: string) => {
      await objectsAPI.delete(objectId);
      return objectId;
    },
    onSuccess: (deletedObjectId: string) => {
      queryClient.removeQueries({ queryKey: objectKeys.detail(deletedObjectId) });
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/useRecords.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordsAPI } from '../records.api';
import type { Record, RecordCreateRequest, RecordUpdateRequest } from '@/types/record.types';

// Query keys for cache management
export const recordKeys = {
  all: ['records'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (objectId: string, params?: { page?: number; page_size?: number }) =>
    [...recordKeys.lists(), objectId, params] as const,
  searches: () => [...recordKeys.all, 'search'] as const,
  search: (objectId: string, query: string, params?: { page?: number; page_size?: number }) =>
    [...recordKeys.searches(), objectId, query, params] as const,
  details: () => [...recordKeys.all, 'detail'] as const,
  detail: (id: string) => [...recordKeys.details(), id] as const,
};

/**
 * List records query
 * Backend Docs: /backend-docs/api/04-records/02-list-records.md
 *
 * Usage:
 * const { data: records, isLoading } = useRecords('obj_12345678');
 * const { data: pagedRecords } = useRecords('obj_12345678', { page: 1, page_size: 20 });
 */
export function useRecords(
  objectId: string,
  params?: { page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: recordKeys.list(objectId, params),
    queryFn: async () => {
      const records = await recordsAPI.list({ object_id: objectId, ...params });
      return records;
    },
    enabled: !!objectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get record by ID query
 * Backend Docs: /backend-docs/api/04-records/03-get-record.md
 *
 * Usage:
 * const { data: record, isLoading } = useRecord('rec_12345678');
 */
export function useRecord(recordId: string) {
  return useQuery({
    queryKey: recordKeys.detail(recordId),
    queryFn: async () => {
      const record = await recordsAPI.getById(recordId);
      return record;
    },
    enabled: !!recordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Search records query
 * Backend Docs: /backend-docs/api/04-records/06-search-records.md
 *
 * Usage:
 * const { data: results, isLoading } = useSearchRecords('obj_12345678', 'john doe');
 */
export function useSearchRecords(
  objectId: string,
  query: string,
  params?: { page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: recordKeys.search(objectId, query, params),
    queryFn: async () => {
      const records = await recordsAPI.search({ object_id: objectId, q: query, ...params });
      return records;
    },
    enabled: !!objectId && !!query && query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Create record mutation
 * Backend Docs: /backend-docs/api/04-records/01-create-record.md
 *
 * Usage:
 * const { mutate: createRecord } = useCreateRecord();
 * createRecord({ object_id: 'obj_12345678', data: { name: 'John Doe', email: 'john@example.com' } });
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecordCreateRequest) => {
      const record = await recordsAPI.create(data);
      return record;
    },
    onSuccess: (newRecord: Record) => {
      // Invalidate all lists for this object
      queryClient.invalidateQueries({ queryKey: recordKeys.lists() });

      // Add to detail cache
      queryClient.setQueryData(recordKeys.detail(newRecord.id), newRecord);
    },
  });
}

/**
 * Update record mutation
 * Backend Docs: /backend-docs/api/04-records/04-update-record.md
 *
 * IMPORTANT: Backend merges data, doesn't overwrite!
 *
 * Usage:
 * const { mutate: updateRecord } = useUpdateRecord();
 * updateRecord({ recordId: 'rec_12345678', data: { email: 'newemail@example.com' } });
 */
export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: RecordUpdateRequest }) => {
      const record = await recordsAPI.update(recordId, data);
      return record;
    },
    onMutate: async ({ recordId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: recordKeys.detail(recordId) });

      const previousRecord = queryClient.getQueryData<Record>(recordKeys.detail(recordId));

      if (previousRecord) {
        queryClient.setQueryData<Record>(recordKeys.detail(recordId), {
          ...previousRecord,
          data: { ...previousRecord.data, ...data.data },
          updated_at: new Date().toISOString(),
        });
      }

      return { previousRecord };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousRecord) {
        queryClient.setQueryData(
          recordKeys.detail(variables.recordId),
          context.previousRecord
        );
      }
    },
    onSuccess: (updatedRecord: Record) => {
      queryClient.setQueryData(recordKeys.detail(updatedRecord.id), updatedRecord);
      queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
    },
  });
}

/**
 * Delete record mutation
 * Backend Docs: /backend-docs/api/04-records/05-delete-record.md
 *
 * WARNING: CASCADE delete - removes all relationship records!
 *
 * Usage:
 * const { mutate: deleteRecord } = useDeleteRecord();
 * deleteRecord('rec_12345678');
 */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      await recordsAPI.delete(recordId);
      return recordId;
    },
    onSuccess: (deletedRecordId: string) => {
      queryClient.removeQueries({ queryKey: recordKeys.detail(deletedRecordId) });
      queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/useRelationships.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { relationshipsAPI } from '../relationships.api';
import type { Relationship, RelationshipCreateRequest } from '@/types/relationship.types';

// Query keys for cache management
export const relationshipKeys = {
  all: ['relationships'] as const,
  lists: () => [...relationshipKeys.all, 'list'] as const,
  list: (objectId: string) => [...relationshipKeys.lists(), objectId] as const,
  details: () => [...relationshipKeys.all, 'detail'] as const,
  detail: (id: string) => [...relationshipKeys.details(), id] as const,
};

/**
 * Get object relationships query
 * Backend Docs: /backend-docs/api/05-relationships/02-get-object-relationships.md
 *
 * Usage:
 * const { data: relationships, isLoading } = useObjectRelationships('obj_12345678');
 */
export function useObjectRelationships(objectId: string) {
  return useQuery({
    queryKey: relationshipKeys.list(objectId),
    queryFn: async () => {
      const relationships = await relationshipsAPI.getObjectRelationships(objectId);
      return relationships;
    },
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create relationship mutation
 * Backend Docs: /backend-docs/api/05-relationships/01-create-relationship.md
 *
 * Usage:
 * const { mutate: createRelationship } = useCreateRelationship();
 * createRelationship({
 *   name: 'contacts',
 *   label: 'Contacts',
 *   from_object_id: 'obj_account',
 *   to_object_id: 'obj_contact',
 *   type: 'one_to_many'
 * });
 */
export function useCreateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RelationshipCreateRequest) => {
      const relationship = await relationshipsAPI.create(data);
      return relationship;
    },
    onSuccess: (newRelationship: Relationship) => {
      // Invalidate relationship lists for both objects
      queryClient.invalidateQueries({
        queryKey: relationshipKeys.list(newRelationship.from_object_id),
      });
      queryClient.invalidateQueries({
        queryKey: relationshipKeys.list(newRelationship.to_object_id),
      });

      // Add to detail cache
      queryClient.setQueryData(relationshipKeys.detail(newRelationship.id), newRelationship);
    },
  });
}

/**
 * Delete relationship mutation
 * Backend Docs: /backend-docs/api/05-relationships/03-delete-relationship.md
 *
 * WARNING: CASCADE delete - removes all relationship records!
 *
 * Usage:
 * const { mutate: deleteRelationship } = useDeleteRelationship();
 * deleteRelationship('rel_12345678');
 */
export function useDeleteRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId: string) => {
      await relationshipsAPI.delete(relationshipId);
      return relationshipId;
    },
    onSuccess: (deletedRelationshipId: string) => {
      queryClient.removeQueries({ queryKey: relationshipKeys.detail(deletedRelationshipId) });
      queryClient.invalidateQueries({ queryKey: relationshipKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/useObjectFields.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectFieldsAPI } from '../object-fields.api';
import type { ObjectField, ObjectFieldCreateRequest, ObjectFieldUpdateRequest } from '@/types/object-field.types';

// Query keys for cache management
export const objectFieldKeys = {
  all: ['objectFields'] as const,
  lists: () => [...objectFieldKeys.all, 'list'] as const,
  list: (objectId: string) => [...objectFieldKeys.lists(), objectId] as const,
  details: () => [...objectFieldKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectFieldKeys.details(), id] as const,
};

/**
 * List object fields query
 * Backend Docs: /backend-docs/api/06-object-fields/01-list-object-fields.md
 *
 * Usage:
 * const { data: objectFields, isLoading } = useObjectFields('obj_12345678');
 */
export function useObjectFields(objectId: string) {
  return useQuery({
    queryKey: objectFieldKeys.list(objectId),
    queryFn: async () => {
      const objectFields = await objectFieldsAPI.list(objectId);
      return objectFields;
    },
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create object field mutation
 * Backend Docs: /backend-docs/api/06-object-fields/02-create-object-field.md
 *
 * Usage:
 * const { mutate: createObjectField } = useCreateObjectField();
 * createObjectField({
 *   object_id: 'obj_12345678',
 *   field_id: 'fld_12345678',
 *   is_required: true,
 *   is_unique: false
 * });
 */
export function useCreateObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ObjectFieldCreateRequest) => {
      const objectField = await objectFieldsAPI.create(data);
      return objectField;
    },
    onSuccess: (newObjectField: ObjectField) => {
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.list(newObjectField.object_id),
      });
      queryClient.setQueryData(objectFieldKeys.detail(newObjectField.id), newObjectField);
    },
  });
}

/**
 * Update object field mutation
 * Backend Docs: /backend-docs/api/06-object-fields/03-update-object-field.md
 *
 * Usage:
 * const { mutate: updateObjectField } = useUpdateObjectField();
 * updateObjectField({ objectFieldId: 'objfld_12345678', data: { is_required: false } });
 */
export function useUpdateObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ objectFieldId, data }: { objectFieldId: string; data: ObjectFieldUpdateRequest }) => {
      const objectField = await objectFieldsAPI.update(objectFieldId, data);
      return objectField;
    },
    onSuccess: (updatedObjectField: ObjectField) => {
      queryClient.setQueryData(objectFieldKeys.detail(updatedObjectField.id), updatedObjectField);
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.list(updatedObjectField.object_id),
      });
    },
  });
}

/**
 * Delete object field mutation
 * Backend Docs: /backend-docs/api/06-object-fields/04-delete-object-field.md
 *
 * Usage:
 * const { mutate: deleteObjectField } = useDeleteObjectField();
 * deleteObjectField('objfld_12345678');
 */
export function useDeleteObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objectFieldId: string) => {
      await objectFieldsAPI.delete(objectFieldId);
      return objectFieldId;
    },
    onSuccess: (deletedObjectFieldId: string) => {
      queryClient.removeQueries({ queryKey: objectFieldKeys.detail(deletedObjectFieldId) });
      queryClient.invalidateQueries({ queryKey: objectFieldKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/useRelationshipRecords.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { relationshipRecordsAPI } from '../relationship-records.api';
import type { RelationshipRecord, RelationshipRecordCreateRequest } from '@/types/relationship-record.types';
import { recordKeys } from './useRecords';

// Query keys for cache management
export const relationshipRecordKeys = {
  all: ['relationshipRecords'] as const,
  lists: () => [...relationshipRecordKeys.all, 'list'] as const,
  list: (recordId: string, relationshipName: string) =>
    [...relationshipRecordKeys.lists(), recordId, relationshipName] as const,
  details: () => [...relationshipRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...relationshipRecordKeys.details(), id] as const,
};

/**
 * Get related records query
 * Backend Docs: /backend-docs/api/07-relationship-records/02-get-related-records.md
 *
 * Usage:
 * const { data: contacts, isLoading } = useRelatedRecords('rec_account123', 'contacts');
 */
export function useRelatedRecords(recordId: string, relationshipName: string) {
  return useQuery({
    queryKey: relationshipRecordKeys.list(recordId, relationshipName),
    queryFn: async () => {
      const relatedRecords = await relationshipRecordsAPI.getRelated(recordId, relationshipName);
      return relatedRecords;
    },
    enabled: !!recordId && !!relationshipName,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create relationship record mutation
 * Backend Docs: /backend-docs/api/07-relationship-records/01-create-relationship-record.md
 *
 * Usage:
 * const { mutate: createRelationshipRecord } = useCreateRelationshipRecord();
 * createRelationshipRecord({
 *   relationship_id: 'rel_12345678',
 *   from_record_id: 'rec_account123',
 *   to_record_id: 'rec_contact456'
 * });
 */
export function useCreateRelationshipRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RelationshipRecordCreateRequest) => {
      const relationshipRecord = await relationshipRecordsAPI.create(data);
      return relationshipRecord;
    },
    onSuccess: (newRelationshipRecord: RelationshipRecord) => {
      // Invalidate related records lists
      queryClient.invalidateQueries({ queryKey: relationshipRecordKeys.lists() });

      // Invalidate parent records (they might display related count)
      queryClient.invalidateQueries({
        queryKey: recordKeys.detail(newRelationshipRecord.from_record_id),
      });
      queryClient.invalidateQueries({
        queryKey: recordKeys.detail(newRelationshipRecord.to_record_id),
      });
    },
  });
}

/**
 * Delete relationship record mutation
 * Backend Docs: /backend-docs/api/07-relationship-records/03-delete-relationship-record.md
 *
 * Usage:
 * const { mutate: deleteRelationshipRecord } = useDeleteRelationshipRecord();
 * deleteRelationshipRecord('relrec_12345678');
 */
export function useDeleteRelationshipRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipRecordId: string) => {
      await relationshipRecordsAPI.delete(relationshipRecordId);
      return relationshipRecordId;
    },
    onSuccess: () => {
      // Invalidate all related records lists
      queryClient.invalidateQueries({ queryKey: relationshipRecordKeys.lists() });

      // Invalidate record lists (parent records might show related count)
      queryClient.invalidateQueries({ queryKey: recordKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/useApplications.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../applications.api';
import type { Application, ApplicationCreateRequest } from '@/types/application.types';

// Query keys for cache management
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: () => [...applicationKeys.lists()] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

/**
 * List applications query
 * Backend Docs: /backend-docs/api/08-applications/02-list-applications.md
 *
 * Usage:
 * const { data: applications, isLoading } = useApplications();
 */
export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.list(),
    queryFn: async () => {
      const applications = await applicationsAPI.list();
      return applications;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get application by ID query
 * Backend Docs: /backend-docs/api/08-applications/03-get-application.md
 *
 * Usage:
 * const { data: application, isLoading } = useApplication('app_12345678');
 */
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: async () => {
      const application = await applicationsAPI.getById(applicationId);
      return application;
    },
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create application mutation
 * Backend Docs: /backend-docs/api/08-applications/01-create-application.md
 *
 * Usage:
 * const { mutate: createApplication } = useCreateApplication();
 * createApplication({ name: 'Sales CRM', description: 'Customer relationship management' });
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationCreateRequest) => {
      const application = await applicationsAPI.create(data);
      return application;
    },
    onSuccess: (newApplication: Application) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.setQueryData(applicationKeys.detail(newApplication.id), newApplication);
    },
  });
}

/**
 * Publish application mutation
 * Backend Docs: /backend-docs/api/08-applications/04-publish-application.md
 *
 * Usage:
 * const { mutate: publishApplication } = usePublishApplication();
 * publishApplication('app_12345678');
 */
export function usePublishApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const application = await applicationsAPI.publish(applicationId);
      return application;
    },
    onSuccess: (publishedApplication: Application) => {
      queryClient.setQueryData(applicationKeys.detail(publishedApplication.id), publishedApplication);
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

/**
 * Delete application mutation
 * Backend Docs: /backend-docs/api/08-applications/05-delete-application.md
 *
 * WARNING: CASCADE delete - removes all objects, fields, records in the app!
 *
 * Usage:
 * const { mutate: deleteApplication } = useDeleteApplication();
 * deleteApplication('app_12345678');
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      await applicationsAPI.delete(applicationId);
      return applicationId;
    },
    onSuccess: (deletedApplicationId: string) => {
      queryClient.removeQueries({ queryKey: applicationKeys.detail(deletedApplicationId) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
```

---

### File: `src/lib/api/hooks/index.ts`

```typescript
// Export all hooks from a single entry point
export * from './useAuth';
export * from './useFields';
export * from './useObjects';
export * from './useRecords';
export * from './useRelationships';
export * from './useObjectFields';
export * from './useRelationshipRecords';
export * from './useApplications';
```

---

## Usage Examples

### Example 1: Login Form

```typescript
import { useLogin } from '@/lib/api/hooks';

function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Example 2: Fields List

```typescript
import { useFields, useDeleteField } from '@/lib/api/hooks';

function FieldsList() {
  const { data: fields, isLoading, error } = useFields();
  const { mutate: deleteField } = useDeleteField();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {fields?.map((field) => (
        <li key={field.id}>
          {field.label} ({field.type})
          <button onClick={() => deleteField(field.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### Example 3: Create Record with Optimistic Update

```typescript
import { useCreateRecord, useRecords } from '@/lib/api/hooks';

function CreateRecordForm({ objectId }: { objectId: string }) {
  const { mutate: createRecord, isPending } = useCreateRecord();
  const { data: records } = useRecords(objectId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createRecord({
      object_id: objectId,
      data: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      },
    });
  };

  return (
    <div>
      <h3>Total Records: {records?.length || 0}</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Record'}
        </button>
      </form>
    </div>
  );
}
```

### Example 4: Search Records with Debounce

```typescript
import { useState, useEffect } from 'react';
import { useSearchRecords } from '@/lib/api/hooks';
import { useDebounce } from '@/hooks/useDebounce';

function RecordSearch({ objectId }: { objectId: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300); // 300ms debounce

  const { data: results, isLoading } = useSearchRecords(objectId, debouncedQuery);

  return (
    <div>
      <input
        type="text"
        placeholder="Search records..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isLoading && <div>Searching...</div>}
      {results && (
        <ul>
          {results.map((record) => (
            <li key={record.id}>{JSON.stringify(record.data)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Example 5: Related Records (Master-Detail)

```typescript
import { useRelatedRecords, useCreateRelationshipRecord } from '@/lib/api/hooks';

function AccountContacts({ accountId }: { accountId: string }) {
  const { data: contacts, isLoading } = useRelatedRecords(accountId, 'contacts');
  const { mutate: addContact } = useCreateRelationshipRecord();

  const handleAddContact = (contactId: string) => {
    addContact({
      relationship_id: 'rel_account_contacts', // This should be fetched dynamically
      from_record_id: accountId,
      to_record_id: contactId,
    });
  };

  if (isLoading) return <div>Loading contacts...</div>;

  return (
    <div>
      <h3>Contacts ({contacts?.length || 0})</h3>
      <ul>
        {contacts?.map((contact) => (
          <li key={contact.id}>{contact.data.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Cache Key Management Best Practices

### Query Key Hierarchy

```typescript
// Good: Hierarchical keys for easy invalidation
export const recordKeys = {
  all: ['records'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (objectId: string) => [...recordKeys.lists(), objectId] as const,
  details: () => [...recordKeys.all, 'detail'] as const,
  detail: (id: string) => [...recordKeys.details(), id] as const,
};

// Usage:
// ['records'] - Invalidates everything
// ['records', 'list'] - Invalidates all lists
// ['records', 'list', 'obj_123'] - Invalidates specific object list
// ['records', 'detail', 'rec_456'] - Invalidates specific record
```

### Selective Invalidation

```typescript
// ❌ BAD: Invalidates too much
queryClient.invalidateQueries({ queryKey: ['records'] });

// ✅ GOOD: Invalidate only affected lists
queryClient.invalidateQueries({ queryKey: recordKeys.lists() });

// ✅ BETTER: Invalidate only specific object's list
queryClient.invalidateQueries({ queryKey: recordKeys.list(objectId) });
```

---

## Acceptance Criteria

- [ ] `useAuth` hook'ları oluşturuldu (login, register, getCurrentUser, logout)
- [ ] `useFields` hook'ları oluşturuldu (list, create, update, delete, getById)
- [ ] `useObjects` hook'ları oluşturuldu (list, create, update, delete, getById)
- [ ] `useRecords` hook'ları oluşturuldu (list, create, update, delete, getById, search)
- [ ] `useRelationships` hook'ları oluşturuldu (create, getObjectRelationships, delete)
- [ ] `useObjectFields` hook'ları oluşturuldu (list, create, update, delete)
- [ ] `useRelationshipRecords` hook'ları oluşturuldu (create, getRelated, delete)
- [ ] `useApplications` hook'ları oluşturuldu (list, create, publish, delete, getById)
- [ ] Tüm hook'lar için cache key management sistemi kuruldu
- [ ] `useUpdateRecord` hook'unda optimistic update implement edildi
- [ ] Tüm mutation hook'ları cache invalidation yapıyor
- [ ] `index.ts` export file oluşturuldu
- [ ] TypeScript types tüm hook'larda doğru kullanıldı
- [ ] Error handling tüm hook'larda mevcut
- [ ] `staleTime` değerleri her hook için optimize edildi
- [ ] Related records için proper cache invalidation yapılıyor

---

## Testing

### Manual Test: Login Flow

```typescript
// Test in browser console
import { useLogin, useCurrentUser } from '@/lib/api/hooks';

function TestLoginComponent() {
  const { mutate: login } = useLogin();
  const { data: user, isLoading } = useCurrentUser();

  return (
    <div>
      <button onClick={() => login({ email: 'test@example.com', password: 'test123' })}>
        Login
      </button>
      {isLoading && <div>Loading user...</div>}
      {user && <div>Welcome, {user.full_name}!</div>}
    </div>
  );
}
```

### Manual Test: Optimistic Update

```typescript
// Test in browser console
import { useUpdateRecord, useRecord } from '@/lib/api/hooks';

function TestOptimisticUpdate() {
  const recordId = 'rec_12345678';
  const { data: record } = useRecord(recordId);
  const { mutate: updateRecord } = useUpdateRecord();

  const handleUpdate = () => {
    updateRecord({
      recordId,
      data: { name: 'Updated Name' },
    });

    // UI should update immediately (optimistic)
    // Then revert if API call fails
  };

  return (
    <div>
      <p>Name: {record?.data.name}</p>
      <button onClick={handleUpdate}>Update Name</button>
    </div>
  );
}
```

### Manual Test: Cache Invalidation

```typescript
// Open React Query DevTools and observe cache invalidation
import { useRecords, useCreateRecord } from '@/lib/api/hooks';

function TestCacheInvalidation() {
  const objectId = 'obj_12345678';
  const { data: records } = useRecords(objectId);
  const { mutate: createRecord } = useCreateRecord();

  const handleCreate = () => {
    createRecord({
      object_id: objectId,
      data: { name: 'New Record' },
    });

    // Watch DevTools: ['records', 'list', 'obj_12345678'] should be invalidated
  };

  return (
    <div>
      <p>Total Records: {records?.length}</p>
      <button onClick={handleCreate}>Create Record</button>
    </div>
  );
}
```

---

## Performance Optimization

### Stale Time Configuration

```typescript
// Data that changes frequently (1-2 minutes)
staleTime: 1 * 60 * 1000 // Records list

// Data that changes occasionally (2-5 minutes)
staleTime: 2 * 60 * 1000 // Fields, Objects

// Data that rarely changes (5+ minutes)
staleTime: 5 * 60 * 1000 // Current user, Relationships
```

### Prefetching Example

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { recordKeys } from '@/lib/api/hooks';
import { recordsAPI } from '@/lib/api/records.api';

function RecordsList({ objectId }: { objectId: string }) {
  const queryClient = useQueryClient();

  const handleHoverRecord = (recordId: string) => {
    // Prefetch record details on hover
    queryClient.prefetchQuery({
      queryKey: recordKeys.detail(recordId),
      queryFn: () => recordsAPI.getById(recordId),
      staleTime: 2 * 60 * 1000,
    });
  };

  // ...
}
```

---

## Resources

### Backend Documentation (Local)
- [API Documentation Index](../../backend-docs/api/00-API-DOCUMENTATION-INDEX.md) - All 34 endpoints
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete guide
- [Authentication API](../../backend-docs/api/01-authentication/README.md)
- [Fields API](../../backend-docs/api/02-fields/README.md)
- [Objects API](../../backend-docs/api/03-objects/README.md)
- [Records API](../../backend-docs/api/04-records/README.md)
- [Relationships API](../../backend-docs/api/05-relationships/README.md)
- [Object Fields API](../../backend-docs/api/06-object-fields/README.md)
- [Relationship Records API](../../backend-docs/api/07-relationship-records/README.md)
- [Applications API](../../backend-docs/api/08-applications/README.md)

### External Resources
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Query Keys Guide](https://tkdodo.eu/blog/effective-react-query-keys)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the API Hooks (React Query) task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/02-api-integration/03-api-hooks.md

Requirements:
1. Create src/lib/api/hooks/useAuth.ts - Authentication hooks (login, register, getCurrentUser, logout)
2. Create src/lib/api/hooks/useFields.ts - Fields CRUD hooks with cache management
3. Create src/lib/api/hooks/useObjects.ts - Objects CRUD hooks with cache management
4. Create src/lib/api/hooks/useRecords.ts - Records CRUD + search hooks with optimistic updates
5. Create src/lib/api/hooks/useRelationships.ts - Relationships hooks
6. Create src/lib/api/hooks/useObjectFields.ts - Object fields hooks
7. Create src/lib/api/hooks/useRelationshipRecords.ts - Relationship records hooks
8. Create src/lib/api/hooks/useApplications.ts - Applications hooks
9. Create src/lib/api/hooks/index.ts - Export all hooks

CRITICAL REQUIREMENTS:
- All hooks must use TanStack Query (useQuery, useMutation)
- Implement hierarchical cache key system for each resource type
- useUpdateRecord must have optimistic updates with rollback on error
- All mutations must invalidate relevant queries after success
- Login hook must save token to localStorage and navigate to /dashboard
- Logout hook must clear all queries and navigate to /login
- Use proper TypeScript types for all hooks
- Configure appropriate staleTime for each query (1-5 minutes based on data frequency)
- All mutation hooks must handle errors gracefully

CACHE KEY STRUCTURE:
- Use hierarchical keys: ['resource'] → ['resource', 'list'] → ['resource', 'list', 'id']
- Export key factories for each resource (e.g., fieldKeys, recordKeys)
- Implement selective invalidation (only invalidate affected queries)

Follow the exact code examples provided in the task file. All 34 backend endpoints should be covered.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-error-handling.md
