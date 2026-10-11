/* AR Bijoy Exam Center — Firebase Cloud Messaging service worker.
   Deploy beside index.html at /Exam-Center/firebase-messaging-sw.js */
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
  const title = payload.notification?.title || payload.data?.title || 'AR Bijoy Exam Center';
  const body = payload.notification?.body || payload.data?.body || 'There is a new exam update.';
  self.registration.showNotification(title, {
    body,
    icon: './favicon.ico',
    badge: './favicon.ico',
    tag: payload.data?.tag || 'arbijoy-exam-center',
    data: { url: payload.data?.url || 'https://arbijoy223.github.io/Exam-Center/' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://arbijoy223.github.io/Exam-Center/';
  event.waitUntil((async () => {
    const openClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of openClients) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(targetUrl);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});
