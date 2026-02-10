/**
 * Cookie Consent Banner Tests
 *
 * Tests banner visibility, accept/reject persistence, and localStorage behavior.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { render, screen, fireEvent } from '@testing-library/react';
import { CookieConsentBanner } from '@/components/cookie-consent/banner';

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render on first visit when no consent stored', () => {
    render(<CookieConsentBanner />);
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByText('Aceitar')).toBeInTheDocument();
    expect(screen.getByText('Recusar')).toBeInTheDocument();
  });

  it('should hide after clicking accept', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByText('Aceitar'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'accepted');
    expect(screen.queryByText('Aceitar')).not.toBeInTheDocument();
  });

  it('should hide after clicking reject', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByText('Recusar'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'rejected');
    expect(screen.queryByText('Recusar')).not.toBeInTheDocument();
  });

  it('should not render when consent already accepted', () => {
    localStorageMock.getItem.mockReturnValue('accepted');
    render(<CookieConsentBanner />);

    expect(screen.queryByText('Aceitar')).not.toBeInTheDocument();
  });

  it('should not render when consent already rejected', () => {
    localStorageMock.getItem.mockReturnValue('rejected');
    render(<CookieConsentBanner />);

    expect(screen.queryByText('Recusar')).not.toBeInTheDocument();
  });
});
