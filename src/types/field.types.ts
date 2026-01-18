// Field type enum (12 types as per task requirements)
export type FieldType =
  | 'text'        // Single line text
  | 'email'       // Email address
  | 'phone'       // Phone number
  | 'number'      // Number (integer/decimal)
  | 'date'        // Date picker
  | 'datetime'    // Date + Time picker
  | 'textarea'    // Multi-line text
  | 'select'      // Dropdown (single select)
  | 'multiselect' // Multi-select dropdown
  | 'checkbox'    // Boolean checkbox
  | 'radio'       // Radio buttons
  | 'url';        // URL

// Field interface
export interface Field {
  id: string; // Format: fld_xxxxxxxx
  name: string;
  label: string;
  type: FieldType;
  description: string | null;
  category: string | null;
  is_global: boolean;
  is_system_field: boolean;
  is_custom: boolean;
  config: Record<string, any>;
  created_by: string | null; // User UUID (null for system fields)
  created_at: string;
  updated_at: string;
}

// Field create request
export interface FieldCreateRequest {
  name: string;
  label: string;
  type: FieldType;
  category?: string | null;
  description?: string | null;
  config?: Record<string, any>;
}

// Field update request
export interface FieldUpdateRequest {
  label?: string;
  category?: string | null;
  description?: string | null;
  config?: Record<string, any>;
}
