# Task: Export/Import İşlemleri

**Priority:** 🟢 Low
**Estimated Time:** 2 gün
**Dependencies:** 06-records-table

---

## Objective

Kayıtların CSV, Excel ve JSON formatlarında dışa/içe aktarılması için export/import işlemleri oluşturmak. Kolon eşleme, validasyon, toplu içe aktarma ve hata yönetimi dahil.

---

## Backend API

### Export Endpoint
```
GET /api/records/export?format={csv|excel|json}&fields={field1,field2}
```

### Import Endpoint
```
POST /api/records/import
Content-Type: multipart/form-data
```

### Request Format (Import)
```typescript
interface ImportRequest {
  file: File; // CSV, Excel veya JSON dosyası
  field_mapping: Record<string, string>; // Kolon eşlemeleri
  skip_invalid: boolean; // Hatalı satırları atla
}
```

### Response (Export)
```typescript
// CSV/Excel: Binary file download
// JSON: Array of records
interface ExportResponse {
  records: Record[];
  total: number;
  exported_at: string;
}
```

### Response (Import)
```json
{
  "success": true,
  "imported_count": 150,
  "failed_count": 3,
  "errors": [
    {
      "row": 5,
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Geçersiz dosya formatı veya alan eşlemesi
- `413 Payload Too Large` - Dosya boyutu limiti aşıldı (Max: 10MB)
- `422 Unprocessable Entity` - Validasyon hatası

**Backend Documentation:**
→ [GET /api/records/export](../../backend-docs/api/06-records/05-export.md)
→ [POST /api/records/import](../../backend-docs/api/06-records/06-import.md)

---

## UI/UX Design

### Export Dialog
```
┌──────────────────────────────────────┐
│  Export Records                   ✕  │
├──────────────────────────────────────┤
│                                      │
│  Select Format:                      │
│  ○ CSV  ○ Excel  ● JSON              │
│                                      │
│  Select Fields to Export:            │
│  ┌──────────────────────────────┐   │
│  │ ☑ Name                       │   │
│  │ ☑ Email                      │   │
│  │ ☑ Phone                      │   │
│  │ ☐ Address                    │   │
│  │ ☑ Created At                 │   │
│  └──────────────────────────────┘   │
│                                      │
│  [ Select All ] [ Deselect All ]     │
│                                      │
│  Total Records: 1,234                │
│                                      │
│  [Cancel]  [Export (Download)]       │
│                                      │
└──────────────────────────────────────┘
```

### Import Dialog
```
┌──────────────────────────────────────┐
│  Import Records                   ✕  │
├──────────────────────────────────────┤
│                                      │
│  Step 1: Upload File                 │
│  ┌──────────────────────────────┐   │
│  │  📁 Drag & drop file here    │   │
│  │      or click to browse      │   │
│  │                              │   │
│  │  Supported: CSV, Excel, JSON │   │
│  │  Max size: 10 MB             │   │
│  └──────────────────────────────┘   │
│                                      │
│  Selected: contacts.csv (2.3 MB)     │
│  [Remove]                            │
│                                      │
│  [Cancel]           [Next Step]      │
│                                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Import Records - Map Fields      ✕  │
├──────────────────────────────────────┤
│                                      │
│  Step 2: Map Columns to Fields       │
│                                      │
│  File Column       →    App Field    │
│  ┌──────────────┐     ┌──────────┐  │
│  │ full_name    │  →  │ Name ▼   │  │
│  └──────────────┘     └──────────┘  │
│                                      │
│  ┌──────────────┐     ┌──────────┐  │
│  │ email_addr   │  →  │ Email ▼  │  │
│  └──────────────┘     └──────────┘  │
│                                      │
│  ┌──────────────┐     ┌──────────┐  │
│  │ tel_number   │  →  │ Phone ▼  │  │
│  └──────────────┘     └──────────┘  │
│                                      │
│  ☑ Skip rows with validation errors  │
│  ☐ Update existing records (by ID)   │
│                                      │
│  Preview: 150 rows detected          │
│                                      │
│  [Back]        [Cancel]   [Import]   │
│                                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Importing...                     ✕  │
├──────────────────────────────────────┤
│                                      │
│  Processing records...               │
│                                      │
│  ████████████░░░░░░░░░  65% (98/150) │
│                                      │
│  Imported: 98                        │
│  Failed: 2                           │
│                                      │
│  Time remaining: ~30 seconds         │
│                                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Import Complete                  ✕  │
├──────────────────────────────────────┤
│                                      │
│  ✅ Import Successful!               │
│                                      │
│  Successfully imported: 147 records  │
│  Failed: 3 records                   │
│                                      │
│  Errors:                             │
│  ┌──────────────────────────────┐   │
│  │ Row 5: Invalid email format  │   │
│  │ Row 12: Missing required ... │   │
│  │ Row 34: Duplicate entry      │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Download Error Report (CSV)]       │
│  [Close]                             │
│                                      │
└──────────────────────────────────────┘
```

### Field Mapper UI
```
┌──────────────────────────────────────┐
│  Automatic Mapping Suggestions       │
├──────────────────────────────────────┤
│                                      │
│  We found these potential matches:   │
│                                      │
│  "full_name"    → Name  [✓ Apply]    │
│  "email_addr"   → Email [✓ Apply]    │
│  "tel_number"   → Phone [✓ Apply]    │
│  "addr_street"  → (Unmapped)         │
│                                      │
│  [Apply All Suggestions]             │
│                                      │
└──────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── ExportDialog.tsx          ⭐ Export modal
│       │   ├── ImportDialog.tsx          ⭐ Import modal
│       │   ├── FieldMapper.tsx           ⭐ Column mapping component
│       │   ├── ImportProgress.tsx        ⭐ Progress bar component
│       │   └── ImportResults.tsx         ⭐ Success/error results
│       ├── hooks/
│       │   ├── useExport.ts              ⭐ Export hook
│       │   ├── useImport.ts              ⭐ Import hook
│       │   └── useFieldMapping.ts        ⭐ Auto-mapping logic
│       └── types/
│           └── export-import.types.ts    ⭐ TypeScript types
├── lib/
│   └── api/
│       └── export-import.api.ts          ⭐ API calls
└── utils/
    ├── csv-parser.ts                     ⭐ CSV parsing (papaparse)
    ├── excel-parser.ts                   ⭐ Excel parsing (xlsx)
    └── file-validator.ts                 ⭐ File size/type validation
