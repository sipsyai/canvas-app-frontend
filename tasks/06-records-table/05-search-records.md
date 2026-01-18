# Task: Search Records

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 01-records-table-view

---

## Objective

Records tablosunda primary_value üzerinden arama yapabilme, debounced search, autocomplete önerileri ve arama filtreleri ile kullanıcı deneyimini iyileştirmek.

---

## Backend API

### Endpoint
```
GET /api/records/search
```

### Query Parameters
```typescript
interface SearchRecordsParams {
  object_id: string;  // Object ID (örn: "obj_contact")
  q: string;          // Arama terimi (minimum 1 karakter)
}
```

### Response
```json
[
  {
    "id": "rec_a1b2c3d4",
    "object_id": "obj_contact",
    "data": {
      "fld_name": "Ali Yılmaz",
      "fld_email": "ali@example.com"
    },
    "primary_value": "Ali Yılmaz",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "updated_by": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-18T10:00:00Z",
    "updated_at": "2026-01-18T10:00:00Z"
  }
]
```

**Response Fields:**
- `id` - Record ID (rec_xxxxxxxx)
- `object_id` - Object ID
- `data` - JSONB field values (key: fld_xxx, value: any)
- `primary_value` - Primary display value (arama yapılan alan)
- Maksimum 50 sonuç döner

### Error Responses
- `401 Unauthorized` - JWT token geçersiz veya eksik
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [GET /api/records/search](../../backend-docs/api/04-records/06-search-records.md)

---

## UI/UX Design

### Search Bar Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Records Table                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔍 Search records...           [Clear] [Filters ▾]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Showing 3 results for "Ali"                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Table with search results]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Search Autocomplete Dropdown
```
┌──────────────────────────────────────────┐
│  🔍 Ali                                   │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  Search Results (3)                      │
│  ───────────────────────────────────────│
│  👤 Ali Yılmaz                           │
│     ali@example.com                      │
│  ───────────────────────────────────────│
│  👤 Ali Demir                            │
│     ali.demir@company.com                │
│  ───────────────────────────────────────│
│  Recent Searches                         │
│  ───────────────────────────────────────│
│  🕐 Ali (2 minutes ago)                  │
│  🕐 test@example.com (5 minutes ago)     │
└──────────────────────────────────────────┘
```

### Advanced Filters Panel
```
┌──────────────────────────────────────────┐
│  Filters                         [Close] │
│  ───────────────────────────────────────│
│                                          │
│  Date Range                              │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ From Date    │  │ To Date      │    │
│  └──────────────┘  └──────────────┘    │
│                                          │
│  Field Filters                           │
│  ☑ Email contains: example.com          │
│  ☐ Created after: 2026-01-01            │
│  ☐ Updated by: Current User             │
│                                          │
│  [Clear All]      [Apply Filters]       │
└──────────────────────────────────────────┘
```

### Empty Search State
```
┌─────────────────────────────────────────┐
│                                         │
│           🔍                            │
│     No results found for "xyz123"       │
│                                         │
│     Try different search terms or       │
│     clear filters                       │
│                                         │
│     [Clear Search]                      │
│                                         │
└─────────────────────────────────────────┘
```

### Component States
1. **Idle** - Search bar boş, placeholder gösteriyor
2. **Typing** - Kullanıcı yazıyor, debounce bekliyor (300ms)
3. **Loading** - API call yapılıyor, spinner gösteriyor
4. **Results** - Arama sonuçları tabloda gösteriliyor
5. **No Results** - Empty state gösteriliyor
6. **Error** - Hata mesajı gösteriliyor (toast)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── SearchBar.tsx                  ⭐ Search input component
│       │   ├── SearchResults.tsx              ⭐ Results display
│       │   ├── SearchAutocomplete.tsx         ⭐ Autocomplete dropdown
│       │   ├── SearchFilters.tsx              ⭐ Advanced filters panel
│       │   └── EmptySearchState.tsx           ⭐ No results component
│       ├── hooks/
│       │   ├── useSearchRecords.ts            ⭐ Search hook (TanStack Query)
│       │   ├── useDebounce.ts                 ⭐ Debounce hook (300ms)
│       │   └── useRecentSearches.ts           ⭐ localStorage hook
│       └── types/
│           └── search.types.ts                ⭐ TypeScript types
└── lib/
    └── api/
        └── records.api.ts                     ⭐ API calls (searchRecords)
