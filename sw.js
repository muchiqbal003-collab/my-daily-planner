// ============================================
// Service Worker - Hariku V5
// ============================================

const CACHE_NAME = 'hariku-v5';
const BASE_PATH = '/my-daily-planner';

const ASSETS_TO_CACHE = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/storage.js',
    BASE_PATH + '/js/app.js',
    BASE_PATH + '/js/dashboard.js',
    BASE_PATH + '/js/tasks.js',
    BASE_PATH + '/js/habits.js',
    BASE_PATH + '/js/finance.js',
    BASE_PATH + '/js/invest.js',
    BASE_PATH + '/js/goals.js',
    BASE_PATH + '/js/schedule.js',
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

// Install
self.addEventListener('install', (event) => {
    console.log('🔧 SW V5: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching ' + ASSETS_TO_CACHE.length + ' files...');
                return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                    console.warn('⚠️ Some files failed to cache:', err);
                });
            })
            .then(() => {
                console.log('✅ SW V5: Install complete');
                return self.skipWaiting();
            })
    );
});

// Activate — HAPUS SEMUA CACHE LAMA
self.addEventListener('activate', (event) => {
    console.log('🚀 SW V5: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => {
            console.log('✅ SW V5: Activated');
            return self.clients.claim();
        })
    );
});

// Fetch — Network first, cache fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    
    event.respondWith(
        caches.match(event.request).then((cached) => {
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
                .catch(() => cached);
            
            return cached || fetchPromise;
        })
    );
});

// Message handler
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
