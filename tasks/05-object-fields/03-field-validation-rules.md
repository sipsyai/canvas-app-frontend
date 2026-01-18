# Task: Field Validation Rules (Alan Doğrulama Kuralları)

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 01-add-field-to-object.md

---

## Objective

Object field'lara validation kuralları ekleme ve özelleştirme özelliği geliştirmek. No-code kullanıcıların kod yazmadan alan doğrulama kuralları tanımlayabilmesi için görsel rule builder UI oluşturmak.

---

## Backend API

### Endpoint
```
PATCH /api/object-fields/{object_field_id}
```

### Request Format
```typescript
interface UpdateFieldValidationRequest {
  validation_rules: {
    // Temel Kurallar
    is_required?: boolean;              // Alan zorunlu mu?
    is_unique?: boolean;                // Alan benzersiz olmalı mı?
    default_value?: any;                // Varsayılan değer

    // Text/Email Field Kuralları
    min_length?: number;                // Minimum karakter sayısı
    max_length?: number;                // Maximum karakter sayısı
    pattern?: string;                   // Regex pattern (örn: "^[A-Z]{3}$")

    // Number Field Kuralları
    min?: number;                       // Minimum değer
    max?: number;                       // Maximum değer
    step?: number;                      // Artış miktarı (örn: 0.01, 5, 10)

    // Select/Multiselect Field Kuralları
    allowed_values?: string[];          // İzin verilen değerler
    min_selections?: number;            // Minimum seçim sayısı (multiselect)
    max_selections?: number;            // Maximum seçim sayısı (multiselect)

    // Date Field Kuralları
    min_date?: string;                  // Minimum tarih (ISO format)
    max_date?: string;                  // Maximum tarih (ISO format)

    // Custom Error Messages
    error_messages?: {
      required?: string;                // "Bu alan zorunludur"
      unique?: string;                  // "Bu değer zaten kullanılıyor"
      min_length?: string;              // "En az 5 karakter olmalı"
      max_length?: string;              // "En fazla 100 karakter olabilir"
      pattern?: string;                 // "Geçersiz format"
      min?: string;                     // "En az 0 olmalı"
      max?: string;                     // "En fazla 100 olabilir"
      min_date?: string;                // "2024-01-01'den sonra olmalı"
      max_date?: string;                // "2025-12-31'den önce olmalı"
    };
  };
}
```

