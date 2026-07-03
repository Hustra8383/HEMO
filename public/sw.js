/**
 * HEMO Service Worker
 * Handles background push notifications, client message notifications, and activation.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'HEMO Update ❤️', message: event.data.text() };
    }
  }

  const title = data.title || 'HEMO Update ❤️';
  const options = {
    body: data.message || 'New shared relationship event!',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: data,
    tag: 'hemo-sync',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Also support posting a message to the sw to show a notification immediately from background
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, message, ...rest } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'HEMO Update ❤️', {
        body: message,
        icon: '/assets/logo.png',
        badge: '/assets/logo.png',
        ...rest
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
