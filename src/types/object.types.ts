// Object category enum
export type ObjectCategory = 
  | 'standard'
  | 'custom'
  | 'system';

// Object interface
export interface Object {
  id: string; // Format: obj_xxxxxxxx
  name: string;
  label: string;
  category: ObjectCategory;
  description?: string;
  icon?: string;
  color?: string;
  is_system_object: boolean;
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
}

// Object create request
export interface ObjectCreateRequest {
  name: string;
  label: string;
  category?: ObjectCategory;
  description?: string;
  icon?: string;
  color?: string;
}

// Object update request
export interface ObjectUpdateRequest {
  label?: string;
  category?: ObjectCategory;
  description?: string;
  icon?: string;
  color?: string;
}
