// Record interface
export interface Record {
  id: string; // Format: rec_xxxxxxxx
  object_id: string; // Foreign key to Object
  data: Record<string, any>; // JSON field - flexible key-value pairs
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
}

// Record create request
export interface RecordCreateRequest {
  object_id: string;
  data: Record<string, any>;
}

// Record update request
export interface RecordUpdateRequest {
  data: Record<string, any>;
}