```

### Component Implementation

#### ExportDialog.tsx
```typescript
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Radio } from '@/components/ui/Radio';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useExport } from '../hooks/useExport';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalRecords: number;
}

type ExportFormat = 'csv' | 'excel' | 'json';

const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'address', label: 'Address' },
  { id: 'created_at', label: 'Created At' },
];

export const ExportDialog = ({ isOpen, onClose, totalRecords }: ExportDialogProps) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'email', 'phone', 'created_at'
  ]);

  const { mutate: exportRecords, isPending } = useExport();

  const handleToggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.id));
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleExport = () => {
    exportRecords({
      format,
      fields: selectedFields,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Records">
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Format:
          </label>
          <div className="flex gap-6">
            <Radio
              name="format"
              value="csv"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
              label="CSV"
            />
            <Radio
              name="format"
              value="excel"
              checked={format === 'excel'}
              onChange={() => setFormat('excel')}
              label="Excel"
            />
            <Radio
              name="format"
              value="json"
              checked={format === 'json'}
              onChange={() => setFormat('json')}
              label="JSON"
            />
          </div>
        </div>

        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Fields to Export:
          </label>
          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {AVAILABLE_FIELDS.map(field => (
              <div key={field.id} className="flex items-center py-2">
                <Checkbox
                  checked={selectedFields.includes(field.id)}
                  onChange={() => handleToggleField(field.id)}
                />
                <label className="ml-2 text-sm text-gray-700">{field.label}</label>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button size="sm" variant="outline" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            Total Records: <span className="font-semibold">{totalRecords.toLocaleString()}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isPending || selectedFields.length === 0}
            loading={isPending}
          >
            {isPending ? 'Exporting...' : 'Export (Download)'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
```

#### ImportDialog.tsx
```typescript
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { FieldMapper } from './FieldMapper';
import { ImportProgress } from './ImportProgress';
import { ImportResults } from './ImportResults';
import { useImport } from '../hooks/useImport';
import { validateFile } from '@/utils/file-validator';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'progress' | 'results';

export const ImportDialog = ({ isOpen, onClose }: ImportDialogProps) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [skipInvalid, setSkipInvalid] = useState(true);

  const { mutate: importRecords, isPending, data: importResult } = useImport();

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, {
      maxSize: 10 * 1024 * 1024, // 10 MB
      allowedTypes: ['.csv', '.xlsx', '.xls', '.json'],
    });

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  const handleNextStep = () => {
    setStep('mapping');
  };

  const handleImport = () => {
    if (!file) return;

    setStep('progress');

    importRecords({
      file,
      fieldMapping,
      skipInvalid,
    }, {
      onSuccess: () => {
        setStep('results');
      },
    });
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setFieldMapping({});
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Import Records">
      {step === 'upload' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Step 1: Upload File
            </label>
            <FileUpload
              accept=".csv,.xlsx,.xls,.json"
              maxSize={10 * 1024 * 1024}
              onFileSelect={handleFileSelect}
              supportedFormats={['CSV', 'Excel', 'JSON']}
            />
          </div>

          {file && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleNextStep} disabled={!file}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 'mapping' && file && (
        <div className="space-y-6">
          <FieldMapper
            file={file}
            fieldMapping={fieldMapping}
            onMappingChange={setFieldMapping}
            skipInvalid={skipInvalid}
            onSkipInvalidChange={setSkipInvalid}
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} loading={isPending}>
              Import
            </Button>
          </div>
        </div>
      )}

      {step === 'progress' && (
        <ImportProgress
          imported={importResult?.imported_count || 0}
          failed={importResult?.failed_count || 0}
          total={importResult?.total || 0}
        />
      )}

      {step === 'results' && importResult && (
        <ImportResults
          result={importResult}
          onClose={handleClose}
        />
      )}
    </Dialog>
  );
};
```

#### FieldMapper.tsx
```typescript
import { useEffect, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useFieldMapping } from '../hooks/useFieldMapping';
import { parseCSVPreview } from '@/utils/csv-parser';

interface FieldMapperProps {
  file: File;
  fieldMapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  skipInvalid: boolean;
  onSkipInvalidChange: (skip: boolean) => void;
}

const APP_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'notes', label: 'Notes' },
];

export const FieldMapper = ({
  file,
  fieldMapping,
  onMappingChange,
  skipInvalid,
  onSkipInvalidChange,
}: FieldMapperProps) => {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const { getSuggestedMapping } = useFieldMapping();

  useEffect(() => {
    const loadFilePreview = async () => {
      const preview = await parseCSVPreview(file);
      setFileColumns(preview.columns);
      setRowCount(preview.rowCount);

      // Auto-suggest mappings
      const suggested = getSuggestedMapping(preview.columns, APP_FIELDS.map(f => f.value));
      onMappingChange(suggested);
    };

    loadFilePreview();
  }, [file]);

  const handleFieldChange = (fileColumn: string, appField: string) => {
    onMappingChange({
      ...fieldMapping,
      [fileColumn]: appField,
    });
  };

  const handleApplySuggestions = () => {
    const suggested = getSuggestedMapping(fileColumns, APP_FIELDS.map(f => f.value));
    onMappingChange(suggested);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Step 2: Map Columns to Fields
        </label>

        <div className="space-y-3">
          {fileColumns.map(column => (
            <div key={column} className="flex items-center gap-4">
              <div className="flex-1 bg-gray-100 border border-gray-200 rounded px-3 py-2">
                <span className="text-sm font-medium text-gray-700">{column}</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex-1">
                <Select
                  value={fieldMapping[column] || ''}
                  onChange={(e) => handleFieldChange(column, e.target.value)}
                  placeholder="Select field..."
                >
                  <option value="">-- Unmapped --</option>
                  {APP_FIELDS.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={handleApplySuggestions}>
            Apply Auto-Mapping Suggestions
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <Checkbox
            checked={skipInvalid}
            onChange={(e) => onSkipInvalidChange(e.target.checked)}
          />
          <label className="ml-2 text-sm text-gray-700">
            Skip rows with validation errors
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          Preview: <span className="font-semibold">{rowCount} rows</span> detected
        </p>
      </div>
    </div>
  );
};
```

#### ImportProgress.tsx
```typescript
import { Progress } from '@/components/ui/Progress';

interface ImportProgressProps {
  imported: number;
  failed: number;
  total: number;
}

export const ImportProgress = ({ imported, failed, total }: ImportProgressProps) => {
  const percentage = total > 0 ? Math.round(((imported + failed) / total) * 100) : 0;
  const remaining = total - (imported + failed);
  const estimatedTime = remaining > 0 ? Math.ceil(remaining / 5) : 0; // ~5 records/second

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Processing records...
        </h3>
      </div>

      <Progress value={percentage} />

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">Imported</p>
          <p className="text-2xl font-bold text-green-600">{imported}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failed}</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        {estimatedTime > 0 && (
          <p>Time remaining: ~{estimatedTime} seconds</p>
        )}
      </div>
    </div>
  );
};
```

#### ImportResults.tsx
```typescript
import { Button } from '@/components/ui/Button';
import { downloadCSV } from '@/utils/csv-parser';

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportResultsProps {
  result: {
    success: boolean;
    imported_count: number;
    failed_count: number;
    errors: ImportError[];
  };
  onClose: () => void;
}

export const ImportResults = ({ result, onClose }: ImportResultsProps) => {
  const handleDownloadErrorReport = () => {
    const csvData = result.errors.map(error => ({
      Row: error.row,
      Field: error.field,
      Error: error.message,
    }));

    downloadCSV(csvData, 'import-errors.csv');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Import Complete!
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Successfully imported</p>
          <p className="text-3xl font-bold text-green-600">
            {result.imported_count}
          </p>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">
            {result.failed_count}
          </p>
          <p className="text-xs text-gray-500 mt-1">records</p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Errors:
          </label>
          <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
            {result.errors.slice(0, 5).map((error, index) => (
              <div key={index} className="text-sm text-gray-700 py-1">
                Row {error.row}: {error.message}
              </div>
            ))}
            {result.errors.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                ... and {result.errors.length - 5} more errors
              </p>
            )}
          </div>

          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={handleDownloadErrorReport}>
              Download Error Report (CSV)
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
```

#### useExport.ts
```typescript
import { useMutation } from '@tanstack/react-query';
import { exportRecordsAPI } from '@/lib/api/export-import.api';
import { downloadFile } from '@/utils/file-validator';

interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields: string[];
}

export const useExport = () => {
  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const response = await exportRecordsAPI(options.format, options.fields);
      return response;
    },
    onSuccess: (data, variables) => {
      // Download file
      const filename = `records-export-${Date.now()}.${variables.format}`;
      downloadFile(data, filename, getMimeType(variables.format));
    },
    onError: (error: any) => {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    },
  });
};

