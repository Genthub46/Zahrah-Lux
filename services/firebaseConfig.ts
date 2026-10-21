import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBAI9Tdd_NJAgBxr1f7YnM8t9ss9fKt6XE",
    authDomain: "zahrah-boutique.firebaseapp.com",
    projectId: "zahrah-boutique",
    storageBucket: "zahrah-boutique.firebasestorage.app",
    messagingSenderId: "463080028844",
    appId: "1:463080028844:web:89dee11bbb24e2c46e7d09",
    measurementId: "G-N2CS95WEY2"
};

import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Enable browser-side cache and offline persistence for ultra-speed and data saving
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence precondition failed (multiple tabs open)");
    } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence is unimplemented in this browser");
    }
});

export const auth = getAuth(app);
export const messaging = getMessaging(app);
export const functions = getFunctions(app);

// Safe Firebase Analytics initialization (works in browser environments)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analyticsInstance = getAnalytics(app);
        }
    }).catch(() => {
        // Analytics not supported in this runtime
    });
}

export const getAnalyticsInstance = () => analyticsInstance;
