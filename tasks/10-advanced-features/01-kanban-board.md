# Task: Kanban Board

**Priority:** 🟢 Low
**Estimated Time:** 3 gün
**Dependencies:** 06-records-table, dnd-kit

---

## Objective

Kayıtları (records) Kanban board görünümünde göstermek ve select field'lara göre sütunlar halinde düzenlemek. Kartları sütunlar arasında drag-and-drop ile taşıyabilme.

---

## Backend API

### Endpoint (Kayıtları Çekmek)
```
GET /api/objects/{object_id}/records
```

### Response
```json
{
  "records": [
    {
      "id": "rec_1",
      "object_id": "obj_opportunities",
      "primary_value": "Acme Corp Deal",
      "fields": {
        "stage": "Proposal",
        "value": "$50,000",
        "close_date": "2024-03-15",
        "contact": "John Doe"
      },
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Endpoint (Kayıt Güncellemek - Drop İşlemi)
```
PATCH /api/records/{record_id}
```

### Request
```json
{
  "fields": {
    "stage": "Negotiation"  // Yeni sütun değeri
  }
}
```

### Response
```json
{
  "id": "rec_1",
  "object_id": "obj_opportunities",
  "primary_value": "Acme Corp Deal",
  "fields": {
    "stage": "Negotiation",  // Güncellendi
    "value": "$50,000",
    "close_date": "2024-03-15",
    "contact": "John Doe"
  },
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Backend Documentation:**
→ [GET /api/objects/{object_id}/records](../../backend-docs/api/05-records/01-list-records.md)
→ [PATCH /api/records/{record_id}](../../backend-docs/api/05-records/04-update-record.md)

---

## UI/UX Design

### Kanban Board Layout (Trello-Style)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Opportunities Kanban Board           [🔍 Search] [⚙️ Filter]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │ Qualification│  │   Proposal   │  │ Negotiation  │  │  Closed │││
│  │   (3 items)  │  │  (5 items)   │  │  (2 items)   │  │ (8 items)││
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────┤│
│  │              │  │              │  │              │  │         ││
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────┐││
│  │ │ Acme Corp│ │  │ │ TechStart│ │  │ │ BigCo    │ │  │ │FastC││││
│  │ │ $50,000  │ │  │ │ $120,000 │ │  │ │ $200,000 │ │  │ │$80,0││││
│  │ │ John Doe │ │  │ │ Sarah Lee│ │  │ │ Mike Chen│ │  │ │Lisa ││││
│  │ │ Mar 15   │ │  │ │ Apr 20   │ │  │ │ Feb 28   │ │  │ │Jan 1││││
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │ └──────┘││
│  │              │  │              │  │              │  │         ││
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────┐││
│  │ │ NewCo    │ │  │ │ StartInc │ │  │ │ MegaCorp │ │  │ │Cloud││││
│  │ │ $30,000  │ │  │ │ $75,000  │ │  │ │ $150,000 │ │  │ │$60,0││││
│  │ │ Emma Wil │ │  │ │ Tom Brown│ │  │ │ Amy Park │ │  │ │Alex ││││
│  │ │ Apr 10   │ │  │ │ May 05   │ │  │ │ Mar 22   │ │  │ │Feb 1││││
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │ └──────┘││
│  │              │  │              │  │              │  │         ││
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │              │  │ ┌──────┐││
│  │ │ SmallBiz │ │  │ │ MidSize  │ │  │              │  │ │Inno ││││
│  │ │ $20,000  │ │  │ │ $90,000  │ │  │              │  │ │$40,0││││
│  │ │ Chris Ta │ │  │ │ Diana Ko │ │  │              │  │ │Sam  ││││
│  │ │ May 15   │ │  │ │ Jun 01   │ │  │              │  │ │Jan 2││││
│  │ └──────────┘ │  │ └──────────┘ │  │              │  │ └──────┘││
│  │              │  │              │  │              │  │         ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Kanban Card Design
```
┌─────────────────────────────┐
│ 📄 Acme Corp Deal           │ ← primary_value (bold)
├─────────────────────────────┤
│ 💰 $50,000                  │ ← Field 1 (value field)
│ 👤 John Doe                 │ ← Field 2 (contact field)
│ 📅 Mar 15, 2024             │ ← Field 3 (close_date field)
└─────────────────────────────┘
```

### Features
1. **Sütunlar (Columns)**
   - Select field options'a göre otomatik oluşturulur
   - Örnek: Stage field → Qualification, Proposal, Negotiation, Closed
   - Her sütun başlığında item sayısı gösterilir
   - Renkli başlık (her sütun farklı renk)

2. **Kartlar (Cards)**
   - Primary value büyük font (başlık)
   - 2-3 önemli field gösterilir (configurable)
   - Hover effect (shadow + scale)
   - Click to open record detail modal

3. **Drag and Drop**
   - @dnd-kit/core kullanılacak
   - Kartı farklı sütuna taşıma
   - Drop sonrası otomatik API call (PATCH /api/records/{id})
   - Optimistic update (anında UI güncellenir)
   - Drop sırasında visual feedback (opacity + border)

4. **Filter ve Search**
   - Search bar (primary_value'da arama)
   - Filter button (field'lara göre filtreleme)
   - Clear filters button

5. **Responsive Design**
   - Desktop: Yan yana sütunlar (horizontal scroll)
   - Tablet: 2 sütun yan yana
   - Mobile: Tek sütun (accordion/tabs arası geçiş)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── kanban/
│       ├── pages/
│       │   └── KanbanBoardPage.tsx       ⭐ Main page
│       ├── components/
│       │   ├── KanbanBoard.tsx           ⭐ Board container
│       │   ├── KanbanColumn.tsx          ⭐ Column component
│       │   ├── KanbanCard.tsx            ⭐ Card component
│       │   └── KanbanFilters.tsx         🔧 Filter toolbar
│       ├── hooks/
│       │   ├── useKanban.ts              ⭐ Main kanban hook
│       │   ├── useKanbanDragDrop.ts      ⭐ Drag-drop logic
│       │   └── useUpdateRecord.ts        🔧 Update mutation
│       └── types/
│           └── kanban.types.ts           ⭐ TypeScript types
├── lib/
│   └── api/
│       └── records.api.ts                🔧 Records API calls
```

### Component Implementation

#### KanbanBoardPage.tsx
```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../components/KanbanBoard';
import { KanbanFilters } from '../components/KanbanFilters';
import { useKanban } from '../hooks/useKanban';

export const KanbanBoardPage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const {
    columns,
    groupByField,
    isLoading,
    error
  } = useKanban(objectId!, searchQuery, filters);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {groupByField?.label || 'Kanban Board'}
          </h1>

          <KanbanFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={columns}
          groupByField={groupByField}
          objectId={objectId!}
        />
      </div>
    </div>
  );
};
```

#### KanbanBoard.tsx
```typescript
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from '../types/kanban.types';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  groupByField: any;
  objectId: string;
}

