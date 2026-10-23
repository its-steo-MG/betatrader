// app/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.2.0/workbox-sw.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

workbox.precaching.precacheAndRoute([
  { url: '/offline.html', revision: '1' },
]);

workbox.routing.registerRoute(
  ({ url }) => url.protocol.startsWith('https'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'offlineCache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 200 }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif)$/),
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkOnly({
    plugins: [
      {
        handlerDidError: async () => {
          return caches.match('/offline.html') || new Response('You are offline. Please check your connection.', {
            headers: { 'Content-Type': 'text/html' },
          });
        },
      },
    ],
  })
);

self.addEventListener('push', (event) => {
  let data = { title: 'BetaTrader Alert', body: 'New trading opportunity available!' };
  if (event.data) data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/images/traderiser-logo-192.png',
    badge: '/images/traderiser-logo-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data.url;
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
