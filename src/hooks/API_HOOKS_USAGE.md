# API Hooks Usage Guide

This document provides usage examples for all TanStack Query hooks in the Canvas App.

## Table of Contents

- [Records Hooks](#records-hooks)
- [Fields Hooks](#fields-hooks)
- [Objects Hooks](#objects-hooks)
- [Best Practices](#best-practices)

---

## Records Hooks

Located in: `src/hooks/useRecords.ts`

### Query Hooks

#### `useRecords` - Fetch records for an object

```tsx
import { useRecords } from '@/hooks/useRecords';

function RecordsList({ objectId }: { objectId: string }) {
  const { data, isLoading, error } = useRecords(objectId, {
    page: 1,
    page_size: 20,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((record) => (
        <li key={record.record_id}>{record.name}</li>
      ))}
    </ul>
  );
}
```

#### `useRecord` - Fetch single record

```tsx
import { useRecord } from '@/hooks/useRecords';

function RecordDetail({ recordId }: { recordId: string }) {
  const { data: record, isLoading, error } = useRecord(recordId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!record) return null;

  return (
    <div>
      <h2>{record.name}</h2>
      <pre>{JSON.stringify(record.data, null, 2)}</pre>
    </div>
  );
}
```

#### `useSearchRecords` - Search records

```tsx
import { useSearchRecords } from '@/hooks/useRecords';
import { useState } from 'react';

function RecordsSearch({ objectId }: { objectId: string }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useSearchRecords(objectId, searchQuery, {
    page: 1,
    page_size: 10,
  });

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search records..."
      />
      {isLoading && <div>Searching...</div>}
      <ul>
        {data?.map((record) => (
          <li key={record.record_id}>{record.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Mutation Hooks

#### `useCreateRecord` - Create new record

```tsx
import { useCreateRecord } from '@/hooks/useRecords';

function CreateRecordForm({ objectId }: { objectId: string }) {
  const createRecord = useCreateRecord();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createRecord.mutateAsync({
        object_id: objectId,
        name: formData.get('name') as string,
        data: {
          // Your record data here
        },
      });

      alert('Record created successfully!');
    } catch (error) {
      console.error('Failed to create record:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Record name" required />
      <button type="submit" disabled={createRecord.isPending}>
        {createRecord.isPending ? 'Creating...' : 'Create Record'}
      </button>
    </form>
  );
}
```

#### `useUpdateRecord` - Update record

```tsx
import { useUpdateRecord } from '@/hooks/useRecords';

function UpdateRecordButton({ recordId }: { recordId: string }) {
  const updateRecord = useUpdateRecord();

  const handleUpdate = async () => {
    try {
      await updateRecord.mutateAsync({
        recordId,
        data: {
          name: 'Updated Name',
          data: { status: 'active' },
        },
      });

      alert('Record updated!');
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={updateRecord.isPending}>
      {updateRecord.isPending ? 'Updating...' : 'Update Record'}
    </button>
  );
}
```

#### `useDeleteRecord` - Delete record

```tsx
import { useDeleteRecord } from '@/hooks/useRecords';

function DeleteRecordButton({ recordId }: { recordId: string }) {
  const deleteRecord = useDeleteRecord();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteRecord.mutateAsync(recordId);
      alert('Record deleted!');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteRecord.isPending}>
      {deleteRecord.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

## Fields Hooks

Located in: `src/hooks/useFields.ts`

### Query Hooks

#### `useFields` - Fetch all fields

```tsx
import { useFields } from '@/hooks/useFields';

function FieldsList() {
  const { data: fields, isLoading } = useFields({
    category: 'user',
    is_system_field: false,
    page_size: 50,
  });

  if (isLoading) return <div>Loading fields...</div>;

  return (
    <ul>
      {fields?.map((field) => (
        <li key={field.field_id}>
          {field.name} ({field.type})
        </li>
      ))}
    </ul>
  );
}
```

#### `useField` - Fetch single field

```tsx
import { useField } from '@/hooks/useFields';

function FieldDetail({ fieldId }: { fieldId: string }) {
  const { data: field, isLoading } = useField(fieldId);

  if (isLoading) return <div>Loading...</div>;
  if (!field) return null;

  return (
    <div>
      <h3>{field.name}</h3>
      <p>Type: {field.type}</p>
      <p>Label: {field.label}</p>
      {field.description && <p>{field.description}</p>}
    </div>
  );
}
```

### Mutation Hooks

#### `useCreateField` - Create new field

```tsx
import { useCreateField } from '@/hooks/useFields';

function CreateFieldForm() {
  const createField = useCreateField();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createField.mutateAsync({
        name: formData.get('name') as string,
        label: formData.get('label') as string,
        type: 'text',
        category: 'custom',
      });

      alert('Field created!');
    } catch (error) {
      console.error('Failed to create field:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Field name" required />
      <input name="label" placeholder="Field label" required />
      <button type="submit" disabled={createField.isPending}>
        Create Field
      </button>
    </form>
  );
}
```

#### `useUpdateField` - Update field

**Note**: `name` and `type` cannot be changed after creation (backend constraint)

```tsx
import { useUpdateField } from '@/hooks/useFields';

function UpdateFieldButton({ fieldId }: { fieldId: string }) {
  const updateField = useUpdateField();

  const handleUpdate = async () => {
    await updateField.mutateAsync({
      fieldId,
      data: {
        label: 'Updated Label',
        description: 'New description',
      },
    });
  };

  return <button onClick={handleUpdate}>Update Field</button>;
}
```

#### `useDeleteField` - Delete field

**Warning**: CASCADE delete - removes all object-field relationships!

```tsx
import { useDeleteField } from '@/hooks/useFields';

function DeleteFieldButton({ fieldId }: { fieldId: string }) {
  const deleteField = useDeleteField();

  const handleDelete = async () => {
    if (!confirm('This will remove all object relationships. Continue?')) return;

    await deleteField.mutateAsync(fieldId);
  };

  return <button onClick={handleDelete}>Delete Field</button>;
}
```

---

## Objects Hooks

Located in: `src/hooks/useObjects.ts`

### Query Hooks

#### `useObjects` - Fetch all objects

```tsx
import { useObjects } from '@/hooks/useObjects';

function ObjectsList() {
  const { data: objects, isLoading } = useObjects({
    category: 'standard',
    page: 1,
    page_size: 20,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {objects?.map((obj) => (
        <li key={obj.object_id}>
          {obj.name} - {obj.label}
        </li>
      ))}
    </ul>
  );
}
```

#### `useObject` - Fetch single object

```tsx
import { useObject } from '@/hooks/useObjects';

function ObjectDetail({ objectId }: { objectId: string }) {
  const { data: object, isLoading } = useObject(objectId);

  if (isLoading) return <div>Loading...</div>;
  if (!object) return null;

  return (
    <div>
      <h2>{object.label}</h2>
      <p>{object.description}</p>
      <p>API Name: {object.name}</p>
    </div>
  );
}
```

### Mutation Hooks

#### `useCreateObject` - Create new object

```tsx
import { useCreateObject } from '@/hooks/useObjects';

function CreateObjectForm() {
  const createObject = useCreateObject();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createObject.mutateAsync({
        name: formData.get('name') as string,
        label: formData.get('label') as string,
        category: 'custom',
      });

      alert('Object created!');
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="API name" required />
      <input name="label" placeholder="Display label" required />
      <button type="submit">Create Object</button>
    </form>
  );
}
```

#### `useUpdateObject` - Update object

```tsx
import { useUpdateObject } from '@/hooks/useObjects';

function UpdateObjectButton({ objectId }: { objectId: string }) {
  const updateObject = useUpdateObject();

  const handleUpdate = async () => {
    await updateObject.mutateAsync({
      objectId,
      data: {
        label: 'Updated Label',
        description: 'New description',
      },
    });
  };

  return <button onClick={handleUpdate}>Update Object</button>;
}
```

#### `useDeleteObject` - Delete object

**Warning**: CASCADE delete - removes all records associated with this object!

```tsx
import { useDeleteObject } from '@/hooks/useObjects';

function DeleteObjectButton({ objectId }: { objectId: string }) {
  const deleteObject = useDeleteObject();

  const handleDelete = async () => {
    if (!confirm('This will delete all records. Continue?')) return;

    await deleteObject.mutateAsync(objectId);
  };

  return <button onClick={handleDelete}>Delete Object</button>;
}
```

---

## Best Practices

### 1. Handle Loading and Error States

Always handle loading and error states in your components:

```tsx
const { data, isLoading, error } = useRecords(objectId);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### 2. Use Optimistic Updates (Advanced)

For better UX, update the UI before the server responds:

```tsx
const updateRecord = useUpdateRecord();

const handleUpdate = async (recordId: string, newData: any) => {
  // Optimistic update
  await updateRecord.mutateAsync(
    { recordId, data: newData },
    {
      onSuccess: () => {
        // Update was successful
      },
      onError: () => {
        // Rollback on error
      },
    }
  );
};
```

### 3. Combine Multiple Queries

Use multiple hooks in a single component:

```tsx
function RecordDetailPage({ recordId, objectId }: Props) {
  const { data: record, isLoading: recordLoading } = useRecord(recordId);
  const { data: object, isLoading: objectLoading } = useObject(objectId);

  if (recordLoading || objectLoading) return <Spinner />;

  return (
    <div>
      <h1>{object?.label}</h1>
      <h2>{record?.name}</h2>
    </div>
  );
}
```

### 4. Invalidate Queries Manually

If needed, manually invalidate queries:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { recordsKeys } from '@/hooks/useRecords';

function RefreshButton({ objectId }: { objectId: string }) {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: recordsKeys.list(objectId),
    });
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### 5. Global Error Handling

The API client already handles 401 errors globally. For custom error handling:

```tsx
const createRecord = useCreateRecord();

try {
  await createRecord.mutateAsync(data);
} catch (error: any) {
  if (error.status === 422) {
    // Validation errors
    console.log(error.errors);
  } else {
    // Other errors
    console.log(error.message);
  }
}
```

### 6. Disable Queries Conditionally

Prevent queries from running until conditions are met:

```tsx
// Only fetch if objectId exists
const { data } = useRecords(objectId, { page: 1 });
// enabled: !!objectId is already handled inside the hook

// For search, only run if query is not empty
const { data } = useSearchRecords(objectId, searchQuery);
// enabled: !!objectId && !!query is already handled
```

---

## Query Client Configuration

The QueryClient is configured in `src/app/App.tsx` with:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});
```

These defaults apply to all queries unless overridden in individual hooks.

---

## Troubleshooting

### Cache not updating after mutation

Make sure the mutation invalidates the correct queries:

```tsx
queryClient.invalidateQueries({
  queryKey: recordsKeys.list(objectId),
});
```

### Query not fetching

Check if the query is enabled:

```tsx
// This won't fetch if objectId is empty
const { data } = useRecords(objectId);
```

### Stale data showing

Adjust `staleTime` for specific queries:

```tsx
const { data } = useRecords(objectId, {
  staleTime: 0, // Always fresh
});
```

---

**Last Updated**: January 2026
**Version**: 1.0.0
