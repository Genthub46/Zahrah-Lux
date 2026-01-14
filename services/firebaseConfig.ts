import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBAI9Tdd_NJAgBxr1f7YnM8t9ss9fKt6XE",
    authDomain: "zahrah-boutique.firebaseapp.com",
    projectId: "zahrah-boutique",
    storageBucket: "zahrah-boutique.firebasestorage.app",
    messagingSenderId: "463080028844",
    appId: "1:463080028844:web:89dee11bbb24e2c46e7d09"
};

import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
