# Task: Uygulama Oluşturma (Create Application)

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 01-application-list

---

## Objective

Kullanıcıların yeni uygulama oluşturabilmesi için wizard-style form eklemek. CRM, ITSM gibi hazır template'ler ile hızlı başlangıç imkanı sunmak.

---

## Backend API

### Endpoint
```
POST /api/applications
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface ApplicationCreateRequest {
  name: string;           // Uygulama adı (1-255 karakter)
  label?: string;         // Görünen ad
  description?: string;   // Açıklama
  icon?: string;         // Icon (emoji veya class name)
  config?: object;       // Uygulama konfigürasyonu
}
```

### Response
```json
{
  "id": "app_a1b2c3d4",
  "name": "CRM",
  "label": "Customer Relationship Management",
  "description": "Müşteri ilişkileri yönetimi",
  "icon": "🤝",
  "config": {
    "objects": ["obj_contact", "obj_company"]
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "published_at": null,
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Backend tarafından otomatik oluşturulan ID (app_xxxxxxxx formatında)
- `name` - Uygulama adı (zorunlu)
- `label` - Görünen ad (opsiyonel)
- `description` - Açıklama (opsiyonel)
- `icon` - Icon emoji veya class name (opsiyonel)
- `config` - JSONB konfigürasyon objesi (default: {})
- `published_at` - Yayın tarihi (null = taslak)

### Error Responses
- `401 Unauthorized` - Token geçersiz veya eksik
- `422 Unprocessable Entity` - Validation hatası
- `400 Bad Request` - Geçersiz istek formatı

**Backend Documentation:**
→ [POST /api/applications](../../backend-docs/api/05-applications/01-create-application.md)

---

## UI/UX Design

### Wizard Layout (3 Adım)
```
┌──────────────────────────────────────────┐
│  Yeni Uygulama Oluştur                   │
│  ═══════════════════════════════         │
│                                          │
│  [1 Bilgiler] → [2 Template] → [3 Önizleme] │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ ADIM 1: TEMEL BİLGİLER         │     │
│  │                                │     │
│  │  Uygulama Adı *                │     │
│  │  [input: CRM]                  │     │
│  │                                │     │
│  │  Görünen Ad                    │     │
│  │  [input: Müşteri Yönetimi]     │     │
│  │                                │     │
│  │  Açıklama                      │     │
│  │  [textarea]                    │     │
│  │                                │     │
│  │  Icon Seç                      │     │
│  │  [🤝] [📊] [🎯] [🔧] [📝]      │     │
│  │                                │     │
│  │  Renk Seç                      │     │
│  │  [●blue] [●red] [●green]       │     │
│  │                                │     │
│  │         [İptal]  [Sonraki →]   │     │
│  └────────────────────────────────┘     │
│                                          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  ADIM 2: TEMPLATE SEÇİMİ                 │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   🤝     │ │   🎫     │ │   📦     ││
│  │   CRM    │ │  ITSM    │ │  Özel    ││
│  │          │ │          │ │          ││
│  │ • Contact│ │ • Ticket │ │ Boş      ││
│  │ • Company│ │ • Asset  │ │ başlat   ││
│  │ • Deal   │ │ • User   │ │          ││
│  │ [Seç]    │ │ [Seç]    │ │ [Seç]    ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                          │
│         [← Geri]  [Sonraki →]            │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  ADIM 3: ÖNİZLEME VE OLUŞTUR             │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  🤝 CRM                        │     │
│  │  Müşteri Yönetimi              │     │
│  │                                │     │
│  │  Açıklama: Müşteri ilişkileri │     │
│  │  yönetim sistemi               │     │
│  │                                │     │
│  │  Nesneler:                     │     │
│  │  • Contact (Kişi)              │     │
│  │  • Company (Firma)             │     │
│  │  • Opportunity (Fırsat)        │     │
│  └────────────────────────────────┘     │
│                                          │
│         [← Geri]  [Oluştur]              │
└──────────────────────────────────────────┘
```

### Form Fields

#### Adım 1: Temel Bilgiler
1. **Uygulama Adı (name)** - Zorunlu
   - Type: text
   - Placeholder: "CRM, ITSM, Proje Yönetimi..."
   - Validation: 1-255 karakter, boşluk olabilir
   - Error: "Uygulama adı 1-255 karakter olmalıdır"

2. **Görünen Ad (label)** - Opsiyonel
   - Type: text
   - Placeholder: "Müşteri İlişkileri Yönetimi"
   - Auto-fill: Name girildiğinde otomatik önerilir

3. **Açıklama (description)** - Opsiyonel
   - Type: textarea
   - Placeholder: "Bu uygulama ne işe yarar?"
   - Max: 500 karakter

4. **Icon Seçici** - Opsiyonel
   - Hazır emoji listesi: 🤝📊🎯🔧📝💼🏢🎫📦🔔⚙️
   - Custom emoji girilebilir
   - Default: 📦

5. **Renk Seçici** - Opsiyonel
   - Preset colors: blue, red, green, yellow, purple, pink
   - Hex color picker
   - Default: blue (#3B82F6)

#### Adım 2: Template Seçimi
**3 Template Seçeneği:**

1. **CRM Template** 🤝
   - Contact (Kişi) object
   - Company (Firma) object
   - Opportunity (Satış Fırsatı) object
   - Sample fields pre-configured

2. **ITSM Template** 🎫
   - Ticket (Destek Talebi) object
   - Asset (Varlık) object
   - User (Kullanıcı) object
   - Sample fields pre-configured

3. **Özel/Boş** 📦
   - Hiç object yok
   - Kullanıcı sıfırdan oluşturur

#### Adım 3: Önizleme
- Seçilen bilgilerin özeti
- Template içeriği (nesneler)
- Düzenleme butonu (geri dön)
- Oluştur butonu

### States
- **Idle** - Form boş, ileri butonuna basılabilir
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Modal kapat, uygulama listesini yenile, success toast
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── applications/
│       ├── pages/
│       │   └── ApplicationsPage.tsx        (Mevcut)
│       ├── components/
│       │   ├── CreateApplicationModal.tsx  ⭐ Ana modal component
│       │   ├── CreateApplicationForm.tsx   ⭐ Wizard form (3 step)
│       │   ├── TemplateSelector.tsx        ⭐ Template seçim ekranı
│       │   ├── ApplicationPreview.tsx      ⭐ Önizleme ekranı
│       │   └── IconPicker.tsx              ⭐ Icon seçici component
│       ├── hooks/
│       │   └── useCreateApplication.ts     ⭐ TanStack Query hook
│       ├── types/
│       │   └── application.types.ts        ⭐ TypeScript types
│       └── constants/
│           └── templates.ts                ⭐ Template tanımları
├── lib/
│   └── api/
│       └── applications.api.ts             ⭐ API calls
└── components/
    └── ui/
        └── ColorPicker.tsx                 ⭐ Renk seçici component
```

