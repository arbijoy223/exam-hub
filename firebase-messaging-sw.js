/* firebase-messaging-sw.js  — put this file next to index.html (same folder, same level).
   Fill the SIX values below from: Firebase Console -> Project settings -> General -> Your apps -> Web app -> SDK setup (Config). */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "PASTE_apiKey",
  authDomain: "PASTE_authDomain",
  projectId: "PASTE_projectId",
  storageBucket: "PASTE_storageBucket",
  messagingSenderId: "PASTE_messagingSenderId",
  appId: "PASTE_appId"
});

const messaging = firebase.messaging();

// Messages that carry a "notification" block are shown by the browser automatically.
// Data-only messages are shown here.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'AR Bijoy Exam Center', {
    body: d.body || '',
    tag: d.tag || undefined,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [250, 100, 250, 100, 400],
    requireInteraction: true,
    data: { url: d.url || './' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { return c.focus(); } }
      return clients.openWindow(url);
    })
  );
});
