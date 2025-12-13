/**
 * API Response Types
 *
 * Standard response format for all API endpoints
 */

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    request_id?: string;
  };
};

export type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
  meta?: {
    timestamp: string;
    request_id?: string;
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Pagination types
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Filter types
 */
export type FilterParams = {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Lead types
 */
export type Lead = {
  id: string;
  consultant_id: string;
  whatsapp_number: string;
  name: string;
  email: string | null;
  status: 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'fechado' | 'perdido';
  score: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type LeadCreateInput = {
  whatsapp_number: string;
  name?: string;
  email?: string;
  metadata?: Record<string, unknown>;
};

export type LeadUpdateInput = Partial<Omit<Lead, 'id' | 'consultant_id' | 'created_at'>>;

/**
 * Conversation types
 */
export type Conversation = {
  id: string;
  lead_id: string;
  flow_id: string;
  state: Record<string, unknown>;
  current_step_id: string;
  started_at: string;
  completed_at: string | null;
};

/**
 * Message types
 */
export type Message = {
  id: string;
  conversation_id: string;
  sender: 'lead' | 'bot';
  content: string;
  message_type: 'text' | 'image';
  metadata: Record<string, unknown> | null;
  sent_at: string;
};
