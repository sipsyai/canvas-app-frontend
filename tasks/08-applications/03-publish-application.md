# Task: Publish Application

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 02-create-application

---

## Objective

Kullanıcıların oluşturdukları application'ları yayınlayabilmesi (publish) ve yayından kaldırabilmesi (unpublish) için işlevsellik geliştirmek. Yayınlama öncesi validasyon (en az 1 object olmalı), onay dialogu ve yayın durumu gösterimi içerir.

---

## Backend API

### Endpoint
```
POST /api/applications/{app_id}/publish
```

### Path Parameters
| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| app_id | string | Application ID (app_xxxxxxxx) |

### Request Format
**Content-Type:** Yok (POST request, body gerekmez)

```typescript
// No request body needed
// Backend automatically sets published_at = NOW()
```

### Response
```json
{
  "id": "app_crm",
  "name": "CRM",
  "label": "Customer Relationship Management",
  "description": "Manage customer relationships",
  "icon": "briefcase",
  "config": {
    "objects": ["obj_contact", "obj_company"],
    "modules": ["contacts", "companies"]
  },
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T12:00:00Z",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "published_at": "2026-01-18T12:00:00Z"
}
```

**Response Fields:**
- `published_at` - Yayınlanma zamanı (NULL ise draft, timestamp varsa published)
- Diğer application fields (id, name, label, description, icon, config vb.)

### Error Responses
- `400 Bad Request` - Application yayınlanamaz (örn: object yok)
- `404 Not Found` - Application bulunamadı
- `401 Unauthorized` - JWT token eksik veya geçersiz
- `403 Forbidden` - Kullanıcı bu application'ı yayınlayamaz (creator değil)

**Backend Documentation:**
→ [POST /api/applications/{app_id}/publish](../../backend-docs/api/05-applications/03-publish-application.md)

---

## UI/UX Design

### Publish Button Location
Application detail sayfasında veya application listesinde:

