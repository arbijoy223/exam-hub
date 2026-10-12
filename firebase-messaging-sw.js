/* AR Bijoy Exam Center - Firebase Cloud Messaging service worker */
/* Keep notificationclick listener BEFORE Firebase imports, as Firebase docs recommend. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || 'https://arbijoy223.github.io/exam-hub/';
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        if ('navigate' in client && client.url !== target) await client.navigate(target);
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
  })());
});

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDO1IpkyAsriPXMfITAF_P-JnN_gpXxEsA',
  authDomain: 'exam-center-8c4bf.firebaseapp.com',
  projectId: 'exam-center-8c4bf',
  messagingSenderId: '816725272451',
  appId: '1:816725272451:web:80f5ac19bdf8f3523978b6'
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || payload.notification?.title || 'AR Bijoy Exam Center';
  const body = data.body || payload.notification?.body || 'You have a new update.';
  const url = data.url || 'https://arbijoy223.github.io/exam-hub/';
  return self.registration.showNotification(title, {
    body,
    icon: new URL('./icons/icon-192.png', self.location.href).href,
    badge: new URL('./icons/icon-192.png', self.location.href).href,
    vibrate: [250, 100, 250, 100, 400],
    tag: data.tag || ('arbijoy-' + Date.now()),
    data: { url }
  });
});