### Component Implementation

#### CreateApplicationModal.tsx
```typescript
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { CreateApplicationForm } from './CreateApplicationForm';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateApplicationModal = ({ isOpen, onClose, onSuccess }: CreateApplicationModalProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Uygulama Oluştur"
      size="large"
    >
      <CreateApplicationForm
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
};
```

#### CreateApplicationForm.tsx
```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateApplication } from '../hooks/useCreateApplication';
import { TemplateSelector } from './TemplateSelector';
import { ApplicationPreview } from './ApplicationPreview';
import { IconPicker } from './IconPicker';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ApplicationTemplate } from '../types/application.types';

// Validation schema
const createApplicationSchema = z.object({
  name: z.string()
    .min(1, 'Uygulama adı zorunludur')
    .max(255, 'Uygulama adı en fazla 255 karakter olabilir'),
  label: z.string().optional(),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  template: z.enum(['crm', 'itsm', 'custom']).optional(),
});

type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

interface CreateApplicationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateApplicationForm = ({ onCancel, onSuccess }: CreateApplicationFormProps) => {
  const [step, setStep] = useState(1); // 1, 2, 3
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateApplicationFormData>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      icon: '📦',
      color: '#3B82F6',
      template: 'custom',
    },
  });

  const { mutate: createApplication, isPending } = useCreateApplication();

  const formData = watch();

  const onSubmit = (data: CreateApplicationFormData) => {
    // Template'den config oluştur
    const config = selectedTemplate ? {
      template: data.template,
      objects: selectedTemplate.objects.map(obj => obj.id),
    } : {};

    createApplication(
      {
        name: data.name,
        label: data.label,
        description: data.description,
        icon: data.icon,
        config,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Wizard Steps Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <StepIndicator step={1} currentStep={step} label="Bilgiler" />
        <div className="w-12 h-0.5 bg-gray-300" />
        <StepIndicator step={2} currentStep={step} label="Template" />
        <div className="w-12 h-0.5 bg-gray-300" />
        <StepIndicator step={3} currentStep={step} label="Önizleme" />
      </div>

      {/* Step 1: Temel Bilgiler */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uygulama Adı *
            </label>
            <Input
              type="text"
              placeholder="CRM, ITSM, Proje Yönetimi..."
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görünen Ad
            </label>
            <Input
              type="text"
              placeholder="Müşteri İlişkileri Yönetimi"
              {...register('label')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <Textarea
              placeholder="Bu uygulama ne işe yarar?"
              rows={3}
              {...register('description')}
              error={errors.description?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon Seç
            </label>
            <IconPicker
              value={formData.icon || '📦'}
              onChange={(icon) => setValue('icon', icon)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renk Seç
            </label>
            <ColorPicker
              value={formData.color || '#3B82F6'}
              onChange={(color) => setValue('color', color)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Template Seçimi */}
      {step === 2 && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setValue('template', template.id as any);
          }}
        />
      )}

      {/* Step 3: Önizleme */}
      {step === 3 && (
        <ApplicationPreview
          name={formData.name}
          label={formData.label}
          description={formData.description}
          icon={formData.icon}
          color={formData.color}
          template={selectedTemplate}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
        >
          {step === 1 ? 'İptal' : '← Geri'}
        </Button>

        {step < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && !formData.name}
          >
            Sonraki →
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
          </Button>
        )}
      </div>
    </form>
  );
};

// Step Indicator Component
const StepIndicator = ({ step, currentStep, label }: { step: number; currentStep: number; label: string }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          isActive
            ? 'bg-blue-600 text-white'
            : isCompleted
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isCompleted ? '✓' : step}
      </div>
      <span className="text-xs mt-1 text-gray-600">{label}</span>
    </div>
  );
};
```