### Response
```json
{
  "id": 1,
  "object_id": 1,
  "field_name": "email",
  "field_type": "email",
  "validation_rules": {
    "is_required": true,
    "is_unique": true,
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "error_messages": {
      "required": "E-posta adresi zorunludur",
      "unique": "Bu e-posta adresi zaten kullanılıyor",
      "pattern": "Geçerli bir e-posta adresi girin"
    }
  },
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Error Responses
- `404 Not Found` - Field bulunamadı
- `422 Unprocessable Entity` - Geçersiz validation kuralları
- `403 Forbidden` - Bu field'ı düzenleme izniniz yok

**Backend Documentation:**
→ [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/05-object-fields/03-update-field-validation.md)

---

## UI/UX Design

### Validation Rules Builder (No-Code UI)
```
┌────────────────────────────────────────────────────────────┐
│  Field: Email                                              │
│  Type: Email                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ⚙️ TEMEL KURALLAR                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ☑ Bu alan zorunludur (Required)                     │ │
│  │  ☑ Benzersiz olmalı (Unique)                         │ │
│  │                                                       │ │
│  │  Varsayılan Değer (Optional)                         │ │
│  │  [___________________________________]                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  📏 KARAKTER KURALLARI                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Minimum Uzunluk                                      │ │
│  │  [5___] karakter                                      │ │
│  │                                                       │ │
│  │  Maximum Uzunluk                                      │ │
│  │  [100_] karakter                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  🎯 FORMAT KURALLARI                                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Regex Pattern (Advanced)                             │ │
│  │  [^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$_] │ │
│  │                                                       │ │
│  │  📋 Yaygın Formatlar (Quick Select):                 │ │
│  │  • Email Format                                       │ │
│  │  • Phone Number (TR)                                  │ │
│  │  • URL                                                │ │
│  │  • Alphanumeric Only                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  💬 HATA MESAJLARI                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Required Error:                                      │ │
│  │  [E-posta adresi zorunludur_______________]          │ │
│  │                                                       │ │
│  │  Unique Error:                                        │ │
│  │  [Bu e-posta adresi zaten kullanılıyor___]          │ │
│  │                                                       │ │
│  │  Format Error:                                        │ │
│  │  [Geçerli bir e-posta adresi girin________]          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  🔍 ÖNIZLEME (Real-time Validation)                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Test Value:  [test@example.com_________]            │ │
│  │  ✅ Geçerli (Tüm kuralları karşılıyor)               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Cancel]                          [Save Validation Rules] │
└────────────────────────────────────────────────────────────┘
```

### Number Field Rules
```
┌────────────────────────────────────────────────────────────┐
│  Field: Price                                              │
│  Type: Number                                              │
├────────────────────────────────────────────────────────────┤
│  🔢 SAYISAL KURALLAR                                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Minimum Değer                                        │ │
│  │  [0_______] (Negatif değer girilemesin)              │ │
│  │                                                       │ │
│  │  Maximum Değer                                        │ │
│  │  [999999__]                                           │ │
│  │                                                       │ │
│  │  Artış Miktarı (Step)                                 │ │
│  │  [0.01____] (Kuruş hassasiyeti için)                 │ │
│  │                                                       │ │
│  │  Varsayılan Değer                                     │ │
│  │  [0.00____]                                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  🔍 ÖNIZLEME                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Test Value:  [150.50_]                              │ │
│  │  ✅ Geçerli (0 ile 999999 arasında, 0.01 step)       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Select/Multiselect Field Rules
```
┌────────────────────────────────────────────────────────────┐
│  Field: Tags                                               │
│  Type: Multiselect                                         │
├────────────────────────────────────────────────────────────┤
│  📋 SEÇİM KURALLARI                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  İzin Verilen Değerler:                               │ │
│  │  ✓ Frontend                                           │ │
│  │  ✓ Backend                                            │ │
│  │  ✓ DevOps                                             │ │
│  │  ✓ Design                                             │ │
│  │  + Yeni seçenek ekle                                  │ │
│  │                                                       │ │
│  │  Minimum Seçim Sayısı                                 │ │
│  │  [1_] (En az 1 tag seçilmeli)                        │ │
│  │                                                       │ │
│  │  Maximum Seçim Sayısı                                 │ │
│  │  [5_] (En fazla 5 tag seçilebilir)                   │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Date Field Rules
```
┌────────────────────────────────────────────────────────────┐
│  Field: Birth Date                                         │
│  Type: Date                                                │
├────────────────────────────────────────────────────────────┤
│  📅 TARİH KURALLARI                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Minimum Tarih                                        │ │
│  │  [📅 1900-01-01] (100 yaşından büyük olmasın)        │ │
│  │                                                       │ │
│  │  Maximum Tarih                                        │ │
│  │  [📅 2006-01-01] (18 yaşından küçük olmasın)         │ │
│  │                                                       │ │
│  │  Hızlı Seçenekler:                                    │ │
│  │  • Bugünden sonra (min_date: today)                  │ │
│  │  • Bugünden önce (max_date: today)                   │ │
│  │  • Son 30 gün                                         │ │
│  │  • Gelecek 7 gün                                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── object-fields/
│       ├── components/
│       │   ├── ValidationRulesForm.tsx         ⭐ Main validation form
│       │   ├── rules/
│       │   │   ├── BasicRules.tsx             ⭐ Required, Unique, Default
│       │   │   ├── TextRules.tsx              ⭐ Min/Max length, Pattern
│       │   │   ├── NumberRules.tsx            ⭐ Min/Max value, Step
│       │   │   ├── SelectRules.tsx            ⭐ Allowed values, Min/Max selections
│       │   │   └── DateRules.tsx              ⭐ Min/Max date
│       │   ├── ValidationPreview.tsx          ⭐ Real-time validation test
│       │   ├── ErrorMessageEditor.tsx         ⭐ Custom error messages
│       │   └── CommonPatterns.tsx             ⭐ Predefined regex patterns
│       ├── hooks/
│       │   ├── useUpdateFieldValidation.ts    ⭐ TanStack Query mutation
│       │   └── useValidationPreview.ts        ⭐ Real-time validation hook
│       ├── utils/
│       │   ├── validationRules.ts             ⭐ Validation logic
│       │   └── commonPatterns.ts              ⭐ Regex pattern library
│       └── types/
│           └── validation.types.ts            ⭐ TypeScript types
├── lib/
│   └── api/
│       └── object-fields.api.ts               ⭐ API calls (updateFieldValidation)
└── components/
    └── ui/
        ├── RegexInput.tsx                     ⭐ Regex input with syntax highlight
        └── ValidationBadge.tsx                ⭐ Visual validation status
