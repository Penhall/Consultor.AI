import { describe, it, expect } from 'vitest';
import {
  getAllRoutes,
  getPageRoutes,
  getApiRoutes,
  getSkippedRoutes,
  getRouteCounts,
} from '../../diagnostics/lib/route-registry';

describe('Route Registry', () => {
  it('should have all page routes registered', () => {
    const pages = getPageRoutes();
    expect(pages.length).toBe(26);
  });

  it('should have API routes registered', () => {
    const apiRoutes = getApiRoutes();
    expect(apiRoutes.length).toBeGreaterThan(0);
  });

  it('should return correct counts', () => {
    const counts = getRouteCounts();
    expect(counts.pages).toBe(26);
    expect(counts.apiRoutes).toBeGreaterThan(15);
    expect(counts.skipped).toBeGreaterThan(5);
  });

  it('should have no duplicate paths in pages', () => {
    const pages = getPageRoutes();
    const paths = pages.map(r => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('should have no duplicate paths in API routes', () => {
    const apiRoutes = getApiRoutes();
    const paths = apiRoutes.map(r => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('should have dynamic params defined for routes with [id]', () => {
    const allRoutes = getAllRoutes();
    const dynamicRoutes = allRoutes.filter(r => r.path.includes('['));
    for (const route of dynamicRoutes) {
      expect(route.dynamicParams).toBeDefined();
      expect(Object.keys(route.dynamicParams!).length).toBeGreaterThan(0);
    }
  });

  it('should mark all page routes as type page', () => {
    const pages = getPageRoutes();
    for (const page of pages) {
      expect(page.type).toBe('page');
    }
  });

  it('should mark all API routes as type api', () => {
    const apiRoutes = getApiRoutes();
    for (const route of apiRoutes) {
      expect(route.type).toBe('api');
    }
  });

  it('should have admin-only routes for /admin paths', () => {
    const allRoutes = getAllRoutes();
    const adminPageRoutes = allRoutes.filter(r => r.path.startsWith('/admin') && r.type === 'page');
    for (const route of adminPageRoutes) {
      expect(route.adminOnly).toBe(true);
    }
  });

  it('should have skipped routes with reasons', () => {
    const skipped = getSkippedRoutes();
    for (const route of skipped) {
      expect(route.path).toBeTruthy();
      expect(route.reason).toBeTruthy();
    }
  });

  it('should have descriptions for all routes', () => {
    const allRoutes = getAllRoutes();
    for (const route of allRoutes) {
      expect(route.description).toBeTruthy();
    }
  });

  it('should have GET method for all testable API routes', () => {
    const apiRoutes = getApiRoutes();
    for (const route of apiRoutes) {
      expect(route.method).toBe('GET');
    }
  });
});
