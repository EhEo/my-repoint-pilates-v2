/**
 * RePoint Pilates - Service Worker
 * Provides offline functionality and caching for PWA
 */

const CACHE_NAME = 'repoint-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/main.css',
    '/src/js/main.js',
    '/public/icons/favicon.svg',
    '/public/icons/icon-192x192.png',
    '/public/icons/icon-512x512.png',
];

// Google Fonts to cache
const FONT_URLS = [
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap',
];

// ============================================
// Install Event
// ============================================
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Cache static assets
            console.log('[Service Worker] Caching static assets');
            await cache.addAll(STATIC_ASSETS);

            // Cache fonts
            for (const fontUrl of FONT_URLS) {
                try {
                    await cache.add(fontUrl);
                } catch (error) {
                    console.log('[Service Worker] Failed to cache font:', fontUrl);
                }
            }

            // Force the waiting service worker to become the active service worker
            self.skipWaiting();
        })()
    );
});

// ============================================
// Activate Event
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        (async () => {
            // Clean up old caches
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[Service Worker] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );

            // Take control of all pages immediately
            self.clients.claim();
        })()
    );
});

// ============================================
// Fetch Event
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(url)) {
        // Cache-first for static assets
        event.respondWith(cacheFirst(request));
    } else if (isFontRequest(url)) {
        // Cache-first for fonts
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url)) {
        // Network-first for API requests
        event.respondWith(networkFirst(request));
    } else {
        // Stale-while-revalidate for other requests
        event.respondWith(staleWhileRevalidate(request));
    }
});

// ============================================
// Caching Strategies
// ============================================

/**
 * Cache First Strategy
 * Best for: Static assets that don't change often
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Cache first failed:', request.url);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First Strategy
 * Best for: API requests and dynamic content
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stale While Revalidate Strategy
 * Best for: Frequently updated content
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            console.log('[Service Worker] Network request failed:', request.url);
        });

    return cachedResponse || fetchPromise;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if request is for a static asset
 */
function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Check if request is for a font
 */
function isFontRequest(url) {
    return url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'fonts.gstatic.com';
}

/**
 * Check if request is an API call
 */
function isAPIRequest(url) {
    return url.pathname.startsWith('/api/');
}

// ============================================
// Push Notifications
// ============================================
self.addEventListener('push', (event) => {
    const options = {
        icon: '/public/icons/icon-192x192.png',
        badge: '/public/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'explore', title: '확인하기' },
            { action: 'close', title: '닫기' }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || '새로운 알림이 있습니다.';
        options.tag = data.tag || 'default';

        event.waitUntil(
            self.registration.showNotification(data.title || 'RePoint', options)
        );
    }
});

// ============================================
// Notification Click
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ============================================
// Background Sync
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reservations') {
        event.waitUntil(syncReservations());
    }
});

async function syncReservations() {
    // This would sync any offline reservation changes
    console.log('[Service Worker] Syncing reservations...');
}

// ============================================
// Message Handler
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.payload;
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(urlsToCache);
            })
        );
    }
});

console.log('[Service Worker] Loaded');