```

### Component Implementation

#### ValidationRulesForm.tsx
```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateFieldValidation } from '../hooks/useUpdateFieldValidation';
import { BasicRules } from './rules/BasicRules';
import { TextRules } from './rules/TextRules';
import { NumberRules } from './rules/NumberRules';
import { SelectRules } from './rules/SelectRules';
import { DateRules } from './rules/DateRules';
import { ValidationPreview } from './ValidationPreview';
import { ErrorMessageEditor } from './ErrorMessageEditor';
import { Button } from '@/components/ui/Button';

const validationSchema = z.object({
  is_required: z.boolean().optional(),
  is_unique: z.boolean().optional(),
  default_value: z.any().optional(),
  min_length: z.number().min(0).optional(),
  max_length: z.number().min(0).optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().min(0).optional(),
  allowed_values: z.array(z.string()).optional(),
  min_selections: z.number().min(0).optional(),
  max_selections: z.number().min(0).optional(),
  min_date: z.string().optional(),
  max_date: z.string().optional(),
  error_messages: z.object({
    required: z.string().optional(),
    unique: z.string().optional(),
    min_length: z.string().optional(),
    max_length: z.string().optional(),
    pattern: z.string().optional(),
    min: z.string().optional(),
    max: z.string().optional(),
    min_date: z.string().optional(),
    max_date: z.string().optional(),
  }).optional(),
});

type ValidationRulesData = z.infer<typeof validationSchema>;

interface ValidationRulesFormProps {
  fieldId: number;
  fieldType: 'text' | 'number' | 'email' | 'select' | 'multiselect' | 'date';
  currentRules?: ValidationRulesData;
  onClose: () => void;
}

