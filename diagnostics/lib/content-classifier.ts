/**
 * Content Classifier
 *
 * Analyzes response bodies to detect placeholder content,
 * TODO markers, empty pages, and empty API responses.
 */

import { parse as parseHTML } from 'node-html-parser';
import type { ContentCategory, ContentFlag } from './types';

export interface ClassificationResult {
  category: ContentCategory;
  contentFlags: ContentFlag[];
  notes: string;
}

/** Patterns that indicate placeholder/incomplete content */
const PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp; flag: ContentFlag; label: string }> = [
  { pattern: /\bTODO\b/i, flag: 'TODO', label: 'TODO marker found' },
  { pattern: /\bFIXME\b/i, flag: 'FIXME', label: 'FIXME marker found' },
  { pattern: /\bHACK\b/i, flag: 'HACK', label: 'HACK marker found' },
  { pattern: /\bXXX\b/i, flag: 'XXX', label: 'XXX marker found' },
  { pattern: /lorem\s+ipsum/i, flag: 'lorem-ipsum', label: 'Lorem ipsum text' },
  { pattern: /coming\s+soon/i, flag: 'coming-soon', label: 'Coming soon text' },
  { pattern: /\bplaceholder\b/i, flag: 'placeholder-text', label: 'Placeholder text' },
];

/** Minimum meaningful text length (characters) */
const MIN_MEANINGFUL_TEXT = 50;

/**
 * Classify response content (HTML or JSON)
 */
export function classifyContent(
  body: string,
  contentType: string,
  routeType: 'page' | 'api'
): ClassificationResult {
  if (!body || body.trim().length === 0) {
    return {
      category: 'placeholder',
      contentFlags: ['empty-content'],
      notes: 'Empty response body',
    };
  }

  if (contentType.includes('application/json') || routeType === 'api') {
    return classifyJsonContent(body);
  }

  if (contentType.includes('text/html') || routeType === 'page') {
    return classifyHtmlContent(body);
  }

  // For other content types, assume functioning
  return {
    category: 'funcionando',
    contentFlags: [],
    notes: `Content type: ${contentType}`,
  };
}

/**
 * Classify HTML content
 */
export function classifyHtmlContent(html: string): ClassificationResult {
  const contentFlags: ContentFlag[] = [];
  const notes: string[] = [];

  let root;
  try {
    root = parseHTML(html);
  } catch {
    return {
      category: 'funcionando',
      contentFlags: [],
      notes: 'Could not parse HTML',
    };
  }

  // Extract visible text (skip script/style tags)
  const scripts = root.querySelectorAll('script, style, noscript');
  for (const s of scripts) {
    s.remove();
  }
  const visibleText = root.text.replace(/\s+/g, ' ').trim();

  // Check for placeholder patterns in visible text
  for (const { pattern, flag, label } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(visibleText)) {
      contentFlags.push(flag);
      notes.push(label);
    }
  }

  // Check for empty main content
  const main = root.querySelector('main');
  if (main) {
    const mainText = main.text.replace(/\s+/g, ' ').trim();
    if (mainText.length < MIN_MEANINGFUL_TEXT) {
      contentFlags.push('empty-content');
      notes.push(`Main content too short (${mainText.length} chars)`);
    }
  } else {
    // No <main> tag - check body text
    const bodyText = visibleText;
    if (bodyText.length < MIN_MEANINGFUL_TEXT) {
      contentFlags.push('minimal-text');
      notes.push(`Very little visible text (${bodyText.length} chars)`);
    }
  }

  // Determine category
  if (contentFlags.length > 0) {
    const hasPlaceholderFlag = contentFlags.some(
      f =>
        f === 'TODO' ||
        f === 'FIXME' ||
        f === 'lorem-ipsum' ||
        f === 'coming-soon' ||
        f === 'placeholder-text' ||
        f === 'empty-content' ||
        f === 'minimal-text'
    );

    if (hasPlaceholderFlag) {
      return {
        category: 'placeholder',
        contentFlags,
        notes: notes.join('; '),
      };
    }
  }

  return {
    category: 'funcionando',
    contentFlags,
    notes: notes.length > 0 ? notes.join('; ') : 'Real content',
  };
}

/**
 * Classify JSON response content
 */
export function classifyJsonContent(body: string): ClassificationResult {
  const contentFlags: ContentFlag[] = [];
  const notes: string[] = [];

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    // Not valid JSON - might be an error page rendered as HTML
    return {
      category: 'quebrado',
      contentFlags: [],
      notes: 'Response is not valid JSON',
    };
  }

  // Check for empty array
  if (Array.isArray(data) && data.length === 0) {
    contentFlags.push('empty-array');
    notes.push('Empty array response');
  }

  // Check for null data
  if (data === null) {
    contentFlags.push('null-data');
    notes.push('Null response');
  }

  // Check for empty object
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      contentFlags.push('empty-object');
      notes.push('Empty object response');
    }

    // Check for error response with no useful data
    if (obj.error && !obj.data) {
      contentFlags.push('stub-response');
      notes.push(`Error response: ${String(obj.error)}`);
    }

    // Check for data field that is null/empty
    if (
      'data' in obj &&
      (obj.data === null || (Array.isArray(obj.data) && obj.data.length === 0))
    ) {
      contentFlags.push('null-data');
      notes.push('Data field is null/empty');
    }
  }

  // Determine category based on flags
  if (contentFlags.includes('stub-response')) {
    return { category: 'quebrado', contentFlags, notes: notes.join('; ') };
  }

  if (contentFlags.length > 0) {
    // Empty arrays could be valid (no data yet) - classify as placeholder
    return { category: 'placeholder', contentFlags, notes: notes.join('; ') };
  }

  return { category: 'funcionando', contentFlags: [], notes: 'Valid JSON with data' };
}
