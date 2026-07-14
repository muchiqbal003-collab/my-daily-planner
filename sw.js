// ============================================
// Service Worker - Hariku V3.0
// Auto-update cache, offline support
// ============================================

const CACHE_NAME = 'hariku-v3-' + Date.now();
const BASE_PATH = '/my-daily-planner';

// Semua file yang di-cache
const ASSETS_TO_CACHE = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/storage.js',
    BASE_PATH + '/js/app.js',
    BASE_PATH + '/js/dashboard.js',
    BASE_PATH + '/js/tasks.js',
    BASE_PATH + '/js/finance.js',
    BASE_PATH + '/js/habits.js',
    BASE_PATH + '/js/goals.js',
    BASE_PATH + '/js/schedule.js',
    BASE_PATH + '/js/focus.js',
    BASE_PATH + '/js/journal.js',
    BASE_PATH + '/js/ideas.js',
    BASE_PATH + '/js/books.js',
    BASE_PATH + '/js/learn.js',
    BASE_PATH + '/js/mood.js',
    BASE_PATH + '/js/achievements.js',
    BASE_PATH + '/js/reminders.js',
    BASE_PATH + '/js/stats.js',
    BASE_PATH + '/js/charts.js',
    BASE_PATH + '/js/profile.js',
    BASE_PATH + '/manifest.json',
    BASE_PATH + '/icons/icon-192.png',
    BASE_PATH + '/icons/icon-512.png'
];

// ========== INSTALL ==========
self.addEventListener('install', (event) => {
    console.log('🔧 SW V3.0: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching ' + ASSETS_TO_CACHE.length + ' files...');
                return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                    console.warn('⚠️ Some files failed to cache:', err);
                });
            })
            .then(() => {
                console.log('✅ SW V3.0: Install complete');
                return self.skipWaiting();
            })
    );
});

// ========== ACTIVATE ==========
self.addEventListener('activate', (event) => {
    console.log('🚀 SW V3.0: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('🗑️ Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('✅ SW V3.0: Activated');
            return self.clients.claim();
        })
    );
});

// ========== FETCH ==========
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external requests (CDN, Google Fonts, etc)
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    
    event.respondWith(
        caches.match(event.request).then((cached) => {
            // Return cached immediately, fetch update in background
            const fetchPromise = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                })
                .catch((err) => {
                    console.log('🌐 Offline, using cache:', event.request.url);
                    return cached;
                });
            
            return cached || fetchPromise;
        })
    );
});

// ========== MESSAGE HANDLER ==========
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'clearAllCache') {
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => caches.delete(key)));
        }).then(() => {
            console.log('🗑️ All cache cleared!');
        });
    }
});
