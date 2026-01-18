# Task: Records Table Pagination

**Priority:** 🟡 Medium
**Estimated Time:** 0.5 gün
**Dependencies:** 01-records-table-view

---

## Objective

Records tablosuna sayfalama (pagination) özellikleri eklemek. Kullanıcılar büyük veri setlerinde sayfalar arası gezinebilmeli, sayfa başına gösterilecek kayıt sayısını ayarlayabilmeli ve klavye ile navigasyon yapabilmeli.

---

## Backend API

### Endpoint
```
GET /api/records?object_id={id}&page=1&page_size=50
```

### Query Parameters
```typescript
interface PaginationParams {
  object_id: string;    // Object ID (required)
  page: number;         // Sayfa numarası (1-based, default: 1)
  page_size: number;    // Sayfa başına kayıt sayısı (default: 50, max: 100)
}
```

### Response
```json
{
  "records": [
    {
      "id": "rec_123",
      "fields": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "created_at": "2025-01-18T10:00:00Z",
      "updated_at": "2025-01-18T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 250,           // Toplam kayıt sayısı
    "page": 1,              // Mevcut sayfa
    "page_size": 50,        // Sayfa başına kayıt
    "total_pages": 5,       // Toplam sayfa sayısı
    "has_next": true,       // Sonraki sayfa var mı?
    "has_prev": false       // Önceki sayfa var mı?
  }
}
```

**Response Fields:**
- `records` - Mevcut sayfadaki kayıtlar
- `pagination.total` - Toplam kayıt sayısı
- `pagination.page` - Mevcut sayfa numarası (1-based)
- `pagination.page_size` - Sayfa başına kayıt sayısı
- `pagination.total_pages` - Toplam sayfa sayısı
- `pagination.has_next` - Sonraki sayfa var mı?
- `pagination.has_prev` - Önceki sayfa var mı?

### Error Responses
- `400 Bad Request` - Geçersiz page veya page_size değeri
- `404 Not Found` - Object bulunamadı

**Backend Documentation:**
→ [GET /api/records](../../backend-docs/api/03-records/01-list-records.md)

---

## UI/UX Design

### Pagination Controls Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Records Table (50 items)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name          │ Email           │ Created At        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ John Doe      │ john@example.com│ 2025-01-18       │   │
│  │ ...           │ ...             │ ...              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pagination Controls                                 │   │
│  │                                                     │   │
│  │  Showing 1-50 of 250 records                       │   │
│  │                                                     │   │
│  │  [First] [Prev] [1] [2] [3] ... [5] [Next] [Last] │   │
│  │                                                     │   │
│  │  Page size: [10] [25] [50✓] [100]                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Pagination Components

1. **Records Count Display**
   - Format: "Showing {start}-{end} of {total} records"
   - Örnek: "Showing 1-50 of 250 records"
   - Örnek: "Showing 51-100 of 250 records"
   - Kayıt yoksa: "No records found"

2. **Navigation Buttons**
   - **First** - İlk sayfaya git (page = 1)
   - **Prev** - Önceki sayfaya git (page - 1)
   - **Page Numbers** - Direkt sayfa numarasına git
   - **Next** - Sonraki sayfaya git (page + 1)
   - **Last** - Son sayfaya git (page = total_pages)