const getMimeType = (format: string): string => {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
};
```

#### useImport.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importRecordsAPI } from '@/lib/api/export-import.api';

interface ImportOptions {
  file: File;
  fieldMapping: Record<string, string>;
  skipInvalid: boolean;
}

export const useImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: ImportOptions) => {
      const response = await importRecordsAPI(
        options.file,
        options.fieldMapping,
        options.skipInvalid
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate records query to refresh table
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
    onError: (error: any) => {
      console.error('Import failed:', error);
    },
  });
};
```

#### useFieldMapping.ts
```typescript
import { useMemo } from 'react';

export const useFieldMapping = () => {
  /**
   * Auto-suggest field mappings based on column names
   * Uses fuzzy matching and common naming patterns
   */
  const getSuggestedMapping = (
    fileColumns: string[],
    appFields: string[]
  ): Record<string, string> => {
    const mapping: Record<string, string> = {};

    fileColumns.forEach(column => {
      const normalized = column.toLowerCase().replace(/[_\s-]/g, '');

      appFields.forEach(field => {
        const fieldNormalized = field.toLowerCase().replace(/[_\s-]/g, '');

        // Exact match
        if (normalized === fieldNormalized) {
          mapping[column] = field;
          return;
        }

        // Contains match
        if (normalized.includes(fieldNormalized) || fieldNormalized.includes(normalized)) {
          mapping[column] = field;
          return;
        }

        // Common variations
        const variations: Record<string, string[]> = {
          name: ['fullname', 'username', 'contactname', 'personname'],
          email: ['emailaddress', 'emailaddr', 'mail', 'emailid'],
          phone: ['telephone', 'mobile', 'phonenumber', 'tel', 'cellphone'],
          address: ['location', 'addr', 'street', 'fulladdress'],
        };

        if (variations[field]?.some(v => normalized.includes(v) || v.includes(normalized))) {
          mapping[column] = field;
        }
      });
    });

    return mapping;
  };

  return {
    getSuggestedMapping,
  };
};
```