export const ValidationRulesForm = ({
  fieldId,
  fieldType,
  currentRules,
  onClose,
}: ValidationRulesFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ValidationRulesData>({
    resolver: zodResolver(validationSchema),
    defaultValues: currentRules,
  });

  const { mutate: updateValidation, isPending } = useUpdateFieldValidation();

  const watchedRules = watch();

  const onSubmit = (data: ValidationRulesData) => {
    updateValidation(
      {
        fieldId,
        validation_rules: data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Doğrulama Kuralları</h2>
        <p className="text-sm text-gray-600 mt-1">
          Field Type: <span className="font-semibold">{fieldType}</span>
        </p>
      </div>

      {/* Temel Kurallar (Tüm field tipleri için) */}
      <BasicRules register={register} watch={watch} setValue={setValue} />

      {/* Field tipine göre özel kurallar */}
      {(fieldType === 'text' || fieldType === 'email') && (
        <TextRules
          register={register}
          watch={watch}
          setValue={setValue}
          fieldType={fieldType}
        />
      )}

      {fieldType === 'number' && (
        <NumberRules register={register} watch={watch} setValue={setValue} />
      )}

      {(fieldType === 'select' || fieldType === 'multiselect') && (
        <SelectRules
          register={register}
          watch={watch}
          setValue={setValue}
          isMulti={fieldType === 'multiselect'}
        />
      )}

      {fieldType === 'date' && (
        <DateRules register={register} watch={watch} setValue={setValue} />
      )}

      {/* Hata Mesajları */}
      <ErrorMessageEditor
        register={register}
        fieldType={fieldType}
        rules={watchedRules}
      />

      {/* Real-time Preview */}
      <ValidationPreview
        fieldType={fieldType}
        rules={watchedRules}
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          Kuralları Kaydet
        </Button>
      </div>
    </form>
  );
};
```

#### BasicRules.tsx
```typescript
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';

interface BasicRulesProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const BasicRules = ({ register, watch, setValue }: BasicRulesProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">⚙️</span>
        Temel Kurallar
      </h3>

      <div className="space-y-3">
        <div className="flex items-center">
          <Checkbox
            {...register('is_required')}
            id="is_required"
          />
          <label htmlFor="is_required" className="ml-2 text-sm font-medium text-gray-700">
            Bu alan zorunludur (Required)
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            {...register('is_unique')}
            id="is_unique"
          />
          <label htmlFor="is_unique" className="ml-2 text-sm font-medium text-gray-700">
            Benzersiz olmalı (Unique)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Varsayılan Değer (Optional)
          </label>
          <Input
            {...register('default_value')}
            placeholder="Boş bırakılabilir"
          />
          <p className="text-xs text-gray-500 mt-1">
            Yeni kayıtlar için otomatik atanacak değer
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### TextRules.tsx
```typescript
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { CommonPatterns } from '../CommonPatterns';

interface TextRulesProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  fieldType: 'text' | 'email';
}

export const TextRules = ({ register, watch, setValue, fieldType }: TextRulesProps) => {
  return (
    <>
      {/* Karakter Kuralları */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📏</span>
          Karakter Kuralları
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Uzunluk
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                {...register('min_length', { valueAsNumber: true })}
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-gray-600">karakter</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Uzunluk
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                {...register('max_length', { valueAsNumber: true })}
                placeholder="Sınırsız"
                min={0}
              />
              <span className="text-sm text-gray-600">karakter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Format Kuralları */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Format Kuralları
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regex Pattern (İleri Düzey)
          </label>
          <Input
            {...register('pattern')}
            placeholder="^[a-zA-Z0-9]+$"
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            JavaScript regex formatında (örn: ^[A-Z]{3}$ → 3 büyük harf)
          </p>
        </div>

        {/* Yaygın Formatlar */}
        <CommonPatterns
          onSelect={(pattern) => setValue('pattern', pattern)}
          fieldType={fieldType}
        />
      </div>
    </>
  );
};
```

#### NumberRules.tsx
```typescript
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface NumberRulesProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const NumberRules = ({ register, watch, setValue }: NumberRulesProps) => {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🔢</span>
        Sayısal Kurallar
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Değer
            </label>
            <Input
              type="number"
              {...register('min', { valueAsNumber: true })}
              placeholder="Sınırsız"
              step="any"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Değer
            </label>
            <Input
              type="number"
              {...register('max', { valueAsNumber: true })}
              placeholder="Sınırsız"
              step="any"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Artış Miktarı (Step)
          </label>
          <Input
            type="number"
            {...register('step', { valueAsNumber: true })}
            placeholder="1"
            min={0}
            step="any"
          />
          <p className="text-xs text-gray-500 mt-1">
            Örn: 0.01 (kuruş hassasiyeti), 5 (5'er artış), 10 (10'ar artış)
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Hızlı Ayarlar:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setValue('min', 0);
                setValue('max', 100);
                setValue('step', 1);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              0-100 (Yüzde)
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('min', 0);
                setValue('step', 0.01);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Pozitif Para
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('min', 1);
                setValue('step', 1);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Pozitif Tam Sayı
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### SelectRules.tsx
```typescript
import { useState } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SelectRulesProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isMulti: boolean;
}

export const SelectRules = ({ register, watch, setValue, isMulti }: SelectRulesProps) => {
  const [newOption, setNewOption] = useState('');
  const allowedValues = watch('allowed_values') || [];

  const addOption = () => {
    if (newOption.trim() && !allowedValues.includes(newOption.trim())) {
      setValue('allowed_values', [...allowedValues, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setValue('allowed_values', allowedValues.filter((v: string) => v !== option));
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📋</span>
        Seçim Kuralları
      </h3>

      <div className="space-y-4">
        {/* Allowed Values */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İzin Verilen Değerler
          </label>

          {/* Existing options */}
          <div className="space-y-2 mb-3">
            {allowedValues.map((option: string) => (
              <div
                key={option}
                className="flex items-center justify-between bg-white p-2 rounded border"
              >
                <span className="text-sm">{option}</span>
                <button
                  type="button"
                  onClick={() => removeOption(option)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new option */}
          <div className="flex space-x-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Yeni seçenek ekle"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button
              type="button"
              onClick={addOption}
              variant="outline"
            >
              Ekle
            </Button>
          </div>
        </div>

        {/* Min/Max selections (for multiselect) */}
        {isMulti && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Seçim Sayısı
              </label>
              <Input
                type="number"
                {...register('min_selections', { valueAsNumber: true })}
                placeholder="0"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Seçim Sayısı
              </label>
              <Input
                type="number"
                {...register('max_selections', { valueAsNumber: true })}
                placeholder="Sınırsız"
                min={0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### DateRules.tsx
```typescript
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface DateRulesProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const DateRules = ({ register, watch, setValue }: DateRulesProps) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-indigo-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📅</span>
        Tarih Kuralları
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Tarih
            </label>
            <Input
              type="date"
              {...register('min_date')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Tarih
            </label>
            <Input
              type="date"
              {...register('max_date')}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Hızlı Ayarlar:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setValue('min_date', today)}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Bugünden sonra
            </button>
            <button
              type="button"
              onClick={() => setValue('max_date', today)}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Bugünden önce
            </button>
            <button
              type="button"
              onClick={() => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                setValue('min_date', thirtyDaysAgo.toISOString().split('T')[0]);
                setValue('max_date', today);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Son 30 gün
            </button>
            <button
              type="button"
              onClick={() => {
                const sevenDaysLater = new Date();
                sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
                setValue('min_date', today);
                setValue('max_date', sevenDaysLater.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Gelecek 7 gün
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### ValidationPreview.tsx
```typescript
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { useValidationPreview } from '../hooks/useValidationPreview';
import { ValidationBadge } from '@/components/ui/ValidationBadge';

interface ValidationPreviewProps {
  fieldType: string;
  rules: any;
}

export const ValidationPreview = ({ fieldType, rules }: ValidationPreviewProps) => {
  const [testValue, setTestValue] = useState('');
  const { validate, errors, isValid } = useValidationPreview(fieldType, rules);

  const handleChange = (value: string) => {
    setTestValue(value);
    validate(value);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🔍</span>
        Önizleme (Real-time Validation)
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Değeri
          </label>
          <Input
            type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
            value={testValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Bir değer girin ve kuralları test edin"
          />
        </div>

        {/* Validation Result */}
        {testValue && (
          <div className="bg-white p-3 rounded border">
            <ValidationBadge isValid={isValid} />

            {errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-start">
                    <span className="mr-2">❌</span>
                    {error}
                  </li>
                ))}
              </ul>
            )}

            {isValid && (
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <span className="mr-2">✅</span>
                Tüm kuralları karşılıyor
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### ErrorMessageEditor.tsx
```typescript
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface ErrorMessageEditorProps {
  register: UseFormRegister<any>;
  fieldType: string;
  rules: any;
}

export const ErrorMessageEditor = ({ register, fieldType, rules }: ErrorMessageEditorProps) => {
  return (
    <div className="bg-red-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💬</span>
        Özel Hata Mesajları
      </h3>

      <div className="space-y-3">
        {rules.is_required && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Error Mesajı
            </label>
            <Input
              {...register('error_messages.required')}
              placeholder="Bu alan zorunludur"
            />
          </div>
        )}

        {rules.is_unique && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unique Error Mesajı
            </label>
            <Input
              {...register('error_messages.unique')}
              placeholder="Bu değer zaten kullanılıyor"
            />
          </div>
        )}

        {(fieldType === 'text' || fieldType === 'email') && (
          <>
            {rules.min_length && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Length Error
                </label>
                <Input
                  {...register('error_messages.min_length')}
                  placeholder={`En az ${rules.min_length} karakter olmalı`}
                />
              </div>
            )}

            {rules.max_length && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Length Error
                </label>
                <Input
                  {...register('error_messages.max_length')}
                  placeholder={`En fazla ${rules.max_length} karakter olabilir`}
                />
              </div>
            )}

            {rules.pattern && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern Error
                </label>
                <Input
                  {...register('error_messages.pattern')}
                  placeholder="Geçersiz format"
                />
              </div>
            )}
          </>
        )}

        {fieldType === 'number' && (
          <>
            {rules.min !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value Error
                </label>
                <Input
                  {...register('error_messages.min')}
                  placeholder={`En az ${rules.min} olmalı`}
                />
              </div>
            )}

            {rules.max !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value Error
                </label>
                <Input
                  {...register('error_messages.max')}
                  placeholder={`En fazla ${rules.max} olabilir`}
                />
              </div>
            )}
          </>
        )}

        {fieldType === 'date' && (
          <>
            {rules.min_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Date Error
                </label>
                <Input
                  {...register('error_messages.min_date')}
                  placeholder={`${rules.min_date} tarihinden sonra olmalı`}
                />
              </div>
            )}

            {rules.max_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Date Error
                </label>
                <Input
                  {...register('error_messages.max_date')}
                  placeholder={`${rules.max_date} tarihinden önce olmalı`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
```

#### CommonPatterns.tsx
```typescript
import { COMMON_PATTERNS } from '../utils/commonPatterns';
import { Button } from '@/components/ui/Button';

interface CommonPatternsProps {
  onSelect: (pattern: string) => void;
  fieldType: 'text' | 'email';
}

export const CommonPatterns = ({ onSelect, fieldType }: CommonPatternsProps) => {
  const patterns = COMMON_PATTERNS[fieldType] || [];

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        📋 Yaygın Formatlar (Hızlı Seçim):
      </p>
      <div className="space-y-2">
        {patterns.map((pattern) => (
          <button
            key={pattern.name}
            type="button"
            onClick={() => onSelect(pattern.regex)}
            className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{pattern.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pattern.description}</p>
              </div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {pattern.example}
              </code>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### useUpdateFieldValidation.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFieldValidation } from '@/lib/api/object-fields.api';
import { toast } from 'sonner';

interface UpdateFieldValidationParams {
  fieldId: number;
  validation_rules: {
    is_required?: boolean;
    is_unique?: boolean;
    default_value?: any;
    min_length?: number;
    max_length?: number;
    pattern?: string;
    min?: number;
    max?: number;
    step?: number;
    allowed_values?: string[];
    min_selections?: number;
    max_selections?: number;
    min_date?: string;
    max_date?: string;
    error_messages?: Record<string, string>;
  };
}

export const useUpdateFieldValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, validation_rules }: UpdateFieldValidationParams) => {
      return await updateFieldValidation(fieldId, validation_rules);
    },
    onSuccess: (data) => {
      // Invalidate field queries
      queryClient.invalidateQueries({ queryKey: ['object-fields'] });
      queryClient.invalidateQueries({ queryKey: ['object-field', data.id] });

      toast.success('Doğrulama kuralları başarıyla güncellendi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Kurallar güncellenirken hata oluştu');
    },
  });
};
```

#### useValidationPreview.ts
```typescript
import { useState, useCallback } from 'react';
import { validateValue } from '../utils/validationRules';

export const useValidationPreview = (fieldType: string, rules: any) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((value: any) => {
    const validationErrors = validateValue(value, fieldType, rules);
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
  }, [fieldType, rules]);

  return { validate, errors, isValid };
};
```

#### validationRules.ts
```typescript
export const validateValue = (
  value: any,
  fieldType: string,
  rules: any
): string[] => {
  const errors: string[] = [];

  // Required check
  if (rules.is_required && !value) {
    errors.push(rules.error_messages?.required || 'Bu alan zorunludur');
    return errors; // Don't check other rules if empty
  }

  if (!value) return errors; // If not required and empty, skip other checks

  // Text/Email validations
  if (fieldType === 'text' || fieldType === 'email') {
    if (rules.min_length && value.length < rules.min_length) {
      errors.push(
        rules.error_messages?.min_length ||
        `En az ${rules.min_length} karakter olmalı`
      );
    }

    if (rules.max_length && value.length > rules.max_length) {
      errors.push(
        rules.error_messages?.max_length ||
        `En fazla ${rules.max_length} karakter olabilir`
      );
    }

    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push(rules.error_messages?.pattern || 'Geçersiz format');
        }
      } catch (e) {
        errors.push('Geçersiz regex pattern');
      }
    }
  }

  // Number validations
  if (fieldType === 'number') {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push('Geçerli bir sayı giriniz');
      return errors;
    }

    if (rules.min !== undefined && numValue < rules.min) {
      errors.push(
        rules.error_messages?.min ||
        `En az ${rules.min} olmalı`
      );
    }

    if (rules.max !== undefined && numValue > rules.max) {
      errors.push(
        rules.error_messages?.max ||
        `En fazla ${rules.max} olabilir`
      );
    }
  }

  // Date validations
  if (fieldType === 'date') {
    const dateValue = new Date(value);

    if (isNaN(dateValue.getTime())) {
      errors.push('Geçerli bir tarih giriniz');
      return errors;
    }

    if (rules.min_date) {
      const minDate = new Date(rules.min_date);
      if (dateValue < minDate) {
        errors.push(
          rules.error_messages?.min_date ||
          `${rules.min_date} tarihinden sonra olmalı`
        );
      }
    }

    if (rules.max_date) {
      const maxDate = new Date(rules.max_date);
      if (dateValue > maxDate) {
        errors.push(
          rules.error_messages?.max_date ||
          `${rules.max_date} tarihinden önce olmalı`
        );
      }
    }
  }

  return errors;
};
```

#### commonPatterns.ts
```typescript
interface Pattern {
  name: string;
  description: string;
  regex: string;
  example: string;
}

export const COMMON_PATTERNS: Record<string, Pattern[]> = {
  email: [
    {
      name: 'Email Format',
      description: 'Standart e-posta adresi formatı',
      regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      example: 'user@example.com',
    },
  ],
  text: [
    {
      name: 'Telefon (TR)',
      description: 'Türkiye telefon numarası (05XX XXX XX XX)',
      regex: '^05[0-9]{2}\\s?[0-9]{3}\\s?[0-9]{2}\\s?[0-9]{2}$',
      example: '0532 123 45 67',
    },
    {
      name: 'TC Kimlik No',
      description: '11 haneli TC kimlik numarası',
      regex: '^[1-9][0-9]{10}$',
      example: '12345678901',
    },
    {
      name: 'URL',
      description: 'Web adresi (http/https)',
      regex: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b',
      example: 'https://example.com',
    },
    {
      name: 'Sadece Harfler',
      description: 'Sadece alfabetik karakterler',
      regex: '^[a-zA-ZğüşöçİĞÜŞÖÇ\\s]+$',
      example: 'Ahmet Yılmaz',
    },
    {
      name: 'Alfanumerik',
      description: 'Sadece harf ve rakam',
      regex: '^[a-zA-Z0-9]+$',
      example: 'User123',
    },
    {
      name: 'Plaka (TR)',
      description: 'Türkiye araç plakası',
      regex: '^(0[1-9]|[1-7][0-9]|8[01])[A-Z]{1,3}[0-9]{2,4}$',
      example: '34ABC123',
    },
  ],
};
```

#### validation.types.ts
```typescript
export interface ValidationRules {
  // Temel Kurallar
  is_required?: boolean;
  is_unique?: boolean;
  default_value?: any;

  // Text/Email Kuralları
  min_length?: number;
  max_length?: number;
  pattern?: string;

  // Number Kuralları
  min?: number;
  max?: number;
  step?: number;

  // Select/Multiselect Kuralları
  allowed_values?: string[];
  min_selections?: number;
  max_selections?: number;

  // Date Kuralları
  min_date?: string;
  max_date?: string;

  // Error Messages
  error_messages?: {
    required?: string;
    unique?: string;
    min_length?: string;
    max_length?: string;
    pattern?: string;
    min?: string;
    max?: string;
    min_date?: string;
    max_date?: string;
  };
}

export interface ObjectField {
  id: number;
  object_id: number;
  field_name: string;
  field_type: 'text' | 'number' | 'email' | 'select' | 'multiselect' | 'date' | 'checkbox' | 'file';
  validation_rules?: ValidationRules;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

#### object-fields.api.ts (update)
```typescript
import { apiClient } from './client';
import { ValidationRules, ObjectField } from '@/features/object-fields/types/validation.types';

export const updateFieldValidation = async (
  fieldId: number,
  validation_rules: ValidationRules
): Promise<ObjectField> => {
  const { data } = await apiClient.patch(
    `/api/object-fields/${fieldId}`,
    { validation_rules }
  );
  return data;
};
```

#### ValidationBadge.tsx
```typescript
interface ValidationBadgeProps {
  isValid: boolean;
}

export const ValidationBadge = ({ isValid }: ValidationBadgeProps) => {
  if (isValid) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
        <span className="mr-1">✅</span>
        <span className="text-sm font-medium">Geçerli</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
      <span className="mr-1">❌</span>
      <span className="text-sm font-medium">Geçersiz</span>
    </div>
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `sonner` - Toast notifications

### New Features to Build
- Regex input component with syntax highlighting
- Validation preview system
- Common pattern library
- Real-time validation engine

---

## Acceptance Criteria

- [ ] Validation rules form tüm field tipleri için açılıyor
- [ ] Temel kurallar (required, unique, default) çalışıyor
- [ ] Text field için min/max length ve regex pattern çalışıyor
- [ ] Number field için min/max/step kuralları çalışıyor
- [ ] Select/Multiselect için allowed values yönetimi çalışıyor
- [ ] Date field için min/max date kuralları çalışıyor
- [ ] Yaygın formatlar (telefon, TC kimlik, plaka) quick select ile eklenebiliyor
- [ ] Custom error messages özelleştirilebiliyor
- [ ] Real-time validation preview çalışıyor
- [ ] Validation kuralları backend'e kaydediliyor
- [ ] Kaydedilen kurallar field edit'te yüklenebiliyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Required checkbox → field zorunlu hale geliyor
- [ ] Unique checkbox → duplicate değer hata veriyor
- [ ] Min/max length → karakter sınırları çalışıyor
- [ ] Regex pattern → format kontrolü çalışıyor
- [ ] Number min/max → sayı aralığı kontrolü çalışıyor
- [ ] Date range → tarih aralığı kontrolü çalışıyor
- [ ] Custom error messages → özel mesajlar gösteriliyor
- [ ] Real-time preview → anlık doğrulama çalışıyor
- [ ] Yaygın formatlar → quick select ile pattern eklenebiliyor
- [ ] Validation rules kaydediliyor ve yüklenebiliyor

### Test Cases
```typescript
// Test 1: Email field with pattern
{
  field_type: 'email',
  validation_rules: {
    is_required: true,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  }
}
// Test: "test@example.com" ✅ Geçerli
// Test: "invalid.email" ❌ Geçersiz

// Test 2: Number field with range
{
  field_type: 'number',
  validation_rules: {
    min: 0,
    max: 100,
    step: 0.01,
  }
}
// Test: 50.25 ✅ Geçerli
// Test: 150 ❌ Geçersiz (max aşımı)
// Test: -10 ❌ Geçersiz (min altı)

// Test 3: Text field with length
{
  field_type: 'text',
  validation_rules: {
    min_length: 5,
    max_length: 100,
  }
}
// Test: "Hello" ✅ Geçerli
// Test: "Hi" ❌ Geçersiz (min altı)
```

---

## Code Examples

### Complete Validation Flow
```typescript
// 1. User opens field settings
// 2. Clicks "Configure Validation Rules"
// 3. ValidationRulesForm opens with current rules
// 4. User configures rules (required, min/max, pattern, etc.)
// 5. User tests with real-time preview
// 6. User customizes error messages
// 7. User clicks "Save Validation Rules"
// 8. Rules sent to backend via PATCH /api/object-fields/{id}
// 9. Backend validates and saves rules
// 10. Form closes, field list refreshes
```

### API Call Example
```typescript
// Update validation rules
const response = await apiClient.patch(
  '/api/object-fields/123',
  {
    validation_rules: {
      is_required: true,
      is_unique: true,
      min_length: 5,
      max_length: 100,
      pattern: '^[a-zA-Z0-9]+$',
      error_messages: {
        required: 'Bu alan zorunludur',
        unique: 'Bu değer zaten kullanılıyor',
        min_length: 'En az 5 karakter olmalı',
        max_length: 'En fazla 100 karakter olabilir',
        pattern: 'Sadece harf ve rakam kullanın',
      },
    },
  }
);
```

---

## Resources

### Backend Documentation
- [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/05-object-fields/03-update-field-validation.md)
- [Validation Rules Guide](../../backend-docs/api/05-object-fields/validation-rules-guide.md)
- [Common Regex Patterns](../../backend-docs/api/05-object-fields/regex-patterns.md)

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Regex101 (Test Tool)](https://regex101.com/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Field Validation Rules task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/05-object-fields/03-field-validation-rules.md

Requirements:
1. Create src/features/object-fields/components/ValidationRulesForm.tsx - Main validation configuration form
2. Create src/features/object-fields/components/rules/BasicRules.tsx - Required, Unique, Default value
3. Create src/features/object-fields/components/rules/TextRules.tsx - Min/max length, regex pattern
4. Create src/features/object-fields/components/rules/NumberRules.tsx - Min/max value, step
5. Create src/features/object-fields/components/rules/SelectRules.tsx - Allowed values, min/max selections
6. Create src/features/object-fields/components/rules/DateRules.tsx - Min/max date
7. Create src/features/object-fields/components/ValidationPreview.tsx - Real-time validation test
8. Create src/features/object-fields/components/ErrorMessageEditor.tsx - Custom error messages
9. Create src/features/object-fields/components/CommonPatterns.tsx - Quick regex pattern selection
10. Create src/features/object-fields/hooks/useUpdateFieldValidation.ts - TanStack Query mutation
11. Create src/features/object-fields/hooks/useValidationPreview.ts - Real-time validation logic
12. Create src/features/object-fields/utils/validationRules.ts - Validation engine
13. Create src/features/object-fields/utils/commonPatterns.ts - Regex pattern library
14. Create src/features/object-fields/types/validation.types.ts - TypeScript types
15. Update src/lib/api/object-fields.api.ts - Add updateFieldValidation function
16. Create src/components/ui/ValidationBadge.tsx - Validation status badge

CRITICAL REQUIREMENTS:
- No-code UI: Kullanıcılar kod yazmadan validation kuralları tanımlayabilmeli
- Field type'a göre uygun rule components göster (text→TextRules, number→NumberRules, etc.)
- Real-time preview: Kullanıcı test değeri girince anlık doğrulama sonucu göster
- Common patterns: Telefon, TC kimlik, email gibi yaygın formatlar quick select ile eklenebilmeli
- Custom error messages: Her kural için özelleştirilebilir hata mesajları
- Validation engine: Frontend'de de backend kurallarıyla aynı validation logic olmalı
- Regex input: Regex pattern girişi için syntax highlighting ve örnek gösterim
- Mobile responsive: Tüm form elemanları mobilde düzgün çalışmalı
- Error handling: 404 (field not found), 422 (invalid rules) hatalarını göster
- Loading states: Form submit sırasında loading indicator

Follow the exact code examples and UI mockups provided in the task file.
```

---

**Status:** 🟡 Pending
**Dependencies:** 01-add-field-to-object.md
**Next Task:** 04-edit-field-properties.md
