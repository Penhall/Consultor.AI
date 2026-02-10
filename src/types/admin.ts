/**
 * Admin panel type definitions for Consultor.AI.
 * Used by admin dashboard, users management, and daily stats.
 */

/** Single day stats record from daily_stats table */
export interface DailyStatsRow {
  id: number;
  date: string;
  totalViews: number;
  prevDayViewsChangePercent: string;
  userCount: number;
  paidUserCount: number;
  userDelta: number;
  paidUserDelta: number;
  totalRevenue: number;
  totalProfit: number;
  createdAt: string;
  sources: PageViewSourceRow[];
}

/** Traffic source for a given day */
export interface PageViewSourceRow {
  name: string;
  date: string;
  visitors: number;
}

/** User row returned by admin users API */
export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  credits: number;
  isAdmin: boolean;
  createdAt: string;
}

/** Response from GET /api/admin/stats */
export interface AdminStatsResponse {
  totalRevenue: number;
  paidUsers: number;
  totalUsers: number;
  pageViews: number;
  userDelta: number;
  paidUserDelta: number;
  dailyStats: DailyStatsRow[];
}

/** Response from GET /api/admin/users */
export interface AdminUsersResponse {
  users: AdminUserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Request body for PATCH /api/admin/users */
export interface AdminUserPatchRequest {
  userId: string;
  isAdmin: boolean;
}

/** Response from PATCH /api/admin/users */
export interface AdminUserPatchResponse {
  userId: string;
  isAdmin: boolean;
  updatedAt: string;
}

/** Log entry from logs table */
export interface LogEntry {
  id: number;
  message: string;
  level: 'info' | 'warn' | 'error' | 'job-error';
  createdAt: string;
}

/** Contact form message */
export interface ContactFormMessage {
  id: string;
  consultantId: string;
  content: string;
  isRead: boolean;
  repliedAt: string | null;
  createdAt: string;
}