#### TemplateSelector.tsx
```typescript
import { TEMPLATES } from '../constants/templates';
import type { ApplicationTemplate } from '../types/application.types';

interface TemplateSelectorProps {
  selectedTemplate: ApplicationTemplate | null;
  onSelectTemplate: (template: ApplicationTemplate) => void;
}

export const TemplateSelector = ({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Template Seç</h3>
      <p className="text-sm text-gray-600 mb-6">
        Hızlı başlamak için hazır template seçebilir veya sıfırdan oluşturabilirsiniz.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={() => onSelectTemplate(template)}
          />
        ))}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({
  template,
  isSelected,
  onSelect,
}: {
  template: ApplicationTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <div className="text-4xl mb-3 text-center">{template.icon}</div>
      <h4 className="text-lg font-semibold text-center mb-2">{template.name}</h4>
      <p className="text-sm text-gray-600 mb-4">{template.description}</p>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase">Nesneler:</p>
        {template.objects.map((obj) => (
          <div key={obj.id} className="text-sm text-gray-700">
            • {obj.name}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`w-full mt-4 py-2 rounded-md font-medium transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Seçildi ✓' : 'Seç'}
      </button>
    </div>
  );
};
```

#### ApplicationPreview.tsx
```typescript
import type { ApplicationTemplate } from '../types/application.types';

interface ApplicationPreviewProps {
  name: string;
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  template: ApplicationTemplate | null;
}

