import { describe, it, expect } from 'vitest';
import {
  classifyContent,
  classifyHtmlContent,
  classifyJsonContent,
} from '../../diagnostics/lib/content-classifier';

describe('Content Classifier', () => {
  describe('classifyHtmlContent', () => {
    it('should detect TODO markers in HTML', () => {
      const html = '<html><body><main><p>This page has a TODO item to fix</p></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('TODO');
    });

    it('should detect FIXME markers in HTML', () => {
      const html =
        '<html><body><main><p>FIXME: This needs to be completed with real data here and more text</p></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('FIXME');
    });

    it('should detect Lorem ipsum text', () => {
      const html =
        '<html><body><main><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.</p></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('lorem-ipsum');
    });

    it('should detect Coming soon text', () => {
      const html =
        '<html><body><main><p>This feature is coming soon! Stay tuned for updates.</p></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('coming-soon');
    });

    it('should detect empty main content', () => {
      const html = '<html><body><main><div></div></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('empty-content');
    });

    it('should classify real content as funcionando', () => {
      const html =
        '<html><body><main><h1>Dashboard</h1><p>Welcome to your dashboard. Here you can manage your leads, view analytics, and configure your WhatsApp integration settings.</p></main></body></html>';
      const result = classifyHtmlContent(html);
      expect(result.category).toBe('funcionando');
    });

    it('should handle invalid HTML gracefully', () => {
      // Non-HTML text with minimal content is classified as placeholder (minimal text)
      const result = classifyHtmlContent('not html at all <<<>>>');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('minimal-text');
    });

    it('should ignore script and style tag content', () => {
      const html =
        '<html><body><script>var TODO = "fix this";</script><main><p>This is a real page with enough content to pass the minimum threshold check.</p></main></body></html>';
      const result = classifyHtmlContent(html);
      // TODO inside script should not trigger placeholder detection
      expect(result.contentFlags).not.toContain('TODO');
    });
  });

  describe('classifyJsonContent', () => {
    it('should detect empty array', () => {
      const result = classifyJsonContent('[]');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('empty-array');
    });

    it('should detect null response', () => {
      const result = classifyJsonContent('null');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('null-data');
    });

    it('should detect empty object', () => {
      const result = classifyJsonContent('{}');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('empty-object');
    });

    it('should detect error responses', () => {
      const result = classifyJsonContent('{"error": "Not found"}');
      expect(result.category).toBe('quebrado');
      expect(result.contentFlags).toContain('stub-response');
    });

    it('should classify valid JSON with data as funcionando', () => {
      const result = classifyJsonContent('{"data": [{"id": "123", "name": "Test Lead"}]}');
      expect(result.category).toBe('funcionando');
      expect(result.contentFlags).toHaveLength(0);
    });

    it('should detect null data field', () => {
      const result = classifyJsonContent('{"data": null}');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('null-data');
    });

    it('should handle invalid JSON', () => {
      const result = classifyJsonContent('not json {{{');
      expect(result.category).toBe('quebrado');
    });
  });

  describe('classifyContent', () => {
    it('should route HTML content to HTML classifier', () => {
      const result = classifyContent(
        '<html><body><main><p>Real content here with enough text to pass validation.</p></main></body></html>',
        'text/html',
        'page'
      );
      expect(result.category).toBe('funcionando');
    });

    it('should route JSON content to JSON classifier', () => {
      const result = classifyContent('[]', 'application/json', 'api');
      expect(result.category).toBe('placeholder');
    });

    it('should handle empty body', () => {
      const result = classifyContent('', 'text/html', 'page');
      expect(result.category).toBe('placeholder');
      expect(result.contentFlags).toContain('empty-content');
    });
  });
});
