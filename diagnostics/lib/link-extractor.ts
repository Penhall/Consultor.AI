/**
 * Internal Link Extractor
 *
 * Parses HTML pages to find all internal <a href> links
 * for broken link validation.
 */

import { parse as parseHTML } from 'node-html-parser';
import type { ExtractedLink } from './types';

/**
 * Extract all internal links from an HTML page
 */
export function extractInternalLinks(html: string, sourcePath: string): ExtractedLink[] {
  let root;
  try {
    root = parseHTML(html);
  } catch {
    return [];
  }

  const links: ExtractedLink[] = [];
  const anchors = root.querySelectorAll('a[href]');

  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;

    // Filter to internal links only
    if (!isInternalLink(href)) continue;

    // Normalize the path
    const targetPath = normalizePath(href);
    if (!targetPath) continue;

    // Skip hash-only links and javascript: links
    if (targetPath === sourcePath) continue;

    const linkText = anchor.text.replace(/\s+/g, ' ').trim().slice(0, 100);

    links.push({
      sourcePath,
      targetPath,
      linkText: linkText || '(no text)',
    });
  }

  return links;
}

/**
 * Check if a URL is an internal link
 */
function isInternalLink(href: string): boolean {
  // Skip external links
  if (href.startsWith('http://') || href.startsWith('https://')) {
    // Only internal if it points to our host
    try {
      const url = new URL(href);
      return url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    } catch {
      return false;
    }
  }

  // Skip non-navigation links
  if (href.startsWith('mailto:')) return false;
  if (href.startsWith('tel:')) return false;
  if (href.startsWith('javascript:')) return false;
  if (href === '#') return false;
  if (href.startsWith('#')) return false;

  // Relative paths and absolute paths are internal
  return href.startsWith('/') || !href.includes('://');
}

/**
 * Normalize a link path
 */
function normalizePath(href: string): string | null {
  try {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const url = new URL(href);
      return url.pathname;
    }

    // Remove query string and hash
    const path = href.split('?')[0].split('#')[0];

    // Must start with /
    if (!path.startsWith('/')) return null;

    return path;
  } catch {
    return null;
  }
}
