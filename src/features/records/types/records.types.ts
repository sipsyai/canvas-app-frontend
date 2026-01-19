/**
 * Record Types
 *
 * JSONB-based dynamic record system
 */

export interface RecordData {
  id: string;                      // rec_abc12345
  object_id: string;               // obj_contact
  data: { [key: string]: any };    // JSONB - Dynamic field values (field_id → value)
  primary_value: string;           // Auto-calculated from primary field
  created_by: string;              // User ID
  updated_by: string | null;       // User ID
  tenant_id: string;               // Multi-tenancy
  created_at: string;              // ISO timestamp
  updated_at: string | null;       // ISO timestamp
}

export interface RecordListResponse {
  total: number;                   // Total record count
  page: number;                    // Current page number
  page_size: number;               // Records per page
  records: RecordData[];           // Record array
}

export interface RecordCreateRequest {
  object_id: string;               // Object ID (required)
  data: { [key: string]: any };    // Field values (field_id → value)
  primary_value?: string;          // Auto-set from primary field
}

export interface RecordUpdateRequest {
  data: { [key: string]: any };    // Field values to update (MERGE behavior!)
  primary_value?: string;          // Auto-update from primary field
}

export interface GetRecordsParams {
  object_id: string;               // Object ID (REQUIRED)
  page?: number;                   // Page number (default: 1)
  page_size?: number;              // Page size (default: 50, max: 100)
}

export interface SearchRecordsParams {
  object_id: string;               // Object ID (REQUIRED)
  q: string;                       // Search query (REQUIRED)
  page?: number;                   // Page number (default: 1)
  page_size?: number;              // Page size (default: 50, max: 100)
}

/**
 * Table State Types
 */
export interface TableState {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
}

/**
 * Field Renderer Types
 */
export interface FieldRendererProps {
  type: string;
  value: any;
  field: {
    id: string;
    name: string;
    type: string;
    is_primary_field?: boolean;
    config?: { [key: string]: any };
  };
}
