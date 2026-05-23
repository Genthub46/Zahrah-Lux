import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Check if service account exists, if not, skip
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (e) {
  console.log("No serviceAccountKey.json found. Please run this script with proper credentials or skip if you are running from client.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();

  if (snapshot.size === 0) {
    return;
  }

  console.log(`Deleting ${snapshot.size} documents from ${collectionPath}...`);
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

async function wipeVolatileData() {
  const collectionsToWipe = [
    'products', 'orders', 'activity_logs', 'restock_requests',
    'reviews', 'users', 'admin_logs', 'newsletter_subscribers',
    'abandoned_checkouts', 'notifications'
  ];

  for (const col of collectionsToWipe) {
    try {
      await deleteCollection(col);
      console.log(`Successfully wiped collection: ${col}`);
    } catch (error) {
      console.error(`Error wiping ${col}:`, error);
    }
  }
  console.log("Database wipe completed!");
}

wipeVolatileData();