```
┌────────────────────────────────────────────────────┐
│  CRM Application                    [⋮ Menu]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Status: 🟡 Draft                                  │
│                                                    │
│  Objects: 3                                        │
│  └─ Contact, Company, Opportunity                 │
│                                                    │
│  [Edit Application]  [Publish Application]        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Publish Confirmation Dialog
```
┌─────────────────────────────────────────────────┐
│  Publish Application?                    [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  You're about to publish "CRM Application".    │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✅ Pre-publish Validation                 │ │
│  │                                           │ │
│  │ ✓ Application name is valid              │ │
│  │ ✓ Has 3 objects (minimum 1 required)     │ │
│  │ ✓ Has configuration                      │ │
│  │ ✓ Ready to publish                       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Once published:                                │
│  • All users can view this application         │
│  • Application becomes production-ready         │
│  • Changes require republishing                 │
│                                                 │
│  Are you sure you want to publish?             │
│                                                 │
│              [Cancel]  [Publish Now]            │
└─────────────────────────────────────────────────┘
```

### Publish Validation Error Dialog
```
┌─────────────────────────────────────────────────┐
│  Cannot Publish Application           [X]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ❌ Pre-publish Validation Failed               │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ✗ No objects found                        │ │
│  │                                           │ │
│  │ Your application must have at least       │ │
│  │ 1 object before it can be published.      │ │
│  │                                           │ │
│  │ [Create Object]                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│                          [Close]                │
└─────────────────────────────────────────────────┘
```

### Published Application Status
```
┌────────────────────────────────────────────────────┐
│  CRM Application                    [⋮ Menu]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Status: ✅ Published                              │
│  Published: Jan 18, 2026 at 12:00 PM              │
│  Version: 1.0                                      │
│                                                    │
│  Objects: 3                                        │
│  └─ Contact, Company, Opportunity                 │
│                                                    │
│  [Edit Application]  [Unpublish]                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Unpublish Confirmation Dialog
```
┌─────────────────────────────────────────────────┐
│  Unpublish Application?                  [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  You're about to unpublish "CRM Application".  │
│                                                 │
│  ⚠️ Warning:                                    │
│  • Users will no longer see this application   │
│  • Application will be marked as draft         │
│  • You can republish anytime                   │
│                                                 │
│  Are you sure you want to unpublish?           │
│                                                 │
│              [Cancel]  [Unpublish]              │
└─────────────────────────────────────────────────┘
```

### Status Badge Component
```typescript
// Draft status
<Badge variant="warning">
  🟡 Draft
</Badge>

// Published status
<Badge variant="success">
  ✅ Published
</Badge>
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── applications/
│       ├── components/
│       │   ├── PublishDialog.tsx           ⭐ Publish confirmation dialog
│       │   ├── UnpublishDialog.tsx         ⭐ Unpublish confirmation dialog
│       │   ├── PublishValidation.tsx       ⭐ Pre-publish validation UI
│       │   ├── ApplicationStatus.tsx       ⭐ Status badge (draft/published)
│       │   └── PublishButton.tsx           ⭐ Publish/Unpublish button
│       ├── hooks/
│       │   ├── usePublishApplication.ts    ⭐ Publish mutation hook
│       │   ├── useUnpublishApplication.ts  ⭐ Unpublish mutation hook
│       │   └── useValidatePublish.ts       ⭐ Pre-publish validation hook
│       ├── types/
│       │   └── application.types.ts        ⭐ TypeScript types
│       └── utils/
│           └── publishValidation.ts        ⭐ Validation logic
├── lib/
│   └── api/
│       └── applications.api.ts             ⭐ API calls
└── components/
    └── ui/
        └── Badge.tsx                        ⭐ Status badge component
```

### Component Implementation

#### PublishDialog.tsx
```typescript
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PublishValidation } from './PublishValidation';
import { usePublishApplication } from '../hooks/usePublishApplication';
import { validatePublish } from '../utils/publishValidation';
import type { ApplicationResponse } from '../types/application.types';

interface PublishDialogProps {
  application: ApplicationResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: ApplicationResponse) => void;
}

export const PublishDialog = ({
  application,
  isOpen,
  onClose,
  onSuccess
}: PublishDialogProps) => {
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[],
    checks: {
      hasName: false,
      hasObjects: false,
      hasConfig: false,
    },
  });

  const { mutate: publish, isPending } = usePublishApplication();

  // Validate on mount and when application changes
  useEffect(() => {
    if (isOpen && application) {
      const result = validatePublish(application);
      setValidationResult(result);
    }
  }, [isOpen, application]);

  const handlePublish = () => {
    if (!validationResult.isValid) return;

    publish(application.id, {
      onSuccess: (data) => {
        onSuccess?.(data);
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Application?"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <p className="text-gray-700">
          You're about to publish{' '}
          <span className="font-semibold">"{application.label || application.name}"</span>.
        </p>

        {/* Validation Results */}
        <PublishValidation result={validationResult} />

        {/* Information Box */}
        {validationResult.isValid && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Once published:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• All users can view this application</li>
              <li>• Application becomes production-ready</li>
              <li>• Changes require republishing</li>
            </ul>
          </div>
        )}

        {/* Error Messages */}
        {!validationResult.isValid && validationResult.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Cannot publish:</h4>
            <ul className="space-y-1 text-sm text-red-800">
              {validationResult.errors.map((error, index) => (
                <li key={index}>✗ {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!validationResult.isValid || isPending}
            loading={isPending}
          >
            {isPending ? 'Publishing...' : 'Publish Now'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

#### UnpublishDialog.tsx
```typescript
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUnpublishApplication } from '../hooks/useUnpublishApplication';
import type { ApplicationResponse } from '../types/application.types';

interface UnpublishDialogProps {
  application: ApplicationResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: ApplicationResponse) => void;
}

