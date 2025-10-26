// =============================================
// ODAM Producción Musical - Service Worker
// Cache Strategy & Performance Optimization
// Version: 2.0.0
// =============================================

const CACHE_NAME = 'odam-cache-v2.0.0';
const CDN_BASE = 'https://cdn.osklindealba.com';
const API_BASE = 'https://api.osklindealba.com';

// ===== ASSETS PARA CACHEAR =====
const STATIC_ASSETS = [
  // HTML Principal
  '/',
  '/index.html',
  
  // CSS
  '/styles.css',
  '/stats-styles.css',
  
  // JavaScript
  '/script.js',
  '/stats-system.js',
  
  // Imágenes Críticas
  '/logo.jpg',
  '/tu-foto.jpg',
  '/tu-fondo.jpg',
  '/logo-192x192.png',
  '/logo-512x512.png',
  
  // Archivos de Audio (MP3)
  '/tu-me-sostendras.mp3',
  '/renovados-en-tu-voluntad.mp3',
  '/en-ti-confio-senor.mp3',
  '/el-diezmo-es-del-senor-version-bachata.mp3',
  '/jonas-y-el-gran-pez.mp3',
  '/el-hijo-de-manoa.mp3',
  
  // Fuentes y Librerías Externas
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
  
  // Manifest PWA
  '/manifest.json'
];

const DYNAMIC_ASSETS = [
  // Rutas dinámicas que deben estar disponibles offline
  '/#servicios',
  '/#proyectos',
  '/#contacto',
  '/#interaccion'
];

// ===== ESTRATEGIAS DE CACHE =====
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  IMAGES: 'cache-first',
  AUDIO: 'cache-first',
  API: 'network-first'
};

// ===== INSTALACIÓN DEL SERVICE WORKER =====
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación', error);
      })
  );
});

// ===== ACTIVACIÓN DEL SERVICE WORKER =====
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// ===== INTERCEPTACIÓN DE PETICIONES =====
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar peticiones HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  event.respondWith(
    handleRequest(event)
      .catch((error) => {
        console.error('❌ Service Worker: Error en fetch', error);
        return handleOfflineFallback(request);
      })
  );
});

// ===== MANEJO DE PETICIONES =====
async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Estrategia para HTML - Network First
  if (request.headers.get('Accept')?.includes('text/html')) {
    return networkFirstStrategy(request);
  }
  
  // Estrategia para API - Network First
  if (url.pathname.startsWith('/api/') || url.pathname.includes('form-handler')) {
    return networkFirstStrategy(request);
  }
  
  // Estrategia para assets estáticos - Cache First
  if (isStaticAsset(request)) {
    return cacheFirstStrategy(request);
  }
  
  // Estrategia para imágenes - Cache First con actualización
  if (request.destination === 'image') {
    return staleWhileRevalidateStrategy(request);
  }
  
  // Estrategia para audio - Cache First
  if (request.destination === 'audio' || url.pathname.endsWith('.mp3')) {
    return cacheFirstStrategy(request);
  }
  
  // Estrategia por defecto - Network First
  return networkFirstStrategy(request);
}

// ===== ESTRATEGIA CACHE FIRST =====
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('💾 Service Worker: Sirviendo desde cache', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('🌐 Service Worker: Cacheando nuevo recurso', request.url);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Error en cache first', error);
    throw error;
  }
}

// ===== ESTRATEGIA NETWORK FIRST =====
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('🌐 Service Worker: Sirviendo desde network', request.url);
      
      // Cachear respuesta exitosa
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('💾 Service Worker: Fallback a cache', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('Accept')?.includes('text/html')) {
      return caches.match('/offline.html') || caches.match('/');
    }
    
    throw error;
  }
}

// ===== ESTRATEGIA STALE WHILE REVALIDATE =====
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Devolver respuesta cacheada inmediatamente
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        console.log('🔄 Service Worker: Actualizando cache', request.url);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Ignorar errores de actualización
    });
  
  event.waitUntil(fetchPromise);
  
  return cachedResponse || fetchPromise;
}

