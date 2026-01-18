// ObjectField junction type between Object and Field
export interface ObjectField {
  id: string; // Format: ofd_xxxxxxxx
  object_id: string; // Format: obj_xxxxxxxx
  field_id: string; // Format: fld_xxxxxxxx
  display_order: number; // 0+ for ordering
  is_required: boolean; // Is this field required?
  is_visible: boolean; // Is this field visible?
  is_readonly: boolean; // Is this field read-only?
  field_overrides: Record<string, any>; // Field-specific config overrides
  created_at: string;
}

// ObjectField create request
export interface ObjectFieldCreateRequest {
  object_id: string;
  field_id: string;
  display_order?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
  field_overrides?: Record<string, any>;
}

// ObjectField update request (partial update)
export interface ObjectFieldUpdateRequest {
  display_order?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
  field_overrides?: Record<string, any>;
}

// ObjectField with full Field details (for display)
export interface ObjectFieldWithDetails extends ObjectField {
  field?: {
    id: string;
    name: string;
    label: string;
    type: string;
    description: string | null;
    category: string | null;
    is_global: boolean;
    is_system_field: boolean;
  };
}
