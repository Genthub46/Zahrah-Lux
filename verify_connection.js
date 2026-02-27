import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBAI9Tdd_NJAgBxr1f7YnM8t9ss9fKt6XE",
    authDomain: "zahrah-boutique.firebaseapp.com",
    projectId: "zahrah-boutique",
    storageBucket: "zahrah-boutique.firebasestorage.app",
    messagingSenderId: "463080028844",
    appId: "1:463080028844:web:89dee11bbb24e2c46e7d09"
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Testing Firestore connection...");
try {
    // Try to fetch products (even if empty, it verifies permission/connection)
    const querySnapshot = await getDocs(collection(db, "products"));
    console.log("Success! Connection established.");
    console.log(`Found ${querySnapshot.size} documents in 'products' collection.`);
    process.exit(0);
} catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
}
