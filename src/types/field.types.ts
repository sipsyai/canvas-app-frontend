// Field type enum
export type FieldType = 
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'rich_text'
  | 'file'
  | 'image'
  | 'currency'
  | 'percent'
  | 'rating'
  | 'checkbox'
  | 'radio'
  | 'relationship';

// Field category enum
export type FieldCategory = 
  | 'basic'
  | 'advanced'
  | 'system';

// Field interface
export interface Field {
  id: string; // Format: fld_xxxxxxxx
  name: string;
  label: string;
  type: FieldType;
  category: FieldCategory;
  is_system_field: boolean;
  description?: string;
  validation_rules?: Record<string, any>;
  default_value?: any;
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
}

// Field create request
export interface FieldCreateRequest {
  name: string;
  label: string;
  type: FieldType;
  category?: FieldCategory;
  description?: string;
  validation_rules?: Record<string, any>;
  default_value?: any;
}

// Field update request
export interface FieldUpdateRequest {
  label?: string;
  category?: FieldCategory;
  description?: string;
  validation_rules?: Record<string, any>;
  default_value?: any;
}
