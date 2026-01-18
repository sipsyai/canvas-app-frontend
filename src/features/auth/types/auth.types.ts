export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface LoginRequest {
  username: string; // Email (backend expects 'username' key)
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Token expiry in seconds (3600 = 1 hour)
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
