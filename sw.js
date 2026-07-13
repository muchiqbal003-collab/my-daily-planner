// ============================================
// Service Worker - Hariku (my-daily-planner)
// ============================================

const CACHE_NAME = 'hariku-v2';
const REPO_PATH = '/my-daily-planner'; // ⬅️ Sesuaikan: kosongkan "" untuk Netlify

// File yang akan di-cache
const ASSETS_TO_CACHE = [
    `${REPO_PATH}/`,
    `${REPO_PATH}/index.html`,
    `${REPO_PATH}/css/style.css`,
    `${REPO_PATH}/js/app.js`,
    `${REPO_PATH}/js/storage.js`,
    `${REPO_PATH}/js/dashboard.js`,
    `${REPO_PATH}/js/tasks.js`,
    `${REPO_PATH}/js/finance.js`,
    `${REPO_PATH}/js/charts.js`,
    `${REPO_PATH}/js/profile.js`,
    `${REPO_PATH}/manifest.json`,
    `${REPO_PATH}/icon-192.png`,
    `${REPO_PATH}/icon-512.png`
];

// ========== INSTALL ==========
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                    console.warn('⚠️ Some assets failed to cache:', error);
                });
            })
            .then(() => {
                console.log('✅ Install complete, skip waiting...');
                return self.skipWaiting();
            })
    );
});

// ========== ACTIVATE ==========
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('✅ Activation complete, claiming clients...');
            return self.clients.claim();
        })
    );
});

// ========== FETCH ==========
// Strategy: Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                console.log('🌐 Offline - Serving from cache:', event.request.url);
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return a fallback for HTML requests
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match(`${REPO_PATH}/index.html`);
                    }
                    // Return offline indicator for other requests
                    return new Response('Offline - Data tidak tersedia', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// ========== MESSAGE HANDLER ==========
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'clearCache') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('🗑️ Cache cleared by user request');
        });
    }
});