3. **Page Number Badges**
   - Aktif sayfa: Mavi background (#3B82F6)
   - Diğer sayfalar: Gri background
   - Max 5 sayfa göster: [1] [2] [3] ... [10]
   - Ellipsis (...) ile gizli sayfaları belirt

4. **Page Size Selector**
   - Seçenekler: 10, 25, 50, 100
   - Default: 50
   - Aktif seçenek: Mavi border + checkmark
   - Hover effect: Scale animation

5. **Keyboard Navigation**
   - `←` (Left Arrow) - Önceki sayfa
   - `→` (Right Arrow) - Sonraki sayfa
   - `Home` - İlk sayfa
   - `End` - Son sayfa

6. **URL Sync**
   - URL'de sayfa numarası: `?page=2`
   - URL'de sayfa boyutu: `?page_size=50`
   - Örnek: `/records?object_id=obj_123&page=2&page_size=50`
   - Browser back/forward çalışmalı

### States
- **Loading** - Sayfa değişirken loading indicator
- **Disabled** - İlk sayfadaysa "First/Prev" disabled
- **Disabled** - Son sayfadaysa "Next/Last" disabled
- **Empty** - Kayıt yoksa pagination gizli

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── RecordsTable.tsx          ⭐ Updated (pagination state)
│       │   ├── PaginationControls.tsx    ⭐ NEW - Pagination UI
│       │   ├── PageSizeSelector.tsx      ⭐ NEW - Page size selector
│       │   └── PageNumberBadges.tsx      ⭐ NEW - Page number display
│       ├── hooks/
│       │   ├── useRecords.ts             ⭐ Updated (pagination params)
│       │   └── usePagination.ts          ⭐ NEW - Pagination logic
│       └── types/
│           └── records.types.ts          ⭐ Updated (pagination types)
└── lib/
    └── api/
        └── records.api.ts                 ⭐ Updated (pagination params)
```

### Component Implementation

#### PaginationControls.tsx
```typescript
import { usePagination } from '../hooks/usePagination';
import { PageSizeSelector } from './PageSizeSelector';
import { PageNumberBadges } from './PageNumberBadges';

interface PaginationControlsProps {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const PaginationControls = ({
  total,
  page,
  pageSize,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) => {
  const { goToFirstPage, goToPrevPage, goToNextPage, goToLastPage } = usePagination({
    page,
    totalPages,
    onPageChange,
  });

  // Kayıt yoksa pagination gösterme
  if (total === 0) return null;

  // Showing 1-50 of 250 records
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Records Count */}
      <div className="flex-1 flex justify-between sm:hidden">
        <span className="text-sm text-gray-700">
          Showing {start}-{end} of {total} records
        </span>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{start}</span> to{' '}
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{total}</span> records
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToFirstPage}
            disabled={!hasPrev}
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
          >
            First
          </button>

          <button
            onClick={goToPrevPage}
            disabled={!hasPrev}
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
          >
            Prev
          </button>

          {/* Page Number Badges */}
          <PageNumberBadges
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />

          <button
            onClick={goToNextPage}
            disabled={!hasNext}
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
          >
            Next
          </button>

          <button
            onClick={goToLastPage}
            disabled={!hasNext}
            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
          >
            Last
          </button>
        </div>
      </div>

      {/* Page Size Selector */}
      <div className="mt-4 sm:mt-0">
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};
```

#### PageSizeSelector.tsx
```typescript
interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
}: PageSizeSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">Page size:</span>
      <div className="flex space-x-1">
        {PAGE_SIZE_OPTIONS.map((size) => (
          <button
            key={size}
            onClick={() => onPageSizeChange(size)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md transition-all
              ${
                pageSize === size
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {size}
            {pageSize === size && (
              <span className="ml-1 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### PageNumberBadges.tsx
```typescript
interface PageNumberBadgesProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PageNumberBadges = ({
  currentPage,
  totalPages,
  onPageChange,
}: PageNumberBadgesProps) => {
  // Max 5 sayfa göster: [1] [2] [3] ... [10]
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    // İlk 2 sayfa
    pages.push(1, 2);

    // Ortadaki sayfalar
    if (currentPage > 3 && currentPage < totalPages - 2) {
      pages.push('ellipsis', currentPage, 'ellipsis');
    } else if (currentPage <= 3) {
      pages.push(3, 'ellipsis');
    } else {
      pages.push('ellipsis', totalPages - 2);
    }

    // Son 2 sayfa
    pages.push(totalPages - 1, totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-1">
      {pageNumbers.map((pageNum, index) => {
        if (pageNum === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md transition-all
              ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {pageNum}
          </button>
        );
      })}
    </div>
  );
};
```

#### usePagination.ts
```typescript
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface UsePaginationReturn {
  goToFirstPage: () => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
}

export const usePagination = ({
  page,
  totalPages,
  onPageChange,
}: UsePaginationProps): UsePaginationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den sayfa numarasını oku
  useEffect(() => {
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (pageNum !== page && pageNum >= 1 && pageNum <= totalPages) {
        onPageChange(pageNum);
      }
    }
  }, [searchParams, page, totalPages, onPageChange]);

  // Sayfa değiştiğinde URL'i güncelle
  const updateURL = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  // Klavye navigasyonu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Eğer input/textarea içindeyse ignore et
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          e.preventDefault();
          goToFirstPage();
          break;
        case 'End':
          e.preventDefault();
          goToLastPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, totalPages]);

  const goToFirstPage = () => {
    if (page > 1) {
      onPageChange(1);
      updateURL(1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
      updateURL(page - 1);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
      updateURL(page + 1);
    }
  };

  const goToLastPage = () => {
    if (page < totalPages) {
      onPageChange(totalPages);
      updateURL(totalPages);
    }
  };

  return {
    goToFirstPage,
    goToPrevPage,
    goToNextPage,
    goToLastPage,
  };
};
```

#### Updated useRecords.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getRecordsAPI } from '@/lib/api/records.api';

const DEFAULT_PAGE_SIZE = 50;

export const useRecords = (objectId: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den pagination parametrelerini oku
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || String(DEFAULT_PAGE_SIZE), 10);

  const query = useQuery({
    queryKey: ['records', objectId, page, pageSize],
    queryFn: () => getRecordsAPI(objectId, { page, page_size: pageSize }),
    enabled: !!objectId,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setSearchParams((prev) => {
      prev.set('page', '1'); // Reset to first page
      prev.set('page_size', newPageSize.toString());
      return prev;
    });
  };

  return {
    ...query,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};
```

#### Updated records.types.ts
```typescript
export interface Record {
  id: string;
  fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;           // Toplam kayıt sayısı
  page: number;            // Mevcut sayfa (1-based)
  page_size: number;       // Sayfa başına kayıt
  total_pages: number;     // Toplam sayfa sayısı
  has_next: boolean;       // Sonraki sayfa var mı?
  has_prev: boolean;       // Önceki sayfa var mı?
}

export interface RecordsResponse {
  records: Record[];
  pagination: PaginationMeta;
}

export interface RecordsQueryParams {
  page?: number;           // Default: 1
  page_size?: number;      // Default: 50, Max: 100
}
```

#### Updated records.api.ts
```typescript
import axios from 'axios';
import { RecordsResponse, RecordsQueryParams } from '@/features/records/types/records.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getRecordsAPI = async (
  objectId: string,
  params: RecordsQueryParams = {}
): Promise<RecordsResponse> => {
  const { page = 1, page_size = 50 } = params;

  // Validate params
  if (page < 1) throw new Error('Page must be >= 1');
  if (page_size < 1 || page_size > 100) throw new Error('Page size must be between 1 and 100');

  const { data } = await axios.get<RecordsResponse>(
    `${API_BASE_URL}/api/records`,
    {
      params: {
        object_id: objectId,
        page,
        page_size,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );

  return data;
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - Data fetching + caching
- `react-router-dom` - URL sync (useSearchParams)
- `axios` - HTTP client

### UI Components (Already Built)
- `Button` component (React Aria)

---

## Acceptance Criteria

- [ ] Pagination controls tablodan sonra görünüyor
- [ ] "Showing X-Y of Z records" doğru hesaplanıyor
- [ ] First/Prev/Next/Last butonları çalışıyor
- [ ] Sayfa numaralarına tıklayınca doğru sayfaya gidiyor
- [ ] Page size selector (10/25/50/100) çalışıyor
- [ ] Sayfa değiştiğinde loading state gösteriliyor
- [ ] İlk sayfada First/Prev disabled
- [ ] Son sayfada Next/Last disabled
- [ ] Kayıt yoksa pagination gizli
- [ ] URL'de page ve page_size parametreleri
- [ ] Browser back/forward çalışıyor
- [ ] Klavye navigasyonu çalışıyor (Arrow keys, Home, End)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] İlk sayfa yüklenince page=1, page_size=50
- [ ] "Next" butonuna bas → page=2, URL güncelleniyor
- [ ] "Prev" butonuna bas → page=1, URL güncelleniyor
- [ ] Sayfa numarasına direkt tıkla → Doğru sayfaya gidiyor
- [ ] Page size değiştir → page=1'e dönüyor, yeni page_size uygulanıyor
- [ ] İlk sayfada First/Prev disabled
- [ ] Son sayfada Next/Last disabled
- [ ] Klavye: Left arrow → Önceki sayfa
- [ ] Klavye: Right arrow → Sonraki sayfa
- [ ] Klavye: Home → İlk sayfa
- [ ] Klavye: End → Son sayfa
- [ ] Input focus'teyken klavye navigasyonu çalışmıyor
- [ ] Browser back → Önceki sayfaya dönüyor
- [ ] URL'i manuel değiştir → Doğru sayfa yükleniyor
- [ ] Sayfa değişirken loading indicator
- [ ] Kayıt yoksa pagination gizli

### Edge Cases
- [ ] Total records < page_size → Pagination gizli
- [ ] Total pages = 1 → Navigation disabled
- [ ] Total pages > 5 → Ellipsis gösteriliyor
- [ ] Invalid page in URL → Fallback to page 1
- [ ] Invalid page_size in URL → Fallback to default (50)
- [ ] page_size > 100 → API error handling

---

## Code Examples

### Complete Pagination Flow
```typescript
// 1. Component render ile URL'den page ve page_size okunuyor
// 2. useRecords hook ile API call yapılıyor (page, page_size params)
// 3. API response ile pagination meta data geliyor
// 4. PaginationControls render ediliyor
// 5. Kullanıcı "Next" butonuna basıyor
// 6. handlePageChange tetikleniyor
// 7. URL güncelleniyor (?page=2)
// 8. useQuery yeni page ile API call yapıyor
// 9. Loading state gösteriliyor
// 10. Yeni data render ediliyor
```

### URL Sync Example
```typescript
// Current URL: /records?object_id=obj_123&page=2&page_size=50

// useSearchParams ile oku
const page = parseInt(searchParams.get('page') || '1', 10);      // 2
const pageSize = parseInt(searchParams.get('page_size') || '50', 10); // 50

// Sayfa değiştir
const handlePageChange = (newPage: number) => {
  setSearchParams((prev) => {
    prev.set('page', newPage.toString());
    return prev;
  });
};

// Page size değiştir
const handlePageSizeChange = (newPageSize: number) => {
  setSearchParams((prev) => {
    prev.set('page', '1');  // Reset to first page
    prev.set('page_size', newPageSize.toString());
    return prev;
  });
};
```

### Error Handling
```typescript
// API Client (records.api.ts)
export const getRecordsAPI = async (objectId: string, params: RecordsQueryParams) => {
  try {
    // Validate params
    if (params.page && params.page < 1) {
      throw new Error('Page must be >= 1');
    }
    if (params.page_size && (params.page_size < 1 || params.page_size > 100)) {
      throw new Error('Page size must be between 1 and 100');
    }

    const { data } = await axios.get(`/api/records`, { params });
    return data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid pagination parameters');
    }
    if (error.response?.status === 404) {
      throw new Error('Object not found');
    }
    throw new Error('Failed to fetch records');
  }
};
```

---

## Resources

### Backend Documentation
- [GET /api/records](../../backend-docs/api/03-records/01-list-records.md) - Detailed endpoint documentation
- [Pagination Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Pagination best practices

### Frontend Libraries
- [React Router useSearchParams](https://reactrouter.com/en/main/hooks/use-search-params)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Records Table Pagination task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/06-pagination.md

Requirements:
1. Create src/features/records/components/PaginationControls.tsx - Main pagination UI component
2. Create src/features/records/components/PageSizeSelector.tsx - Page size selector (10/25/50/100)
3. Create src/features/records/components/PageNumberBadges.tsx - Page number display with ellipsis
4. Create src/features/records/hooks/usePagination.ts - Pagination logic + keyboard navigation + URL sync
5. Update src/features/records/hooks/useRecords.ts - Add pagination parameters (page, page_size)
6. Update src/features/records/types/records.types.ts - Add PaginationMeta and RecordsQueryParams types
7. Update src/lib/api/records.api.ts - Add pagination query params to getRecordsAPI
8. Update src/features/records/components/RecordsTable.tsx - Integrate PaginationControls

CRITICAL REQUIREMENTS:
- Default page size: 50, Max: 100
- Page numbers are 1-based (not 0-based)
- Sync page and page_size with URL using useSearchParams
- Show "Showing X-Y of Z records" count display
- Navigation buttons: First, Prev, Page Numbers, Next, Last
- Page size selector: 10, 25, 50, 100 (with active state)
- Disable First/Prev on first page, Next/Last on last page
- Hide pagination if no records
- Keyboard navigation: Arrow keys (Left/Right), Home, End
- Loading state during page change
- Browser back/forward support
- Max 5 page number badges with ellipsis: [1] [2] [3] ... [10]

Follow the exact code examples and file structure provided in the task file. Test with different page sizes and page numbers. Ensure URL sync works properly.
```

---

**Status:** 🟡 Pending
**Next Task:** 07-sorting.md