#### export-import.api.ts
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ExportResponse {
  data: Blob; // Binary file data
}

interface ImportResponse {
  success: boolean;
  imported_count: number;
  failed_count: number;
  total: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export const exportRecordsAPI = async (
  format: 'csv' | 'excel' | 'json',
  fields: string[]
): Promise<Blob> => {
  const { data } = await axios.get<Blob>(
    `${API_BASE_URL}/api/records/export`,
    {
      params: {
        format,
        fields: fields.join(','),
      },
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );

  return data;
};

export const importRecordsAPI = async (
  file: File,
  fieldMapping: Record<string, string>,
  skipInvalid: boolean
): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('field_mapping', JSON.stringify(fieldMapping));
  formData.append('skip_invalid', String(skipInvalid));

  const { data } = await axios.post<ImportResponse>(
    `${API_BASE_URL}/api/records/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );

  return data;
};
```

#### csv-parser.ts
```typescript
import Papa from 'papaparse';

interface CSVPreview {
  columns: string[];
  rowCount: number;
  sampleData: any[];
}

/**
 * Parse CSV file preview (first 5 rows)
 */
export const parseCSVPreview = (file: File): Promise<CSVPreview> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        resolve({
          columns: results.meta.fields || [],
          rowCount: results.data.length,
          sampleData: results.data,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Generate and download CSV file
 */
export const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

#### file-validator.ts
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface FileValidationOptions {
  maxSize: number; // bytes
  allowedTypes: string[]; // ['.csv', '.xlsx', '.json']
}

export const validateFile = (
  file: File,
  options: FileValidationOptions
): ValidationResult => {
  // Check file size
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${(options.maxSize / 1024 / 1024).toFixed(2)} MB`,
    };
  }

