/**
 * Route Registry - All known routes in Consultor.AI
 *
 * Static list of all page routes (26) and API routes (38).
 * Each route includes metadata for access control expectations.
 */

import type { RouteDefinition, SkippedRoute } from './types';

/** All page routes (26) */
const PAGE_ROUTES: RouteDefinition[] = [
  // Public pages
  {
    path: '/',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Landing page',
  },
  {
    path: '/login',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Login redirect page',
  },
  {
    path: '/auth/login',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Auth login page',
  },
  {
    path: '/auth/register',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Auth registration page',
  },
  {
    path: '/auth/forgot-password',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Forgot password page',
  },
  {
    path: '/auth/reset-password',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Reset password page',
  },
  {
    path: '/cadastro',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Signup/onboarding page',
  },
  {
    path: '/checkout',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Checkout page',
  },
  {
    path: '/pricing',
    type: 'page',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Pricing page',
  },

  // Dashboard pages (require auth)
  {
    path: '/dashboard',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Main dashboard',
  },
  {
    path: '/dashboard/leads',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Leads list',
  },
  {
    path: '/dashboard/leads/[id]',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'lead' },
    description: 'Lead detail',
  },
  {
    path: '/dashboard/flows',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Flows list',
  },
  {
    path: '/dashboard/flows/new',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Create new flow',
  },
  {
    path: '/dashboard/flows/[id]',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'flow' },
    description: 'Flow detail/editor',
  },
  {
    path: '/dashboard/fluxos',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Flows page (Portuguese URL)',
  },
  {
    path: '/dashboard/analytics',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Analytics dashboard',
  },
  {
    path: '/dashboard/arquivos',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Files management',
  },
  {
    path: '/dashboard/conversas',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Conversations list',
  },
  {
    path: '/dashboard/integracoes',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Integrations page',
  },
  {
    path: '/dashboard/templates',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Message templates',
  },
  {
    path: '/dashboard/perfil',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Profile page',
  },
  {
    path: '/dashboard/perfil/whatsapp',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'WhatsApp profile settings',
  },
  {
    path: '/dashboard/test/whatsapp-simulator',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'WhatsApp simulator (test)',
  },

  // Admin pages
  {
    path: '/admin',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: true,
    description: 'Admin dashboard',
  },
  {
    path: '/admin/users',
    type: 'page',
    method: 'GET',
    requiresAuth: true,
    adminOnly: true,
    description: 'Admin user management',
  },
];

/** All API GET routes (testable with GET) */
const API_GET_ROUTES: RouteDefinition[] = [
  // Admin
  {
    path: '/api/admin/stats',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: true,
    description: 'Admin stats',
  },
  {
    path: '/api/admin/users',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: true,
    description: 'Admin user list',
  },

  // Analytics
  {
    path: '/api/analytics/overview',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Analytics overview',
  },
  {
    path: '/api/analytics/charts',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Analytics charts data',
  },
  {
    path: '/api/analytics/activity',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Analytics activity feed',
  },

  // Billing
  {
    path: '/api/billing/credits',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Billing credits info',
  },

  // Files
  {
    path: '/api/files',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'List files',
  },
  {
    path: '/api/files/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'file' },
    description: 'Get file by ID',
  },

  // Flows
  {
    path: '/api/flows',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'List flows',
  },
  {
    path: '/api/flows/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'flow' },
    description: 'Get flow by ID',
  },

  // Follow-ups
  {
    path: '/api/follow-ups/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'follow_up' },
    description: 'Get follow-up by ID',
  },

  // Health
  {
    path: '/api/health',
    type: 'api',
    method: 'GET',
    requiresAuth: false,
    adminOnly: false,
    description: 'Health check',
  },

  // Integrations (CRM)
  {
    path: '/api/integrations/crm',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'List CRM integrations',
  },
  {
    path: '/api/integrations/crm/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'crm_integration' },
    description: 'Get CRM integration by ID',
  },
  {
    path: '/api/integrations/crm/logs',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'CRM sync logs',
  },

  // Leads
  {
    path: '/api/leads',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'List leads',
  },
  {
    path: '/api/leads/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'lead' },
    description: 'Get lead by ID',
  },
  {
    path: '/api/leads/stats',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Lead statistics',
  },
  {
    path: '/api/leads/export',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'Export leads CSV',
  },
  {
    path: '/api/leads/[id]/conversations',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'lead' },
    description: 'Lead conversations',
  },
  {
    path: '/api/leads/[id]/follow-ups',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'lead' },
    description: 'Lead follow-ups',
  },

  // Templates
  {
    path: '/api/templates',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    description: 'List message templates',
  },
  {
    path: '/api/templates/[id]',
    type: 'api',
    method: 'GET',
    requiresAuth: true,
    adminOnly: false,
    dynamicParams: { id: 'template' },
    description: 'Get template by ID',
  },
];

/** Routes that are POST/PUT/DELETE only (skipped for safety) */
export const SKIPPED_ROUTES: SkippedRoute[] = [
  { path: '/api/billing/checkout', reason: 'POST-only (creates Stripe checkout session)' },
  { path: '/api/billing/portal', reason: 'POST-only (creates Stripe portal session)' },
  { path: '/api/billing/webhook', reason: 'POST-only (Stripe webhook handler)' },
  { path: '/api/consultants/meta-signup', reason: 'POST-only (Meta signup flow)' },
  { path: '/api/consultants/meta-callback', reason: 'GET but requires Meta OAuth state' },
  { path: '/api/consultants/[id]/integrations/meta', reason: 'PUT-only (Meta integration config)' },
  { path: '/api/conversations/start', reason: 'POST-only (starts conversation)' },
  { path: '/api/conversations/[id]/message', reason: 'POST-only (sends message)' },
  { path: '/api/contact', reason: 'POST-only (contact form submission)' },
  { path: '/api/integrations/crm/[id]/test', reason: 'POST-only (test CRM connection)' },
  { path: '/api/integrations/crm/[id]/sync', reason: 'POST-only (trigger CRM sync)' },
  {
    path: '/api/webhook/meta/[consultantId]',
    reason: 'POST/GET but requires Meta verification token',
  },
  { path: '/api/webhook/mock', reason: 'POST-only (mock webhook for testing)' },
];

/** Get all testable routes (pages + API GET routes) */
export function getAllRoutes(): RouteDefinition[] {
  return [...PAGE_ROUTES, ...API_GET_ROUTES];
}

/** Get page routes only */
export function getPageRoutes(): RouteDefinition[] {
  return PAGE_ROUTES;
}

/** Get API routes only */
export function getApiRoutes(): RouteDefinition[] {
  return API_GET_ROUTES;
}

/** Get skipped routes */
export function getSkippedRoutes(): SkippedRoute[] {
  return SKIPPED_ROUTES;
}

/** Count totals */
export function getRouteCounts(): { pages: number; apiRoutes: number; skipped: number } {
  return {
    pages: PAGE_ROUTES.length,
    apiRoutes: API_GET_ROUTES.length,
    skipped: SKIPPED_ROUTES.length,
  };
}