export const UnpublishDialog = ({
  application,
  isOpen,
  onClose,
  onSuccess
}: UnpublishDialogProps) => {
  const { mutate: unpublish, isPending } = useUnpublishApplication();

  const handleUnpublish = () => {
    unpublish(application.id, {
      onSuccess: (data) => {
        onSuccess?.(data);
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unpublish Application?"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <p className="text-gray-700">
          You're about to unpublish{' '}
          <span className="font-semibold">"{application.label || application.name}"</span>.
        </p>

        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2">⚠️ Warning:</h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• Users will no longer see this application</li>
            <li>• Application will be marked as draft</li>
            <li>• You can republish anytime</li>
          </ul>
        </div>

        {/* Confirmation */}
        <p className="text-sm text-gray-600">
          Are you sure you want to unpublish?
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnpublish}
            disabled={isPending}
            loading={isPending}
          >
            {isPending ? 'Unpublishing...' : 'Unpublish'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

#### PublishValidation.tsx
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    hasName: boolean;
    hasObjects: boolean;
    hasConfig: boolean;
  };
}

interface PublishValidationProps {
  result: ValidationResult;
}

export const PublishValidation = ({ result }: PublishValidationProps) => {
  return (
    <div className={`
      border rounded-lg p-4
      ${result.isValid
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200'
      }
    `}>
      <h4 className={`
        font-semibold mb-3 flex items-center gap-2
        ${result.isValid ? 'text-green-900' : 'text-red-900'}
      `}>
        {result.isValid ? '✅' : '❌'} Pre-publish Validation
      </h4>

      <div className="space-y-2 text-sm">
        {/* Name Check */}
        <div className={`flex items-center gap-2 ${
          result.checks.hasName ? 'text-green-800' : 'text-red-800'
        }`}>
          <span>{result.checks.hasName ? '✓' : '✗'}</span>
          <span>Application name is valid</span>
        </div>

        {/* Objects Check */}
        <div className={`flex items-center gap-2 ${
          result.checks.hasObjects ? 'text-green-800' : 'text-red-800'
        }`}>
          <span>{result.checks.hasObjects ? '✓' : '✗'}</span>
          <span>Has objects (minimum 1 required)</span>
        </div>

        {/* Config Check */}
        <div className={`flex items-center gap-2 ${
          result.checks.hasConfig ? 'text-green-800' : 'text-red-800'
        }`}>
          <span>{result.checks.hasConfig ? '✓' : '✗'}</span>
          <span>Has configuration</span>
        </div>

        {/* Ready Status */}
        {result.isValid && (
          <div className="flex items-center gap-2 text-green-800 font-semibold mt-2 pt-2 border-t border-green-300">
            <span>✓</span>
            <span>Ready to publish</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### ApplicationStatus.tsx
```typescript
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ApplicationStatusProps {
  publishedAt: string | null;
  showTimestamp?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ApplicationStatus = ({
  publishedAt,
  showTimestamp = false,
  size = 'md'
}: ApplicationStatusProps) => {
  const isPublished = !!publishedAt;

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isPublished ? 'success' : 'warning'}
        size={size}
      >
        {isPublished ? '✅ Published' : '🟡 Draft'}
      </Badge>

      {isPublished && showTimestamp && publishedAt && (
        <span className="text-xs text-gray-500">
          Published{' '}
          {formatDistanceToNow(new Date(publishedAt), {
            addSuffix: true,
            locale: tr,
          })}
        </span>
      )}
    </div>
  );
};
```

#### PublishButton.tsx
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PublishDialog } from './PublishDialog';
import { UnpublishDialog } from './UnpublishDialog';
import type { ApplicationResponse } from '../types/application.types';

interface PublishButtonProps {
  application: ApplicationResponse;
  onSuccess?: (app: ApplicationResponse) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const PublishButton = ({
  application,
  onSuccess,
  variant = 'default',
  size = 'md'
}: PublishButtonProps) => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

  const isPublished = !!application.published_at;

  return (
    <>
      {isPublished ? (
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowUnpublishDialog(true)}
        >
          Unpublish
        </Button>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowPublishDialog(true)}
        >
          Publish Application
        </Button>
      )}

      <PublishDialog
        application={application}
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onSuccess={onSuccess}
      />

      <UnpublishDialog
        application={application}
        isOpen={showUnpublishDialog}
        onClose={() => setShowUnpublishDialog(false)}
        onSuccess={onSuccess}
      />
    </>
  );
};
```

#### publishValidation.ts
```typescript
import type { ApplicationResponse } from '../types/application.types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    hasName: boolean;
    hasObjects: boolean;
    hasConfig: boolean;
  };
}

export const validatePublish = (application: ApplicationResponse): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Has valid name
  const hasName = !!(application.name && application.name.trim().length > 0);
  if (!hasName) {
    errors.push('Application must have a name');
  }

  // Check 2: Has at least 1 object
  const objectCount = application.config?.objects?.length || 0;
  const hasObjects = objectCount > 0;
  if (!hasObjects) {
    errors.push('Application must have at least 1 object before publishing');
  }

  // Check 3: Has configuration
  const hasConfig = !!application.config;
  if (!hasConfig) {
    warnings.push('Application has no configuration');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    checks: {
      hasName,
      hasObjects,
      hasConfig,
    },
  };
};

/**
 * Quick check if application can be published
 */
export const canPublish = (application: ApplicationResponse): boolean => {
  const result = validatePublish(application);
  return result.isValid;
};
```

#### usePublishApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishApplicationAPI } from '@/lib/api/applications.api';
import { toast } from '@/hooks/useToast';

export const usePublishApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => publishApplicationAPI(appId),
    onSuccess: (data) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Update specific application cache
      queryClient.setQueryData(['application', data.id], data);

      // Show success message
      toast.success(`Application "${data.label || data.name}" published successfully!`);
    },
    onError: (error: any) => {
      console.error('Failed to publish application:', error);

      // Handle specific errors
      if (error.response?.status === 400) {
        toast.error('Cannot publish: Application validation failed.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to publish this application.');
      } else if (error.response?.status === 404) {
        toast.error('Application not found.');
      } else {
        toast.error('Failed to publish application. Please try again.');
      }
    },
  });
};
```

#### useUnpublishApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unpublishApplicationAPI } from '@/lib/api/applications.api';
import { toast } from '@/hooks/useToast';

export const useUnpublishApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => unpublishApplicationAPI(appId),
    onSuccess: (data) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Update specific application cache
      queryClient.setQueryData(['application', data.id], data);

      // Show success message
      toast.success(`Application "${data.label || data.name}" unpublished successfully!`);
    },
    onError: (error: any) => {
      console.error('Failed to unpublish application:', error);

      // Handle specific errors
      if (error.response?.status === 403) {
        toast.error('You do not have permission to unpublish this application.');
      } else if (error.response?.status === 404) {
        toast.error('Application not found.');
      } else {
        toast.error('Failed to unpublish application. Please try again.');
      }
    },
  });
};
```

#### applications.api.ts
```typescript
import { apiClient } from './client';
import type { ApplicationResponse } from '@/features/applications/types/application.types';

