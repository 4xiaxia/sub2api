// Database types
export interface User {
  id: string
  username: string
  email: string
  balance: number
  role: 'user' | 'admin'
  group_id?: string
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  key_hash: string
  name: string
  description?: string
  rpm_limit: number
  tpm_limit: number
  token_quota: number
  used_tokens: number
  is_active: boolean
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  api_key_id?: string
  request_path: string
  request_method: string
  tokens_used: number
  cost: number
  success: boolean
  error_message?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  start_date: string
  end_date: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  admin_id: string
  total_quota: number
  used_quota: number
  created_at: string
  updated_at: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

// Request types
export interface CreateApiKeyRequest {
  name: string
  description?: string
  rpm_limit: number
  tpm_limit: number
  token_quota: number
  group_id?: string
}

export interface UpdateApiKeyRequest {
  id: string
  name?: string
  description?: string
  rpm_limit?: number
  tpm_limit?: number
  is_active?: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  identifier: string // username or email
  password: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
}

// Statistics types
export interface UsageStats {
  total_calls: number
  total_tokens: number
  total_cost: number
  success_rate: number
}

export interface AdminStats {
  total_users: number
  active_users: number
  total_api_keys: number
  total_usage_today: number
  total_revenue: number
}
