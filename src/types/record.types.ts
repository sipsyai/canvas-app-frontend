/**
 * Data Record Types
 *
 * JSONB-based dynamic record system
 */

// Data Record interface (renamed to avoid conflict with built-in Record type)
export interface DataRecord {
  id: string;                      // Format: rec_xxxxxxxx
  object_id: string;               // Foreign key to Object
  data: Record<string, any>;       // JSONB - Dynamic field values (field_id → value)
  primary_value: string;           // Auto-calculated from primary field
  created_by: string;              // User ID
  updated_by: string | null;       // User ID
  tenant_id: string;               // Multi-tenancy
  created_at: string;              // ISO timestamp
  updated_at: string | null;       // ISO timestamp
}

// Record list response with pagination
export interface RecordListResponse {
  total: number;                   // Total record count
  page: number;                    // Current page number
  page_size: number;               // Records per page
  records: DataRecord[];           // Record array
}

// Record create request
export interface RecordCreateRequest {
  object_id: string;
  data: Record<string, any>;       // Field values (field_id → value)
  primary_value?: string;          // Auto-set from primary field
}

// Record update request
export interface RecordUpdateRequest {
  data: Record<string, any>;       // Field values to update (MERGE behavior!)
  primary_value?: string;          // Auto-update from primary field
}
