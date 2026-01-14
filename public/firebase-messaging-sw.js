importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBAI9Tdd_NJAgBxr1f7YnM8t9ss9fKt6XE",
    authDomain: "zahrah-boutique.firebaseapp.com",
    projectId: "zahrah-boutique",
    storageBucket: "zahrah-boutique.firebasestorage.app",
    messagingSenderId: "463080028844",
    appId: "1:463080028844:web:89dee11bbb24e2c46e7d09"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png' // Ensure you have a logo or similar icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