export const ApplicationPreview = ({
  name,
  label,
  description,
  icon,
  color,
  template,
}: ApplicationPreviewProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Önizleme</h3>
      <p className="text-sm text-gray-600 mb-6">
        Oluşturulmak üzere olan uygulamanın özeti:
      </p>

      <div className="border rounded-lg p-6 bg-gray-50">
        {/* App Header */}
        <div className="flex items-start space-x-4 mb-6">
          <div
            className="text-5xl w-16 h-16 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: color + '20' }}
          >
            {icon || '📦'}
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{name}</h4>
            {label && <p className="text-lg text-gray-600">{label}</p>}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-6">
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        )}

        {/* Template Objects */}
        {template && template.id !== 'custom' && (
          <div className="border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">
              Template: {template.name}
            </h5>
            <div className="space-y-2">
              {template.objects.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center space-x-2 text-sm bg-white rounded-md p-3 border"
                >
                  <span className="text-xl">{obj.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{obj.name}</p>
                    <p className="text-xs text-gray-500">{obj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {template?.id === 'custom' && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 italic">
              Özel uygulama - Nesneler sonra eklenecek
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### IconPicker.tsx
```typescript
interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const PRESET_ICONS = ['🤝', '📊', '🎯', '🔧', '📝', '💼', '🏢', '🎫', '📦', '🔔', '⚙️', '📈'];

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`text-3xl w-12 h-12 rounded-lg border-2 transition-all ${
              value === icon
                ? 'border-blue-600 bg-blue-50 scale-110'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">
          Veya özel emoji girin:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="😀"
          className="w-24 px-3 py-2 text-2xl text-center border rounded-md"
          maxLength={2}
        />
      </div>
    </div>
  );
};
```

#### templates.ts
```typescript
import type { ApplicationTemplate } from '../types/application.types';

export const TEMPLATES: ApplicationTemplate[] = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri İlişkileri Yönetimi',
    icon: '🤝',
    objects: [
      {
        id: 'contact',
        name: 'Kişi (Contact)',
        description: 'Müşteri kişileri',
        icon: '👤',
        fields: ['name', 'email', 'phone', 'company'],
      },
      {
        id: 'company',
        name: 'Firma (Company)',
        description: 'Müşteri firmaları',
        icon: '🏢',
        fields: ['name', 'industry', 'website', 'employees'],
      },
      {
        id: 'opportunity',
        name: 'Fırsat (Opportunity)',
        description: 'Satış fırsatları',
        icon: '💰',
        fields: ['name', 'amount', 'stage', 'close_date'],
      },
    ],
  },
  {
    id: 'itsm',
    name: 'ITSM',
    description: 'IT Hizmet Yönetimi',
    icon: '🎫',
    objects: [
      {
        id: 'ticket',
        name: 'Talep (Ticket)',
        description: 'Destek talepleri',
        icon: '🎫',
        fields: ['title', 'description', 'priority', 'status', 'assignee'],
      },
      {
        id: 'asset',
        name: 'Varlık (Asset)',
        description: 'IT varlıkları',
        icon: '💻',
        fields: ['name', 'type', 'serial_number', 'location'],
      },
      {
        id: 'user',
        name: 'Kullanıcı (User)',
        description: 'Sistem kullanıcıları',
        icon: '👨‍💼',
        fields: ['name', 'email', 'department', 'role'],
      },
    ],
  },
  {
    id: 'custom',
    name: 'Özel',
    description: 'Sıfırdan oluştur',
    icon: '📦',
    objects: [],
  },
];
```

#### useCreateApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplicationAPI } from '@/lib/api/applications.api';
import type { ApplicationCreateRequest } from '../types/application.types';
import { toast } from '@/components/ui/Toast';

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationCreateRequest) => {
      return await createApplicationAPI(data);
    },
    onSuccess: (data) => {
      // Invalidate applications query to refetch list
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Show success toast
      toast.success('Uygulama başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      console.error('Create application failed:', error);
      toast.error(error?.message || 'Uygulama oluşturulamadı');
    },
  });
};
```

#### applications.api.ts
```typescript
import { apiClient } from './client';
import type { ApplicationCreateRequest, ApplicationResponse } from '@/features/applications/types/application.types';

/**
 * Create new application
 * POST /api/applications
 */
export const createApplicationAPI = async (
  data: ApplicationCreateRequest
): Promise<ApplicationResponse> => {
  const response = await apiClient.post<ApplicationResponse>('/api/applications', data);
  return response.data;
};
```

#### application.types.ts (Update)
```typescript
// Existing types...

export interface ApplicationCreateRequest {
  name: string;           // Zorunlu: 1-255 karakter
  label?: string;         // Opsiyonel: Görünen ad
  description?: string;   // Opsiyonel: Açıklama
  icon?: string;         // Opsiyonel: Icon emoji
  config?: object;       // Opsiyonel: Konfigürasyon
}

export interface ApplicationTemplate {
  id: 'crm' | 'itsm' | 'custom';
  name: string;
  description: string;
  icon: string;
  objects: TemplateObject[];
}

export interface TemplateObject {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: string[];
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `axios` - HTTP client

### UI Components (To Be Built)
- `Dialog` component - Modal wrapper
- `ColorPicker` component - Renk seçici
- `Textarea` component - Çok satırlı input

---

## Acceptance Criteria

- [ ] Modal açılıyor ve 3 adımlı wizard görünüyor
- [ ] Adım 1: Temel bilgiler formu çalışıyor (name, label, description, icon, color)
- [ ] Adım 2: Template seçimi çalışıyor (CRM, ITSM, Özel)
- [ ] Adım 3: Önizleme doğru bilgileri gösteriyor
- [ ] Form validation çalışıyor (name zorunlu, description max 500 char)
- [ ] Icon picker çalışıyor (preset + custom emoji)
- [ ] Color picker çalışıyor (preset + hex input)
- [ ] Template seçimi preview'a yansıyor
- [ ] POST /api/applications API call doğru formatta
- [ ] Başarılı oluşturma sonrası modal kapanıyor
- [ ] Başarılı oluşturma sonrası uygulama listesi yenileniyor
- [ ] Success toast gösteriliyor
- [ ] Error handling çalışıyor (401, 422, 400)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Cancel butonu modal'ı kapatıyor
- [ ] Wizard step navigation (ileri/geri) çalışıyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing

#### Form Validation
- [ ] Boş name ile submit → validation error
- [ ] 256+ karakter name → validation error
- [ ] 501+ karakter description → validation error
- [ ] Geçerli form → success

#### Template Selection
- [ ] CRM template seç → 3 object görünüyor (Contact, Company, Opportunity)
- [ ] ITSM template seç → 3 object görünüyor (Ticket, Asset, User)
- [ ] Özel seç → object yok, "sonra eklenecek" mesajı
- [ ] Template değiştir → preview güncelleniyor

#### Icon & Color Picker
- [ ] Preset icon seç → seçili ikon değişiyor
- [ ] Custom emoji gir → ikon değişiyor
- [ ] Preset color seç → renk değişiyor
- [ ] Preview'da icon ve renk doğru görünüyor

#### API Integration
- [ ] Geçerli form gönder → 201 Created
- [ ] Response'da app_xxxxxxxx ID var
- [ ] Token eksik → 401 error
- [ ] Invalid data → 422 error
- [ ] Network error → error toast

#### UI/UX
- [ ] Step 1 → Step 2 navigation
- [ ] Step 2 → Step 3 navigation
- [ ] Geri butonları çalışıyor
- [ ] Loading state görünüyor
- [ ] Success toast görünüyor
- [ ] Modal kapatma çalışıyor
- [ ] Uygulama listesi yenileniyor

---

## Code Examples

### Complete Create Flow
```typescript
// 1. User clicks "Yeni Uygulama" button in ApplicationsPage
// 2. CreateApplicationModal opens
// 3. Step 1: User enters name, label, description, selects icon and color
// 4. Step 2: User selects template (CRM, ITSM, or Custom)
// 5. Step 3: User reviews preview
// 6. User clicks "Oluştur"
// 7. useCreateApplication hook calls createApplicationAPI
// 8. API returns app_xxxxxxxx ID
// 9. Success toast shown
// 10. Modal closes
// 11. Applications list refetches and shows new app
```

### Error Handling
```typescript
// useCreateApplication.ts
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationCreateRequest) => {
      try {
        return await createApplicationAPI(data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        }
        if (error.response?.status === 422) {
          throw new Error('Form bilgileri geçersiz. Lütfen kontrol edin.');
        }
        if (error.response?.status === 400) {
          throw new Error('Geçersiz istek. Lütfen bilgileri kontrol edin.');
        }
        throw new Error('Uygulama oluşturulamadı. Lütfen tekrar deneyin.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success(`${data.name} uygulaması oluşturuldu!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
```

### Integration with ApplicationsPage
```typescript
// ApplicationsPage.tsx
export const ApplicationsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    // Query automatically refetches via invalidateQueries
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Uygulamalarım</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Yeni Uygulama
        </Button>
      </div>

      <ApplicationList />

      <CreateApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
```

---

## Resources

### Backend Documentation
- [POST /api/applications](../../backend-docs/api/05-applications/01-create-application.md) - Detailed endpoint documentation
- [Applications Overview](../../backend-docs/api/05-applications/README.md) - Applications API overview

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

### Design References
- Multi-step wizard pattern
- Template selection UI
- Icon and color picker components

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Create Application feature exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/08-applications/02-create-application.md

Requirements:
1. Create src/features/applications/components/CreateApplicationModal.tsx - Main modal wrapper
2. Create src/features/applications/components/CreateApplicationForm.tsx - 3-step wizard form (Bilgiler → Template → Önizleme)
3. Create src/features/applications/components/TemplateSelector.tsx - Template selection screen (CRM, ITSM, Custom)
4. Create src/features/applications/components/ApplicationPreview.tsx - Preview screen showing app summary
5. Create src/features/applications/components/IconPicker.tsx - Icon picker with preset emojis + custom input
6. Create src/features/applications/hooks/useCreateApplication.ts - TanStack Query mutation hook
7. Create src/features/applications/constants/templates.ts - Template definitions (CRM, ITSM, Custom)
8. Update src/features/applications/types/application.types.ts - Add ApplicationCreateRequest, ApplicationTemplate types
9. Update src/lib/api/applications.api.ts - Add createApplicationAPI function
10. Create src/components/ui/ColorPicker.tsx - Color picker component (preset + hex input)
11. Update src/features/applications/pages/ApplicationsPage.tsx - Add "Yeni Uygulama" button + modal integration

CRITICAL REQUIREMENTS:
- 3-step wizard: Bilgiler → Template → Önizleme
- Step 1: name (required, 1-255 chars), label, description (max 500 chars), icon picker, color picker
- Step 2: Template selection (CRM with Contact/Company/Opportunity, ITSM with Ticket/Asset/User, Custom with no objects)
- Step 3: Preview showing all selected data + template objects
- POST /api/applications with JSON body: {name, label?, description?, icon?, config?}
- Backend auto-generates app_xxxxxxxx ID
- After success: close modal, refetch applications list, show success toast
- Error handling: 401 (unauthorized), 422 (validation), 400 (bad request)
- Loading state on submit button
- Cancel button closes modal
- Navigation: Geri (back) and Sonraki/Oluştur (next/create) buttons
- Mobile responsive design with Tailwind CSS

CRM Template:
- Contact (Kişi) 👤: name, email, phone, company
- Company (Firma) 🏢: name, industry, website, employees
- Opportunity (Fırsat) 💰: name, amount, stage, close_date

ITSM Template:
- Ticket (Talep) 🎫: title, description, priority, status, assignee
- Asset (Varlık) 💻: name, type, serial_number, location
- User (Kullanıcı) 👨‍💼: name, email, department, role

Follow the exact code examples and file structure provided in the task file.
Use Turkish language for all UI text.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-application-detail.md