export const KanbanBoard = ({ columns, groupByField, objectId }: KanbanBoardProps) => {
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const { handleDragEnd } = useKanbanDragDrop(objectId, groupByField.name);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns
      .flatMap(col => col.cards)
      .find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    handleDragEnd(event);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={onDragEnd}>
      <div className="h-full overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              groupByFieldName={groupByField.name}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanCard
            card={activeCard}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
```

#### KanbanColumn.tsx
```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn as KanbanColumnType } from '../types/kanban.types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  groupByFieldName: string;
}

export const KanbanColumn = ({ column, groupByFieldName }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
      value: column.value,
    },
  });

  return (
    <div className="flex flex-col w-80 bg-gray-100 rounded-lg flex-shrink-0">
      {/* Column Header */}
      <div
        className="p-4 border-b border-gray-200"
        style={{ backgroundColor: column.color || '#e5e7eb' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{column.label}</h3>
          <span className="px-2 py-1 text-xs font-medium bg-white/50 rounded-full">
            {column.cards.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        <SortableContext
          items={column.cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
            />
          ))}
        </SortableContext>

        {column.cards.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No items
          </div>
        )}
      </div>
    </div>
  );
};
```

#### KanbanCard.tsx
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard as KanbanCardType } from '../types/kanban.types';

interface KanbanCardProps {
  card: KanbanCardType;
  isDragging?: boolean;
}

export const KanbanCard = ({ card, isDragging = false }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4
        hover:shadow-md hover:border-blue-300 transition-all cursor-move
        ${isDragging ? 'shadow-xl ring-2 ring-blue-400' : ''}
      `}
    >
      {/* Primary Value (Title) */}
      <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
        {card.primaryValue}
      </h4>

      {/* Display Fields */}
      <div className="space-y-2">
        {card.displayFields.map((field, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {field.icon && <span className="text-gray-400">{field.icon}</span>}
            <span className="text-gray-600">{field.label}:</span>
            <span className="text-gray-900 font-medium">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Footer (Optional: Tags, Priority, etc.) */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### useKanban.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRecordsAPI } from '@/lib/api/records.api';
import { getObjectFieldsAPI } from '@/lib/api/objects.api';
import { KanbanColumn, KanbanCard } from '../types/kanban.types';

export const useKanban = (
  objectId: string,
  searchQuery: string = '',
  filters: Record<string, any> = {}
) => {
  // Fetch object fields to find select field for grouping
  const { data: fields } = useQuery({
    queryKey: ['objectFields', objectId],
    queryFn: () => getObjectFieldsAPI(objectId),
  });

  // Find the select field to group by (e.g., "stage", "status")
  // For now, we'll use the first select field
  const groupByField = useMemo(() => {
    return fields?.find(field => field.type === 'select');
  }, [fields]);

  // Fetch records
  const { data: recordsData, isLoading, error } = useQuery({
    queryKey: ['records', objectId, searchQuery, filters],
    queryFn: () => getRecordsAPI(objectId, { search: searchQuery, ...filters }),
    enabled: !!objectId,
  });

  // Group records into columns
  const columns = useMemo<KanbanColumn[]>(() => {
    if (!groupByField || !recordsData?.records) return [];

    // Get all possible values from select field options
    const columnOptions = groupByField.options || [];

    // Create columns
    return columnOptions.map((option: any, index: number) => {
      // Filter records for this column
      const columnRecords = recordsData.records.filter(
        record => record.fields[groupByField.name] === option.value
      );

      // Convert records to cards
      const cards: KanbanCard[] = columnRecords.map(record => ({
        id: record.id,
        recordId: record.id,
        primaryValue: record.primary_value,
        displayFields: [
          // Show first 3 fields (configurable later)
          { label: 'Value', value: record.fields.value || '-', icon: '💰' },
          { label: 'Contact', value: record.fields.contact || '-', icon: '👤' },
          { label: 'Date', value: record.fields.close_date || '-', icon: '📅' },
        ].filter(f => f.value !== '-'),
        tags: record.tags || [],
        columnValue: option.value,
      }));

      return {
        id: option.value,
        label: option.label,
        value: option.value,
        color: option.color || getColumnColor(index),
        cards,
      };
    });
  }, [groupByField, recordsData]);

  return {
    columns,
    groupByField,
    isLoading,
    error,
  };
};

// Helper function to assign colors to columns
const getColumnColor = (index: number): string => {
  const colors = [
    '#e0f2fe', // sky-100
    '#dbeafe', // blue-100
    '#e0e7ff', // indigo-100
    '#ede9fe', // violet-100
    '#fae8ff', // fuchsia-100
    '#fce7f3', // pink-100
  ];
  return colors[index % colors.length];
};
```

#### useKanbanDragDrop.ts
```typescript
import { DragEndEvent } from '@dnd-kit/core';
import { useUpdateRecord } from './useUpdateRecord';
import { toast } from 'sonner';

export const useKanbanDragDrop = (objectId: string, groupByFieldName: string) => {
  const { mutate: updateRecord } = useUpdateRecord();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Get card data
    const cardData = active.data.current;
    const card = cardData?.card;

    if (!card) return;

    // Get target column data
    const targetColumnData = over.data.current;
    const targetColumnValue = targetColumnData?.value;

    if (!targetColumnValue) return;

    // If card is dropped in the same column, do nothing
    if (card.columnValue === targetColumnValue) return;

    // Update record
    updateRecord(
      {
        recordId: card.recordId,
        updates: {
          fields: {
            [groupByFieldName]: targetColumnValue,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success('Record updated successfully');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update record');
        },
      }
    );
  };

  return { handleDragEnd };
};
```

#### useUpdateRecord.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRecordAPI } from '@/lib/api/records.api';

interface UpdateRecordParams {
  recordId: string;
  updates: {
    fields: Record<string, any>;
  };
}

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, updates }: UpdateRecordParams) => {
      return await updateRecordAPI(recordId, updates);
    },
    onSuccess: () => {
      // Invalidate records query to refetch
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};
```

#### kanban.types.ts
```typescript
export interface KanbanCard {
  id: string;
  recordId: string;
  primaryValue: string;
  displayFields: {
    label: string;
    value: string;
    icon?: string;
  }[];
  tags?: string[];
  columnValue: string; // Current column value (e.g., "Proposal")
}

export interface KanbanColumn {
  id: string;
  label: string;
  value: string;
  color?: string;
  cards: KanbanCard[];
}

export interface KanbanBoardConfig {
  objectId: string;
  groupByFieldName: string; // e.g., "stage", "status"
  displayFields: string[]; // Fields to show on cards
  colorScheme?: Record<string, string>; // Custom colors for columns
}
```

#### records.api.ts (Update)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Record {
  id: string;
  object_id: string;
  primary_value: string;
  fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface GetRecordsParams {
  search?: string;
  [key: string]: any;
}

export const getRecordsAPI = async (
  objectId: string,
  params?: GetRecordsParams
): Promise<{ records: Record[] }> => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/objects/${objectId}/records`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      params,
    }
  );
  return data;
};

export const updateRecordAPI = async (
  recordId: string,
  updates: { fields: Record<string, any> }
): Promise<Record> => {
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/records/${recordId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return data;
};
```

---

## Dependencies

### NPM Packages
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install sonner  # Toast notifications
```

**dnd-kit Packages:**
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable items within columns
- `@dnd-kit/utilities` - Helper utilities (CSS transform)

**Already Installed:**
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-router-dom` - Routing

---

## Acceptance Criteria

- [ ] Kanban board `/objects/{objectId}/kanban` route'unda çalışıyor
- [ ] Select field options'a göre sütunlar otomatik oluşturuluyor
- [ ] Her sütunda kayıt sayısı gösteriliyor
- [ ] Kartlar primary_value + 2-3 field gösteriyor
- [ ] Drag-and-drop çalışıyor (kartları sütunlar arası taşıma)
- [ ] Drop sonrası API call yapılıyor (PATCH /api/records/{id})
- [ ] Optimistic update çalışıyor (UI anında güncelleniyor)
- [ ] Search bar ile primary_value'da arama yapılabiliyor
- [ ] Filter button ile field'lara göre filtreleme yapılabiliyor
- [ ] Responsive design (desktop/tablet/mobile)
- [ ] Loading state gösteriliyor
- [ ] Error handling (toast notifications)
- [ ] Horizontal scroll çalışıyor (çok sütun varsa)

---

## Testing Checklist

### Manual Testing
- [ ] Kanban board yükleniyor
- [ ] Sütunlar doğru oluşturuluyor (select field options)
- [ ] Kartlar doğru sütunlarda görünüyor
- [ ] Kartı farklı sütuna sürükleyip bırakma çalışıyor
- [ ] Drop sonrası API call yapılıyor
- [ ] Record güncellenmiş olarak backend'e kaydediliyor
- [ ] Search ile filtreleme çalışıyor
- [ ] Filter button ile filtreleme çalışıyor
- [ ] Responsive design test (mobile/tablet/desktop)
- [ ] Loading state gösteriliyor
- [ ] Error durumunda toast notification gösteriliyor
- [ ] Horizontal scroll çalışıyor (çok sütun varsa)

### Test Scenarios

#### Scenario 1: Opportunity Kanban (by Stage)
```
Object: Opportunities
Group By Field: stage (select)
Options:
  - Qualification
  - Proposal
  - Negotiation
  - Closed Won
  - Closed Lost

Card Fields:
  - Primary: Deal Name
  - Field 1: Value (currency)
  - Field 2: Contact Name
  - Field 3: Close Date
```

#### Scenario 2: Ticket Kanban (by Status)
```
Object: Support Tickets
Group By Field: status (select)
Options:
  - New
  - In Progress
  - Waiting on Customer
  - Resolved
  - Closed

Card Fields:
  - Primary: Ticket Title
  - Field 1: Priority (High/Medium/Low)
  - Field 2: Assignee
  - Field 3: Created Date
```

---

## Code Examples

### Complete Kanban Flow
```typescript
// 1. User opens kanban board
// 2. useKanban hook fetches records
// 3. Records grouped by select field (e.g., "stage")
// 4. Columns created (one per select option)
// 5. Cards displayed in columns
// 6. User drags card to different column
// 7. onDragEnd event fires
// 8. useKanbanDragDrop extracts card + target column
// 9. updateRecord mutation called
// 10. API PATCH request sent
// 11. Backend updates record
// 12. QueryClient invalidates cache
// 13. Records refetched
// 14. UI updates with new data
```

### Drag-Drop Event Flow
```typescript
// DragStart
onDragStart(event) {
  const card = findCard(event.active.id);
  setActiveCard(card); // Show drag overlay
}

// DragEnd
onDragEnd(event) {
  const { active, over } = event;

  if (!over) return; // Dropped outside

  const card = active.data.current.card;
  const targetColumn = over.data.current.value;

  // Update record
  updateRecord({
    recordId: card.recordId,
    updates: {
      fields: {
        stage: targetColumn // New column value
      }
    }
  });

  setActiveCard(null); // Hide drag overlay
}
```

### Optimistic Update Example
```typescript
// In useUpdateRecord hook
export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecordAPI,

    // Optimistic update (instant UI feedback)
    onMutate: async ({ recordId, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['records'] });

      // Snapshot previous value
      const previousRecords = queryClient.getQueryData(['records']);

      // Optimistically update cache
      queryClient.setQueryData(['records'], (old: any) => {
        return {
          ...old,
          records: old.records.map((r: any) =>
            r.id === recordId
              ? { ...r, fields: { ...r.fields, ...updates.fields } }
              : r
          ),
        };
      });

      return { previousRecords };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['records'], context?.previousRecords);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};
```

---

## Resources

### Backend Documentation
- [GET /api/objects/{object_id}/records](../../backend-docs/api/05-records/01-list-records.md)
- [PATCH /api/records/{record_id}](../../backend-docs/api/05-records/04-update-record.md)

### Frontend Libraries
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [dnd-kit Sortable Guide](https://docs.dndkit.com/presets/sortable)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Sonner Toast](https://sonner.emilkowal.ski/)

### Design Inspiration
- [Trello Board](https://trello.com/)
- [Linear Kanban](https://linear.app/)
- [Notion Kanban](https://www.notion.so/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Kanban Board task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/10-advanced-features/01-kanban-board.md

Requirements:
1. Create src/features/kanban/pages/KanbanBoardPage.tsx - Main kanban board page with filters
2. Create src/features/kanban/components/KanbanBoard.tsx - Board container with DndContext
3. Create src/features/kanban/components/KanbanColumn.tsx - Column component (droppable area)
4. Create src/features/kanban/components/KanbanCard.tsx - Card component (draggable item)
5. Create src/features/kanban/components/KanbanFilters.tsx - Search and filter toolbar
6. Create src/features/kanban/hooks/useKanban.ts - Main kanban hook (fetch + group records)
7. Create src/features/kanban/hooks/useKanbanDragDrop.ts - Drag-drop event handler
8. Create src/features/kanban/hooks/useUpdateRecord.ts - Update record mutation with optimistic updates
9. Create src/features/kanban/types/kanban.types.ts - TypeScript type definitions
10. Update src/lib/api/records.api.ts - Add getRecordsAPI and updateRecordAPI functions

CRITICAL REQUIREMENTS:
- Use @dnd-kit/core for drag-and-drop (NOT react-beautiful-dnd)
- Columns are created from select field options automatically
- Cards show primary_value + 2-3 configurable fields
- On drop, update record via PATCH /api/records/{record_id}
- Implement optimistic updates (instant UI feedback)
- Add toast notifications on success/error (sonner)
- Horizontal scroll for many columns
- Responsive design (desktop/tablet/mobile)
- Trello-style visual design

Install dependencies:
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner

Example use cases:
- Opportunity kanban by "stage" field (Qualification → Proposal → Negotiation → Closed)
- Ticket kanban by "status" field (New → In Progress → Resolved → Closed)

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-calendar-view.md (advanced feature)
