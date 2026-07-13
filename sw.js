// ============================================
// Service Worker - Auto Update Cache
// ============================================

const CACHE_NAME = 'hariku-v3-' + Date.now(); // ⬅️ Cache selalu baru
const BASE_PATH = '/my-daily-planner';

// File yang di-cache
const ASSETS_TO_CACHE = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/css/style.css',
    BASE_PATH + '/js/app.js',
    BASE_PATH + '/js/storage.js',
    BASE_PATH + '/js/dashboard.js',
    BASE_PATH + '/js/tasks.js',
    BASE_PATH + '/js/finance.js',
    BASE_PATH + '/js/charts.js',
    BASE_PATH + '/js/profile.js',
    BASE_PATH + '/manifest.json'
];

// Install - Cache semua file
self.addEventListener('install', (event) => {
    console.log('🔧 SW: Installing v3...');
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                console.log('SW: Cache failed (some files missing):', err);
            });
        })
    );
});

// Activate - Hapus cache lama
self.addEventListener('activate', (event) => {
    console.log('🚀 SW: Activating...');
    
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('🗑️ SW: Deleting old cache:', key);
                    return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Message handler - Clear cache manual
self.addEventListener('message', (event) => {
    if (event.data === 'clearCache') {
        caches.keys().then(keys => {
            keys.forEach(key => caches.delete(key));
        }).then(() => {
            console.log('🗑️ SW: All cache cleared!');
        });
    }
});
