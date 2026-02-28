// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentMeta } from './useDocumentMeta.ts';

function ensureMeta(selector: string, attr: string, initial: string) {
  let el = document.querySelector(selector);
  if (!el) {
    if (selector.startsWith('link')) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
    } else {
      el = document.createElement('meta');
      // Parse selector to set attributes
      const nameMatch = selector.match(/name="([^"]+)"/);
      const propMatch = selector.match(/property="([^"]+)"/);
      if (nameMatch) el.setAttribute('name', nameMatch[1]);
      if (propMatch) el.setAttribute('property', propMatch[1]);
    }
    el.setAttribute(attr, initial);
    document.head.appendChild(el);
  }
  return el;
}

describe('useDocumentMeta', () => {
  beforeEach(() => {
    document.title = 'Chess Graph — Visualize Your Opening Repertoire';
    ensureMeta('meta[name="description"]', 'content', 'default desc');
    ensureMeta('link[rel="canonical"]', 'href', 'https://chessgraph.net/');
    ensureMeta('meta[property="og:title"]', 'content', 'default');
    ensureMeta('meta[property="og:description"]', 'content', 'default');
    ensureMeta('meta[property="og:url"]', 'content', 'https://chessgraph.net/');
    ensureMeta('meta[name="twitter:title"]', 'content', 'default');
    ensureMeta('meta[name="twitter:description"]', 'content', 'default');
    ensureMeta('meta[property="og:image"]', 'content', 'https://chessgraph.net/screenshots/chess-graph-after-e4.png');
    ensureMeta('meta[name="twitter:image"]', 'content', 'https://chessgraph.net/screenshots/chess-graph-after-e4.png');
  });

  afterEach(() => {
    // Clean up meta tags added during tests
    document.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());
  });

  it('sets document.title', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Test Title', description: 'Test desc' }),
    );
    expect(document.title).toBe('Test Title');
  });

  it('updates meta description', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'T', description: 'My custom description' }),
    );
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('My custom description');
  });

  it('sets canonical href', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'T',
        description: 'D',
        canonical: 'https://chessgraph.net/repertoires',
      }),
    );
    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://chessgraph.net/repertoires');
  });

  it('sets OG and Twitter tags', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Page Title',
        description: 'Page desc',
        ogTitle: 'OG Title',
        ogDescription: 'OG desc',
      }),
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('OG Title');
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('OG desc');
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('OG Title');
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('OG desc');
  });

  it('defaults OG tags to title and description', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Fallback', description: 'Fallback desc' }),
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Fallback');
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('Fallback desc');
  });

  it('sets og:image and twitter:image when ogImage is provided', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'T',
        description: 'D',
        ogImage: 'https://chessgraph.net/screenshots/features/game-tree.png',
      }),
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://chessgraph.net/screenshots/features/game-tree.png',
    );
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      'https://chessgraph.net/screenshots/features/game-tree.png',
    );
  });

  it('defaults og:image to landing screenshot', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'T', description: 'D' }),
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://chessgraph.net/screenshots/chess-graph-after-e4.png',
    );
  });

  it('restores defaults on unmount', () => {
    const { unmount } = renderHook(() =>
      useDocumentMeta({ title: 'Temp', description: 'Temp desc' }),
    );
    unmount();
    expect(document.title).toBe('Chess Graph — Visualize Your Opening Repertoire');
  });
});