// ===== MANEJO OFFLINE =====
async function handleOfflineFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback para páginas HTML
  if (request.headers.get('Accept')?.includes('text/html')) {
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Crear página offline básica
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ODAM - Sin Conexión</title>
          <style>
            body { 
              font-family: 'Poppins', sans-serif; 
              background: #000; 
              color: #c8a25f; 
              text-align: center; 
              padding: 50px; 
            }
            h1 { color: #c8a25f; }
          </style>
        </head>
        <body>
          <h1>🔌 Sin Conexión</h1>
          <p>ODAM Producción Musical</p>
          <p>La página no está disponible sin conexión.</p>
          <button onclick="location.reload()">Reintentar</button>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  return new Response('Recurso no disponible offline', { status: 408 });
}

// ===== DETECCIÓN DE ASSETS ESTÁTICOS =====
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  const staticExtensions = [
    '.css', '.js', '.woff', '.woff2', '.ttf', '.eot',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
    '.mp3', '.wav', '.ogg'
  ];
  
  const staticPaths = [
    '/css/', '/js/', '/images/', '/assets/', '/audio/',
    '/fonts/', '/webfonts/'
  ];
  
  const isStaticExtension = staticExtensions.some(ext => 
    url.pathname.endsWith(ext)
  );
  
  const isStaticPath = staticPaths.some(path => 
    url.pathname.startsWith(path)
  );
  
  const isCDN = url.hostname.includes('cdn.osklindealba.com');
  const isFont = url.hostname.includes('fonts.googleapis.com') || 
                 url.hostname.includes('fonts.gstatic.com');
  
  const isFontAwesome = url.hostname.includes('cdnjs.cloudflare.com') && 
                        url.pathname.includes('font-awesome');
  
  const isParticles = url.hostname.includes('cdn.jsdelivr.net') && 
                      url.pathname.includes('particles.js');
  
  return isStaticExtension || isStaticPath || isCDN || isFont || 
         isFontAwesome || isParticles;
}

// ===== SINCRONIZACIÓN EN BACKGROUND =====
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronización en background', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar datos pendientes (formularios, etc.)
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      await syncData(data);
    }
    
    console.log('✅ Service Worker: Sincronización completada');
  } catch (error) {
    console.error('❌ Service Worker: Error en sincronización', error);
  }
}

// ===== NOTIFICACIONES PUSH =====
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'ODAM Producción Musical',
    icon: '/logo-192x192.png',
    badge: '/logo-192x192.png',
    image: data.image || '/tu-foto.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ODAM', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// ===== MANEJO DE MENSAJES =====
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: '2.0.0',
        cacheName: CACHE_NAME
      });
      break;
      
    case 'CACHE_URLS':
      cacheUrls(payload);
      break;
      
    case 'CLEAR_CACHE':
      clearCache();
      break;
  }
});

// ===== FUNCIONES AUXILIARES =====
async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  const results = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        results.push({ url, status: 'cached' });
      } else {
        results.push({ url, status: 'fetch_failed' });
      }
    } catch (error) {
      results.push({ url, status: 'error', error: error.message });
    }
  }
  
  return results;
}

async function clearCache() {
  const cacheNames = await caches.keys();
  const deletionPromises = cacheNames.map(cacheName => 
    caches.delete(cacheName)
  );
  
  await Promise.all(deletionPromises);
  console.log('🗑️ Service Worker: Cache limpiado');
}

async function getPendingData() {
  // Obtener datos pendientes de IndexedDB o localStorage
  return new Promise((resolve) => {
    if (self.indexedDB) {
      // Implementar lógica con IndexedDB
      resolve([]);
    } else {
      resolve([]);
    }
  });
}

async function syncData(data) {
  // Sincronizar datos con el servidor
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('✅ Service Worker: Datos sincronizados');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Service Worker: Error sincronizando datos', error);
    return false;
  }
}

// ===== LIGHTHOUSE PERFORMANCE MONITORING =====
function reportPerformanceMetrics() {
  if ('performance' in self) {
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    
    if (navigationTiming) {
      const metrics = {
        loadTime: navigationTiming.loadEventEnd - navigationTiming.navigationStart,
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart,
        firstByte: navigationTiming.responseStart - navigationTiming.requestStart,
        cacheEffectiveness: calculateCacheEffectiveness()
      };
      
      // Enviar métricas a Analytics
      sendMetricsToAnalytics(metrics);
    }
  }
}

function calculateCacheEffectiveness() {
  // Calcular efectividad del cache
  return Math.random() * 100; // Placeholder
}

function sendMetricsToAnalytics(metrics) {
  // Enviar métricas a Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'service_worker_metrics', metrics);
  }
}

// ===== INICIALIZACIÓN =====
console.log('🎵 ODAM Service Worker: Inicializado correctamente');
console.log('📦 Cache Name:', CACHE_NAME);
console.log('🔧 Estrategias:', CACHE_STRATEGIES);

// ===== EXPORTACIÓN PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    STATIC_ASSETS,
    CACHE_STRATEGIES,
    cacheFirstStrategy,
    networkFirstStrategy,
    staleWhileRevalidateStrategy
  };
}
