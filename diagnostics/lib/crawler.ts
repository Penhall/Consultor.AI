/**
 * HTTP Crawler Module
 *
 * Performs HTTP requests with timeout, redirect handling,
 * and response metadata collection.
 */

import {
  ENTITY_TO_SEED_FIELD,
  type AuthSession,
  type CrawlResult,
  type ContentCategory,
  type ContentFlag,
  type RouteDefinition,
  type SeedIds,
  type EntityType,
} from './types';

const DEFAULT_TIMEOUT_MS = 10_000;
const APP_BASE_URL = 'http://127.0.0.1:3000';

/**
 * Crawl a single route and return the result
 */
export async function crawlRoute(
  route: RouteDefinition,
  session: AuthSession,
  seedIds: SeedIds
): Promise<CrawlResult> {
  const resolvedPath = resolveDynamicParams(route, seedIds);

  if (resolvedPath === null) {
    // Dynamic params could not be resolved
    return {
      url: `${APP_BASE_URL}${route.path}`,
      path: route.path,
      method: route.method,
      role: session.role,
      statusCode: 0,
      responseTimeMs: 0,
      contentType: '',
      category: 'quebrado',
      redirectTo: null,
      notes: 'Skipped: no seed data for dynamic params',
      contentFlags: [],
    };
  }

  const url = `${APP_BASE_URL}${resolvedPath}`;
  const headers: Record<string, string> = {};

  if (route.requiresAuth) {
    if (route.type === 'page') {
      // Pages use cookie-based auth (Next.js middleware)
      headers['Cookie'] = session.cookieHeader;
    } else {
      // API routes: try both cookie and bearer
      headers['Cookie'] = session.cookieHeader;
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const response = await fetch(url, {
      method: route.method,
      headers,
      redirect: 'manual', // Capture redirects
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    const statusCode = response.status;

    // Handle redirects
    let redirectTo: string | null = null;
    if (statusCode >= 300 && statusCode < 400) {
      redirectTo = response.headers.get('location') || null;
    }

    // Read response body for content analysis
    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch {
      // Some responses may not have a body
    }

    // Basic category assignment (will be refined by content-classifier)
    const { category, notes, contentFlags } = classifyBasic(
      route,
      session,
      statusCode,
      redirectTo,
      responseBody,
      contentType
    );

    return {
      url,
      path: resolvedPath,
      method: route.method,
      role: session.role,
      statusCode,
      responseTimeMs,
      contentType,
      category,
      redirectTo,
      notes,
      contentFlags,
      responseBody,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      url,
      path: resolvedPath,
      method: route.method,
      role: session.role,
      statusCode: 0,
      responseTimeMs,
      contentType: '',
      category: 'quebrado',
      redirectTo: null,
      notes: isTimeout ? `Timeout after ${DEFAULT_TIMEOUT_MS}ms` : `Error: ${errorMessage}`,
      contentFlags: isTimeout ? ['timeout'] : ['connection-error'],
    };
  }
}

/**
 * Resolve dynamic params in a route path using seed IDs
 */
function resolveDynamicParams(route: RouteDefinition, seedIds: SeedIds): string | null {
  if (!route.dynamicParams) {
    return route.path;
  }

  let resolvedPath = route.path;
  for (const [param, entityType] of Object.entries(route.dynamicParams)) {
    const seedField = ENTITY_TO_SEED_FIELD[entityType as EntityType];
    const id = seedIds[seedField];
    if (!id) {
      return null; // Cannot resolve this param
    }
    resolvedPath = resolvedPath.replace(`[${param}]`, id);
  }
  return resolvedPath;
}

/**
 * Basic HTTP-level classification before content analysis
 */
function classifyBasic(
  route: RouteDefinition,
  session: AuthSession,
  statusCode: number,
  redirectTo: string | null,
  _responseBody: string,
  _contentType: string
): { category: ContentCategory; notes: string; contentFlags: ContentFlag[] } {
  const contentFlags: ContentFlag[] = [];

  // Check for unexpected access denied
  if (statusCode === 401 || statusCode === 403) {
    if (route.adminOnly && session.role !== 'admin') {
      return {
        category: 'funcionando',
        notes: `Expected 401/403 for non-admin on admin-only route`,
        contentFlags,
      };
    }
    return {
      category: 'acesso_negado',
      notes: `Unexpected ${statusCode} - route should be accessible for ${session.role}`,
      contentFlags,
    };
  }

  // Check for redirect to login (unexpected for authenticated user)
  if (redirectTo && route.requiresAuth) {
    if (redirectTo.includes('/auth/login')) {
      contentFlags.push('redirect-to-login');
      return {
        category: 'acesso_negado',
        notes: `Redirected to login despite being authenticated as ${session.role}`,
        contentFlags,
      };
    }
  }

  // Auth routes redirect authenticated users to dashboard - that's expected
  if (redirectTo && !route.requiresAuth && route.path.startsWith('/auth/')) {
    return {
      category: 'funcionando',
      notes: `Expected redirect from auth page to ${redirectTo} for authenticated user`,
      contentFlags,
    };
  }

  // Server errors
  if (statusCode >= 500) {
    return {
      category: 'quebrado',
      notes: `Server error: ${statusCode}`,
      contentFlags,
    };
  }

  // Client errors (except 401/403 handled above)
  if (statusCode >= 400) {
    return {
      category: 'quebrado',
      notes: `Client error: ${statusCode}`,
      contentFlags,
    };
  }

  // Redirects (non-login)
  if (statusCode >= 300 && statusCode < 400) {
    return {
      category: 'funcionando',
      notes: `Redirect to ${redirectTo}`,
      contentFlags,
    };
  }

  // 200 OK - will be refined by content classifier
  if (statusCode === 200) {
    return {
      category: 'funcionando',
      notes: 'OK',
      contentFlags,
    };
  }

  return {
    category: 'funcionando',
    notes: `Status ${statusCode}`,
    contentFlags,
  };
}