/**
 * Publish application
 * Sets published_at timestamp to NOW()
 */
export const publishApplicationAPI = async (appId: string): Promise<ApplicationResponse> => {
  const response = await apiClient.post<ApplicationResponse>(
    `/api/applications/${appId}/publish`
  );
  return response.data;
};

/**
 * Unpublish application
 * Sets published_at to NULL (draft mode)
 */
export const unpublishApplicationAPI = async (appId: string): Promise<ApplicationResponse> => {
  // Backend implements POST /api/applications/{app_id}/unpublish
  // Or use PATCH to set published_at to null
  const response = await apiClient.post<ApplicationResponse>(
    `/api/applications/${appId}/unpublish`
  );
  return response.data;
};
```

#### application.types.ts
```typescript
export interface ApplicationResponse {
  id: string;                    // app_xxxxxxxx
  name: string;                  // snake_case
  label: string | null;          // Display name
  description: string | null;
  icon: string | null;           // Icon name or emoji
  config: {                      // Application configuration (JSONB)
    modules?: string[];
    objects?: string[];          // Object IDs (obj_xxx)
    relationships?: string[];
  } | null;
  created_at: string;            // ISO datetime
  updated_at: string;            // ISO datetime
  created_by: string;            // User UUID
  published_at: string | null;  // ISO datetime (NULL = draft)
}

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    hasName: boolean;
    hasObjects: boolean;
    hasConfig: boolean;
  };
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `date-fns` - Date formatting
- `react-hook-form` - Form management (if needed)