  // Check file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!options.allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Download file from Blob
 */
export const downloadFile = (blob: Blob, filename: string, mimeType: string) => {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

#### export-import.types.ts
```typescript
export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  fields: string[];
}

export interface ImportOptions {
  file: File;
  fieldMapping: Record<string, string>;
  skipInvalid: boolean;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  total: number;
  errors: ImportError[];
}

export interface FieldMapping {
  fileColumn: string;
  appField: string;
}
```

---

## Dependencies

### NPM Packages
```bash
npm install papaparse xlsx
npm install --save-dev @types/papaparse
```

**Package Details:**
- `papaparse` (5.4+) - CSV parsing/generation (client-side)
- `xlsx` (0.18+) - Excel file parsing (optional, server-side tavsiye edilir)

### UI Components (To Be Built)
- `Dialog` component (React Aria)
- `FileUpload` component (React Aria)
- `Progress` component (React Aria)
- `Select` component (React Aria)

---

## Acceptance Criteria

- [ ] Export dialog açılıyor ve format seçimi çalışıyor
- [ ] Export'ta alan seçimi (checkbox) çalışıyor
- [ ] CSV export çalışıyor (papaparse ile client-side)
- [ ] Excel export çalışıyor (backend'den binary download)
- [ ] JSON export çalışıyor
- [ ] Import dialog açılıyor ve dosya yükleme çalışıyor
- [ ] Dosya validasyonu çalışıyor (tip, boyut)
- [ ] Field mapping UI çalışıyor (dropdown eşleme)
- [ ] Auto-mapping suggestions çalışıyor (fuzzy matching)
- [ ] Import progress bar çalışıyor
- [ ] Import sonuçları gösteriliyor (başarılı/hatalı)
- [ ] Hata raporu CSV olarak indirilebiliyor
- [ ] Validasyon hataları skip ediliyor (skipInvalid)
- [ ] Records table import sonrası yenileniyor

---

## Testing Checklist

### Manual Testing (Export)
- [ ] CSV export → dosya indiriliyor, formatı doğru
- [ ] Excel export → dosya indiriliyor, açılabiliyor
- [ ] JSON export → dosya indiriliyor, valid JSON
- [ ] Sadece seçili alanlar export ediliyor
- [ ] Export sırasında loading state görünüyor
- [ ] 10,000+ kayıt export → performans testi

### Manual Testing (Import)
- [ ] CSV dosyası yükleme → preview gösteriliyor
- [ ] Excel dosyası yükleme → çalışıyor
- [ ] JSON dosyası yükleme → çalışıyor
- [ ] Geçersiz dosya formatı → hata mesajı
- [ ] 10MB+ dosya → hata mesajı (size limit)
- [ ] Auto-mapping → doğru eşleşmeler bulunuyor
- [ ] Manuel mapping → değişiklikler kaydediliyor
- [ ] Import progress → gerçek zamanlı güncelleniyor
- [ ] Validasyon hatası → satır atlanıyor (skip mode)
- [ ] Import tamamlanınca → success mesajı + hata listesi
- [ ] Hata raporu indirme → CSV formatında

---

## Code Examples

### Complete Export Flow
```typescript
// 1. User clicks "Export" button on Records Table
// 2. ExportDialog opens
// 3. User selects format (CSV/Excel/JSON)
// 4. User selects fields to export
// 5. User clicks "Export" button
// 6. useExport hook calls API
// 7. Blob response downloaded as file
// 8. Dialog closes
```

### Complete Import Flow
```typescript
// 1. User clicks "Import" button on Records Table
// 2. ImportDialog opens (Step 1: Upload)
// 3. User drags/drops or selects file
// 4. File validated (size, type)
// 5. File parsed for preview
// 6. Next Step → Field Mapping
// 7. Auto-mapping suggestions applied
// 8. User adjusts mappings
// 9. User clicks "Import"
// 10. ImportProgress shown
// 11. API processes file row-by-row
// 12. ImportResults shown (success/errors)
// 13. Records table refreshed
```

### CSV Export Example (Client-Side)
```typescript
import Papa from 'papaparse';

const exportToCSV = (records: any[], filename: string) => {
  const csv = Papa.unparse(records, {
    columns: ['name', 'email', 'phone', 'created_at'],
    header: true,
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Usage
exportToCSV(records, 'contacts.csv');
```

### Excel Import Example
```typescript
import * as XLSX from 'xlsx';

const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      resolve(json);
    };

    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};
```

---

## File Size Limits

### Client-Side Limits
- **Max file size:** 10 MB
- **Reason:** Browser memory constraints, performance

### Backend Limits
- **Max file size:** 50 MB (configurable)
- **Max rows:** 100,000 rows per import
- **Timeout:** 5 minutes per import job

### Recommendations
- Files > 10 MB → Göster warning, backend'e yükle
- Files > 50 MB → Hata, chunk import öner
- Export > 50,000 rows → Server-side generation + email link

---

## UI/UX Best Practices

### Export
- Show record count before export
- Disable export if no fields selected
- Loading state during generation
- Auto-download file (no manual save dialog)

### Import
- Multi-step wizard (upload → map → import → results)
- File drag & drop support
- Real-time validation feedback
- Progress bar with ETA
- Detailed error reporting
- Error report download option

### Field Mapping
- Auto-suggestions first (save user time)
- Clear visual mapping (source → target)
- Unmapped columns highlighted
- Preview data (first 5 rows)

---

## Resources

### Backend Documentation
- [GET /api/records/export](../../backend-docs/api/06-records/05-export.md)
- [POST /api/records/import](../../backend-docs/api/06-records/06-import.md)

### Libraries
- [PapaParse Docs](https://www.papaparse.com/) - CSV parsing
- [SheetJS (xlsx) Docs](https://docs.sheetjs.com/) - Excel parsing
- [React Dropzone](https://react-dropzone.js.org/) - File upload (optional)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Export/Import feature exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/10-advanced-features/04-export-import.md

Requirements:
1. Create src/features/records/components/ExportDialog.tsx - Export modal with format and field selection
2. Create src/features/records/components/ImportDialog.tsx - Multi-step import wizard
3. Create src/features/records/components/FieldMapper.tsx - Column mapping component with auto-suggestions
4. Create src/features/records/components/ImportProgress.tsx - Real-time progress bar
5. Create src/features/records/components/ImportResults.tsx - Success/error results display
6. Create src/features/records/hooks/useExport.ts - TanStack Query export hook
7. Create src/features/records/hooks/useImport.ts - TanStack Query import hook
8. Create src/features/records/hooks/useFieldMapping.ts - Auto-mapping logic with fuzzy matching
9. Create src/lib/api/export-import.api.ts - Export/import API functions
10. Create src/utils/csv-parser.ts - CSV parsing/generation using papaparse
11. Create src/utils/file-validator.ts - File validation (size, type)
12. Create src/features/records/types/export-import.types.ts - TypeScript types

CRITICAL REQUIREMENTS:
- Export: Support CSV (client-side with papaparse), Excel, JSON formats
- Import: Multi-step wizard (upload → field mapping → progress → results)
- Auto-suggest field mappings using fuzzy matching (e.g., "full_name" → "Name")
- File size limit: 10 MB (show error if exceeded)
- Progress bar with real-time updates during import
- Error handling: Skip invalid rows, show detailed error report
- Error report downloadable as CSV
- Invalidate records query after successful import
- Mobile responsive dialogs

Install dependencies:
npm install papaparse
npm install --save-dev @types/papaparse

Test with:
- Export 1,000+ contacts to CSV
- Import products from Excel with field mapping
- Import with validation errors (verify skip logic)
```

---

**Status:** 🟡 Pending
**Next Task:** 05-advanced-search.md