```

### Component Implementation

#### SearchBar.tsx
```typescript
import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { SearchAutocomplete } from './SearchAutocomplete';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SearchBarProps {
  objectId: string;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export const SearchBar = ({ objectId, onSearch, onClear }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const { addRecentSearch, getRecentSearches } = useRecentSearches();

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);
      addRecentSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch, addRecentSearch]);

  const handleClear = () => {
    setQuery('');
    onClear();
    setShowAutocomplete(false);
  };

  const handleSelectSuggestion = (selectedQuery: string) => {
    setQuery(selectedQuery);
    onSearch(selectedQuery);
    setShowAutocomplete(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => setShowAutocomplete(true)}
            placeholder="Search records..."
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {showAutocomplete && query.trim() && (
        <SearchAutocomplete
          query={query}
          objectId={objectId}
          onSelect={handleSelectSuggestion}
          onClose={() => setShowAutocomplete(false)}
        />
      )}
    </div>
  );
};
```

#### SearchAutocomplete.tsx
```typescript
import { useSearchRecords } from '../hooks/useSearchRecords';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { Clock, User } from 'lucide-react';

interface SearchAutocompleteProps {
  query: string;
  objectId: string;
  onSelect: (query: string) => void;
  onClose: () => void;
}

export const SearchAutocomplete = ({
  query,
  objectId,
  onSelect,
  onClose,
}: SearchAutocompleteProps) => {
  const { data: results, isLoading } = useSearchRecords(objectId, query);
  const { getRecentSearches } = useRecentSearches();
  const recentSearches = getRecentSearches();

  const handleClickOutside = () => {
    onClose();
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          Searching...
        </div>
      ) : (
        <>
          {results && results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Search Results ({results.length})
              </div>
              {results.map((record) => (
                <button
                  key={record.id}
                  onClick={() => onSelect(record.primary_value || '')}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-start gap-3"
                >
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {highlightMatch(record.primary_value || '', query)}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {Object.entries(record.data)
                        .slice(0, 2)
                        .map(([key, value]) => value)
                        .join(' • ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Recent Searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(search.query)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center gap-3"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-gray-700">{search.query}</span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(search.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Highlight search matches
const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

// Format relative time (e.g., "2 minutes ago")
const formatRelativeTime = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
};
```

#### SearchResults.tsx
```typescript
import { RecordResponse } from '../types/record.types';
import { EmptySearchState } from './EmptySearchState';

interface SearchResultsProps {
  results: RecordResponse[];
  query: string;
  isLoading: boolean;
  onClearSearch: () => void;
}

export const SearchResults = ({
  results,
  query,
  isLoading,
  onClearSearch,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-gray-600">Searching...</p>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <EmptySearchState query={query} onClearSearch={onClearSearch} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-800">
          Showing <span className="font-semibold">{results.length}</span> result
          {results.length !== 1 ? 's' : ''} for "
          <span className="font-semibold">{query}</span>"
        </p>
      </div>

      {/* RecordsTable component will render here */}
    </div>
  );
};
```

#### EmptySearchState.tsx
```typescript
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptySearchStateProps {
  query: string;
  onClearSearch: () => void;
}

export const EmptySearchState = ({ query, onClearSearch }: EmptySearchStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No results found for "{query}"
      </h3>

      <p className="text-gray-600 text-center mb-6 max-w-md">
        Try different search terms or clear filters to see all records
      </p>

      <Button variant="outline" onClick={onClearSearch}>
        Clear Search
      </Button>
    </div>
  );
};
```

#### useSearchRecords.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { searchRecordsAPI } from '@/lib/api/records.api';
import { RecordResponse } from '../types/record.types';

export const useSearchRecords = (objectId: string, query: string) => {
  return useQuery<RecordResponse[]>({
    queryKey: ['records', 'search', objectId, query],
    queryFn: () => searchRecordsAPI(objectId, query),
    enabled: !!objectId && query.trim().length > 0, // Only search if query exists
    staleTime: 30000, // Cache for 30 seconds
  });
};
```

#### useDebounce.ts
```typescript
import { useState, useEffect } from 'react';

/**
 * Debounce hook - delays updating value until user stops typing
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

#### useRecentSearches.ts
```typescript
import { useState, useEffect } from 'react';

interface RecentSearch {
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const newSearch: RecentSearch = {
      query: query.trim(),
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      // Remove duplicates and add new search at the beginning
      const filtered = prev.filter((s) => s.query !== newSearch.query);
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const getRecentSearches = (): RecentSearch[] => {
    return recentSearches;
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    addRecentSearch,
    getRecentSearches,
    clearRecentSearches,
  };
};
```

#### records.api.ts (update)
```typescript
import { apiClient } from './client';
import { RecordResponse } from '@/features/records/types/record.types';

/**
 * Search records by primary_value
 * @param objectId - Object ID (e.g., "obj_contact")
 * @param query - Search term (minimum 1 character)
 * @returns Array of matching records (max 50)
 */
export const searchRecordsAPI = async (
  objectId: string,
  query: string
): Promise<RecordResponse[]> => {
  if (!query.trim()) {
    return [];
  }

  const { data } = await apiClient.get<RecordResponse[]>('/api/records/search', {
    params: {
      object_id: objectId,
      q: query.trim(),
    },
  });

  return data;
};
```

#### search.types.ts
```typescript
export interface SearchRecordsParams {
  object_id: string;
  q: string; // Search query
}

export interface RecentSearch {
  query: string;
  timestamp: number; // Unix timestamp
}

export interface SearchFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  fieldFilters?: Record<string, any>;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `lucide-react` - Icons (Search, X, Filter, Clock, User)
- `react-hook-form` - Form management (for advanced filters)

### UI Components (To Be Built)
- `Input` component (React Aria)
- `Button` component (React Aria)

---

## Acceptance Criteria

- [ ] Search bar component çalışıyor
- [ ] Debounced search (300ms) çalışıyor
- [ ] Search API endpoint doğru çağrılıyor (GET /api/records/search)
- [ ] Arama sonuçları tabloda gösteriliyor
- [ ] Search matches highlight ediliyor (sarı background)
- [ ] Autocomplete dropdown çalışıyor
- [ ] Recent searches localStorage'da saklanıyor
- [ ] Empty search state gösteriliyor ("No results found...")
- [ ] Clear search button çalışıyor
- [ ] Loading state gösteriliyor (spinner)
- [ ] Advanced filters panel çalışıyor (opsiyonel)
- [ ] Mobile responsive design
- [ ] Maksimum 50 sonuç limiti uygulanıyor

---

## Testing Checklist

### Manual Testing
- [ ] Boş search input → API call yapılmıyor
- [ ] 1 karakter yazma → debounce sonrası API call
- [ ] Hızlı yazma → sadece son query için API call (debounce)
- [ ] Autocomplete dropdown açılıyor/kapanıyor
- [ ] Autocomplete'den seçim → search yapılıyor
- [ ] Recent searches gösteriliyor
- [ ] Clear search button → input temizleniyor ve sonuçlar sıfırlanıyor
- [ ] Sonuç bulunamadı → empty state gösteriliyor
- [ ] Loading state çalışıyor
- [ ] Search matches highlight ediliyor
- [ ] Outside click → autocomplete kapanıyor

### Performance Testing
- [ ] Debounce 300ms çalışıyor
- [ ] API response < 100ms (backend optimized)
- [ ] Recent searches localStorage'da persist ediyor
- [ ] Maksimum 10 recent search saklanıyor

### Test Scenarios
**Test Case 1: Search for "Ali"**
```
Input: "Ali"
Expected: Records with primary_value containing "Ali"
Result: Ali Yılmaz, Ali Demir, etc.
```

**Test Case 2: Search for non-existent term**
```
Input: "xyz123"
Expected: Empty search state
Result: "No results found for 'xyz123'"
```

**Test Case 3: Debounce test**
```
Input: "A" → "Al" → "Ali" (fast typing)
Expected: Only 1 API call for "Ali" after 300ms
```

---

## Code Examples

### Complete Search Flow
```typescript
// 1. User types in search bar
// 2. useDebounce delays API call (300ms)
// 3. useSearchRecords triggers API call
// 4. Results displayed in autocomplete + table
// 5. Query saved to recent searches (localStorage)
// 6. User can clear search or select from autocomplete
```

### Integration with RecordsTable
```typescript
// RecordsTablePage.tsx
import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { RecordsTable } from '../components/RecordsTable';
import { useSearchRecords } from '../hooks/useSearchRecords';

export const RecordsTablePage = ({ objectId }: { objectId: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading } = useSearchRecords(objectId, searchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <SearchBar
        objectId={objectId}
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />

      {searchQuery.trim() ? (
        <SearchResults
          results={searchResults || []}
          query={searchQuery}
          isLoading={isLoading}
          onClearSearch={handleClearSearch}
        />
      ) : (
        <RecordsTable objectId={objectId} />
      )}
    </div>
  );
};
```

### Error Handling
```typescript
// useSearchRecords.ts
export const useSearchRecords = (objectId: string, query: string) => {
  return useQuery<RecordResponse[]>({
    queryKey: ['records', 'search', objectId, query],
    queryFn: async () => {
      try {
        return await searchRecordsAPI(objectId, query);
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error('Search failed. Please try again.');
      }
    },
    enabled: !!objectId && query.trim().length > 0,
    retry: 1, // Only retry once
  });
};
```

---

## Performance Optimization

### Backend Performance
- **Primary Value Index:** B-tree index on `primary_value` column
- **Query Time:** ~10ms (vs 70ms for JSONB search)
- **Index Usage:** `idx_records_primary_value`

### Frontend Performance
- **Debouncing:** 300ms delay prevents excessive API calls
- **Query Caching:** TanStack Query caches results for 30 seconds
- **Recent Searches:** localStorage (no API calls for suggestions)
- **Lazy Loading:** Autocomplete only loads when input focused

### Comparison Table
| Method | Query Time | Index Type |
|--------|-----------|-----------|
| primary_value ILIKE | ~10ms | B-tree |
| JSONB contains | ~70ms | GIN |

---

## Resources

### Backend Documentation
- [GET /api/records/search](../../backend-docs/api/04-records/06-search-records.md) - Detailed endpoint documentation
- [Records Overview](../../backend-docs/api/04-records/README.md) - Records API overview

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Lucide React Icons](https://lucide.dev/)
- [React Hook Form Docs](https://react-hook-form.com/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Search Records task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/05-search-records.md

Requirements:
1. Create src/features/records/components/SearchBar.tsx - Search input with debounce and autocomplete
2. Create src/features/records/components/SearchAutocomplete.tsx - Autocomplete dropdown with results and recent searches
3. Create src/features/records/components/SearchResults.tsx - Search results display wrapper
4. Create src/features/records/components/EmptySearchState.tsx - No results found component
5. Create src/features/records/hooks/useSearchRecords.ts - TanStack Query hook for search API
6. Create src/features/records/hooks/useDebounce.ts - Debounce hook (300ms delay)
7. Create src/features/records/hooks/useRecentSearches.ts - localStorage hook for recent searches
8. Update src/lib/api/records.api.ts - Add searchRecordsAPI function
9. Create src/features/records/types/search.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Search endpoint: GET /api/records/search?object_id={id}&q={query}
- Backend searches only primary_value field (not JSONB data)
- Debounce delay: 300ms (prevent excessive API calls)
- Autocomplete shows search results + recent searches
- Highlight search matches with yellow background (<mark> tag)
- Recent searches stored in localStorage (max 10)
- Empty search state when no results found
- Loading state with spinner
- Clear search button
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 06-filter-records.md
