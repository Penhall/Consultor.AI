/**
 * Types for the Navigation Diagnostic & Link Crawler
 */

/** Content classification categories (Portuguese, matching report sections) */
export type ContentCategory = 'funcionando' | 'quebrado' | 'placeholder' | 'acesso_negado';

/** Content flags detected during classification */
export type ContentFlag =
  | 'TODO'
  | 'FIXME'
  | 'HACK'
  | 'XXX'
  | 'lorem-ipsum'
  | 'coming-soon'
  | 'placeholder-text'
  | 'empty-content'
  | 'empty-array'
  | 'empty-object'
  | 'null-data'
  | 'stub-response'
  | 'minimal-text'
  | 'redirect-to-login'
  | 'timeout'
  | 'connection-error';

/** Result of crawling a single route */
export interface CrawlResult {
  url: string;
  path: string;
  method: string;
  role: string;
  statusCode: number;
  responseTimeMs: number;
  contentType: string;
  category: ContentCategory;
  redirectTo: string | null;
  notes: string;
  contentFlags: ContentFlag[];
  responseBody?: string;
}

/** A known route to be tested */
export interface RouteDefinition {
  path: string;
  type: 'page' | 'api';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  adminOnly: boolean;
  dynamicParams?: Record<string, EntityType>;
  description: string;
}

/** Entity types for dynamic route param resolution */
export type EntityType =
  | 'lead'
  | 'flow'
  | 'conversation'
  | 'consultant'
  | 'file'
  | 'crm_integration'
  | 'follow_up'
  | 'template';

/** Resolved seed data IDs for dynamic routes */
export interface SeedIds {
  leadId: string | null;
  flowId: string | null;
  conversationId: string | null;
  consultantId: string | null;
  fileId: string | null;
  crmIntegrationId: string | null;
  followUpId: string | null;
  templateId: string | null;
}

/** A broken internal link found in a page */
export interface BrokenLink {
  sourcePath: string;
  targetPath: string;
  linkText: string;
  statusCode: number;
  role: string;
}

/** An extracted internal link from an HTML page */
export interface ExtractedLink {
  sourcePath: string;
  targetPath: string;
  linkText: string;
}

/** A route that was not tested */
export interface SkippedRoute {
  path: string;
  reason: string;
}

/** Summary counts for the diagnostic report */
export interface ReportSummary {
  byCategory: Record<ContentCategory, number>;
  byRole: Record<string, Record<ContentCategory, number>>;
  totalRoutes: number;
  totalBrokenLinks: number;
  totalSkipped: number;
}

/** The complete diagnostic report */
export interface DiagnosticReport {
  timestamp: Date;
  environment: string;
  roles: string[];
  results: CrawlResult[];
  brokenLinks: BrokenLink[];
  skippedRoutes: SkippedRoute[];
  summary: ReportSummary;
}

/** Auth session for a role */
export interface AuthSession {
  role: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  cookieHeader: string;
}

/** Entity type to SeedIds field mapping */
export const ENTITY_TO_SEED_FIELD: Record<EntityType, keyof SeedIds> = {
  lead: 'leadId',
  flow: 'flowId',
  conversation: 'conversationId',
  consultant: 'consultantId',
  file: 'fileId',
  crm_integration: 'crmIntegrationId',
  follow_up: 'followUpId',
  template: 'templateId',
};