### UI Components (To Be Built)
- `Modal` component
- `Button` component
- `Badge` component
- `Toast` component (for notifications)

---

## Acceptance Criteria

- [ ] Publish button görünüyor (draft application'larda)
- [ ] Unpublish button görünüyor (published application'larda)
- [ ] Publish butona tıklandığında onay dialogu açılıyor
- [ ] Pre-publish validation çalışıyor (en az 1 object kontrolü)
- [ ] Validation başarısız olursa hata mesajı gösteriliyor
- [ ] Validation başarılıysa "Publish Now" butonu aktif
- [ ] Publish işlemi başarılı olunca `published_at` timestamp set ediliyor
- [ ] Published application'da status badge "✅ Published" gösteriyor
- [ ] Unpublish butona tıklandığında onay dialogu açılıyor
- [ ] Unpublish işlemi başarılı olunca `published_at` NULL oluyor
- [ ] Draft application'da status badge "🟡 Draft" gösteriyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Success/error toast messages gösteriliyor
- [ ] Cache invalidation çalışıyor (application list güncelleniyor)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing - Publish Flow
- [ ] Draft application'da "Publish Application" butonu var
- [ ] Butona tıkla → Publish dialog açılıyor
- [ ] Validation checks görünüyor ve çalışıyor
- [ ] Object yoksa → Hata mesajı: "Must have at least 1 object"
- [ ] Object varsa → "✓ Has objects" yeşil check mark
- [ ] "Publish Now" butonu disabled (object yoksa)
- [ ] "Publish Now" butonu aktif (object varsa)
- [ ] Publish tıkla → Loading state
- [ ] Success → Dialog kapanıyor
- [ ] Success → Toast: "Application published successfully"
- [ ] Success → Status badge "✅ Published" oluyor
- [ ] Success → `published_at` timestamp set ediliyor

### Manual Testing - Unpublish Flow
- [ ] Published application'da "Unpublish" butonu var
- [ ] Butona tıkla → Unpublish dialog açılıyor
- [ ] Warning mesajı görünüyor
- [ ] "Unpublish" butonu tıklanınca → Loading state
- [ ] Success → Dialog kapanıyor
- [ ] Success → Toast: "Application unpublished successfully"
- [ ] Success → Status badge "🟡 Draft" oluyor
- [ ] Success → `published_at` NULL oluyor

### Edge Cases
- [ ] Backend 400 error → "Validation failed" toast
- [ ] Backend 403 error → "No permission" toast
- [ ] Backend 404 error → "Not found" toast
- [ ] Network error → Generic error toast
- [ ] Multiple rapid clicks → Single request (debounce)
- [ ] Dialog kapatma (Cancel) → Request iptal
- [ ] Object sayısı 0 → Validation fail
- [ ] Object sayısı 1+ → Validation pass

---

## Code Examples

### Complete Publish Flow
```typescript
// 1. User clicks "Publish Application" button
// 2. PublishDialog opens
// 3. Pre-publish validation runs:
//    - Check name exists
//    - Check has at least 1 object
//    - Check has config
// 4. If validation fails → Show errors, disable "Publish Now"
// 5. If validation passes → Enable "Publish Now"
// 6. User clicks "Publish Now"
// 7. API call: POST /api/applications/{app_id}/publish
// 8. Backend sets published_at = NOW()
// 9. Success → Close dialog
// 10. Show toast: "Application published successfully!"
// 11. Update cache (invalidate queries)
// 12. Status badge changes to "✅ Published"
```

### Complete Unpublish Flow
```typescript
// 1. User clicks "Unpublish" button
// 2. UnpublishDialog opens with warning
// 3. User confirms by clicking "Unpublish"
// 4. API call: POST /api/applications/{app_id}/unpublish
// 5. Backend sets published_at = NULL
// 6. Success → Close dialog
// 7. Show toast: "Application unpublished successfully!"
// 8. Update cache (invalidate queries)
// 9. Status badge changes to "🟡 Draft"
```

### Usage in Application Detail Page
```typescript
import { PublishButton } from '@/features/applications/components/PublishButton';
import { ApplicationStatus } from '@/features/applications/components/ApplicationStatus';

export const ApplicationDetailPage = () => {
  const { data: application } = useApplication(appId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{application.label}</h1>
          <ApplicationStatus
            publishedAt={application.published_at}
            showTimestamp
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Edit Application</Button>
          <PublishButton
            application={application}
            onSuccess={(updatedApp) => {
              // Handle success (optional)
              console.log('Published:', updatedApp);
            }}
          />
        </div>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Objects</h3>
          <p>{application.config?.objects?.length || 0} objects</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Modules</h3>
          <p>{application.config?.modules?.length || 0} modules</p>
        </div>
      </div>
    </div>
  );
};
```

### Validation Logic Example
```typescript
// Pre-publish validation
const application = {
  id: 'app_crm',
  name: 'CRM',
  config: {
    objects: [], // Empty!
  },
};

const result = validatePublish(application);
console.log(result);
// {
//   isValid: false,
//   errors: ['Application must have at least 1 object before publishing'],
//   warnings: [],
//   checks: {
//     hasName: true,
//     hasObjects: false,  ← Failed
//     hasConfig: true,
//   }
// }
```

---

## Resources

### Backend Documentation
- [POST /api/applications/{app_id}/publish](../../backend-docs/api/05-applications/03-publish-application.md) - Detailed endpoint documentation
- [Applications Overview](../../backend-docs/api/05-applications/README.md) - Application system overview

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching and caching
- [date-fns Docs](https://date-fns.org/) - Date formatting

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Publish Application task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/08-applications/03-publish-application.md

Requirements:
1. Create src/features/applications/components/PublishDialog.tsx - Publish confirmation dialog with validation
2. Create src/features/applications/components/UnpublishDialog.tsx - Unpublish confirmation dialog
3. Create src/features/applications/components/PublishValidation.tsx - Pre-publish validation UI component
4. Create src/features/applications/components/ApplicationStatus.tsx - Status badge (draft/published)
5. Create src/features/applications/components/PublishButton.tsx - Publish/Unpublish button with dialogs
6. Create src/features/applications/hooks/usePublishApplication.ts - TanStack Query mutation hook for publish
7. Create src/features/applications/hooks/useUnpublishApplication.ts - TanStack Query mutation hook for unpublish
8. Create src/features/applications/utils/publishValidation.ts - Validation logic (validatePublish function)
9. Update src/lib/api/applications.api.ts - Add publishApplicationAPI and unpublishApplicationAPI functions
10. Update src/features/applications/types/application.types.ts - Add PublishValidationResult type

CRITICAL REQUIREMENTS:
- Use POST /api/applications/{app_id}/publish endpoint (no body needed)
- Pre-publish validation: MUST have at least 1 object in config.objects array
- Show validation errors in dialog (cannot publish without objects)
- Show success validation checks (✓ has name, ✓ has objects, ✓ has config)
- Backend sets published_at timestamp automatically (NOW())
- Status badge: "🟡 Draft" (published_at is NULL) or "✅ Published" (published_at has timestamp)
- Unpublish button for published applications (sets published_at to NULL)
- Confirmation dialogs for both publish and unpublish actions
- Toast notifications for success/error states
- Cache invalidation after publish/unpublish (refresh application list)
- Handle 400 (validation failed), 403 (forbidden), 404 (not found) errors
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file. Use Turkish language for user-facing messages.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-delete-application.md
