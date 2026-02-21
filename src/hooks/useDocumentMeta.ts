import { useEffect } from 'react';

const DEFAULT_TITLE = 'Chess Graph — Visualize Your Opening Repertoire';
const DEFAULT_DESCRIPTION =
  'Explore chess openings as interactive node-based graphs. Branch, annotate, and master your repertoire — all in your browser.';
const DEFAULT_CANONICAL = 'https://chessgraph.net/';

interface DocumentMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

function setMetaTag(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attr, value);
  }
}

export function useDocumentMeta(meta: DocumentMeta) {
  useEffect(() => {
    const title = meta.title;
    const description = meta.description;
    const canonical = meta.canonical ?? DEFAULT_CANONICAL;
    const ogTitle = meta.ogTitle ?? title;
    const ogDescription = meta.ogDescription ?? description;

    document.title = title;
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('link[rel="canonical"]', 'href', canonical);
    setMetaTag('meta[property="og:title"]', 'content', ogTitle);
    setMetaTag('meta[property="og:description"]', 'content', ogDescription);
    setMetaTag('meta[property="og:url"]', 'content', canonical);
    setMetaTag('meta[name="twitter:title"]', 'content', ogTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', ogDescription);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('meta[name="description"]', 'content', DEFAULT_DESCRIPTION);
      setMetaTag('link[rel="canonical"]', 'href', DEFAULT_CANONICAL);
      setMetaTag('meta[property="og:title"]', 'content', DEFAULT_TITLE);
      setMetaTag('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION);
      setMetaTag('meta[property="og:url"]', 'content', DEFAULT_CANONICAL);
      setMetaTag('meta[name="twitter:title"]', 'content', DEFAULT_TITLE);
      setMetaTag('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION);
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription]);
}
