// Generic API response wrapper
export interface APIResponse<T> {
  data: T;
  message?: string;
}

// Generic API error
export interface APIError {
  status?: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  originalError?: any;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
