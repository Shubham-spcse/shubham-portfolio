/**
 * ================================================================
 *  Service Worker — Shubham Prajapati Portfolio
 *  Strategy: Cache-first for static assets, Network-first for HTML
 * ================================================================
 */

'use strict';

const CACHE_NAME    = 'sp-portfolio-v1';
const OFFLINE_PAGE  = '/offline.html';

/** Assets to pre-cache on install (app shell). */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/js/script.js',
  '/manifest.json',
  '/assets/profile.png',
  '/assets/favicon.ico',
];

/* ── Install ──────────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

/* ── Activate ─────────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)   // delete old caches
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())          // take control of all tabs
  );
});

/* ── Fetch ────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // HTML pages → Network first, fall back to cache, then offline page
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstHTML(request));
    return;
  }

  // Static assets (CSS, JS, fonts, images) → Cache first, fall back to network
  event.respondWith(cacheFirstAsset(request));
});

/* ── Strategies ───────────────────────────────────────────────── */

/**
 * Network-first for HTML:
 * Try network → update cache → return response.
 * On network failure → return cached version → or offline page.
 */
async function networkFirstHTML(request) {
  try {
    const networkRes = await fetch(request);
    const cache      = await caches.open(CACHE_NAME);
    cache.put(request, networkRes.clone());  // update cache in background
    return networkRes;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_PAGE);
  }
}

/**
 * Cache-first for static assets:
 * Return from cache if available; otherwise fetch, cache, and return.
 */
async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkRes = await fetch(request);
    // Only cache successful responses
    if (networkRes.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    // For images, return a transparent 1×1 PNG rather than an error
    if (request.destination === 'image') {
      return new Response(
        atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
        { headers: { 'Content-Type': 'image/png' } }
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/* ── Background Sync (form submissions while offline) ─────────── */
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(replayPendingForms());
  }
});

async function replayPendingForms() {
  // This is a placeholder — wire up with IndexedDB if you want
  // full offline form submission support in the future.
  console.log('[SW] Background sync: contact-form-sync');
}
