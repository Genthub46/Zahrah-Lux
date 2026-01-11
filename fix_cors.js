const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

// Initialize Firebase Admin with the service account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "zahrah-boutique.firebasestorage.app"
});

const bucket = admin.storage().bucket();

async function setCors() {
    console.log("Setting CORS configuration...");

    await bucket.setCorsConfiguration([
        {
            // Allow all origins for simplicity in this troubleshooting phase. 
            // In production, we might want to restrict to the specific domain.
            origin: ["*"],
            method: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
            responseHeader: ["Content-Type", "x-goog-resumable"],
            maxAgeSeconds: 3600
        }
    ]);

    console.log("CORS configuration updated successfully!");
}

setCors().catch(error => {
    console.error("Error setting CORS:", error);
    process.exit(1);
});
