// sw.js - Service Worker for offline functionality

const CACHE_NAME = 'mi-tienda-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/auth.js',
    '/js/catalogo.js',
    '/js/admin.js',
    '/js/sw-register.js'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('📦 Cacheando recursos...');
            return cache.addAll(urlsToCache).catch(err => {
                console.log('⚠️ Algunos recursos no pudieron ser cacheados:', err);
            });
        })
    );
    self.skipWaiting();
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ===== FETCH (ESTRATEGIA: CACHE FIRST, NETWORK FALLBACK) =====
self.addEventListener('fetch', event => {
    const { request } = event;

    // Si es una solicitud POST, usamos network first
    if (request.method === 'POST') {
        event.respondWith(
            fetch(request).catch(() => new Response('Offline - Request failed', { status: 503 }))
        );
        return;
    }

    // Para GET, usamos cache first
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }

            return fetch(request).then(response => {
                // No cacheamos respuestas que no sean exitosas
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clonar la respuesta
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Si no hay conexión, retornar offline page
                return new Response('Offline - Unable to fetch resource', { status: 503 });
            });
        })
    );
});

// ===== MENSAJES DESDE EL CLIENTE =====
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
