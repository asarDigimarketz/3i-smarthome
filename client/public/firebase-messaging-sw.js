// Firebase service worker using compat SDK

// Import Firebase scripts with version 11.10.0
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');



const firebaseConfig = {
    apiKey: "{{NEXT_PUBLIC_FIREBASE_API_KEY}}",
    authDomain: "{{NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}}",
    projectId: "{{NEXT_PUBLIC_FIREBASE_PROJECT_ID}}",
    storageBucket: "{{NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{NEXT_PUBLIC_FIREBASE_APP_ID}}"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();


// Handle background messages with 3i SmartHome branding
messaging.onBackgroundMessage(function (payload) {

    // Create notification with 3i SmartHome branding
    const notificationTitle = payload.notification?.title || '3i SmartHome - New Update';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification from 3i SmartHome',
        icon: '/notification/3iLogo.png', // 3i SmartHome logo as notification icon
        badge: '/notification/3iLogo.png', // 3i SmartHome logo as badge
        // Removed large image to make notification cleaner
        tag: payload.data?.tag || 'smarthome-notification',
        requireInteraction: true, // Keeps notification open for user interaction
        silent: false,
        vibrate: [200, 100, 200],
        data: {
            url: payload.data?.url || '/dashboard',
            ...payload.data
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/notification/open-icon.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/notification/close-icon.svg'
            }
        ],
        // Enhanced styling options
        dir: 'ltr',
        lang: 'en',
        renotify: false,
        timestamp: Date.now()
    };

    console.log('🔔 Showing notification with options:', notificationOptions);

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    console.log('🔔 Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'open') {
        // Open 3i SmartHome app - use relative URL
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default click action - open 3i SmartHome dashboard
        const urlToOpen = event.notification.data?.url || '/dashboard';
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

