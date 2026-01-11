const { Storage } = require("@google-cloud/storage");
const serviceAccount = require("./key.json");

console.log("Using Project ID:", serviceAccount.project_id);

const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
    }
});

const possibleNames = [
    "zahrah-boutique.appspot.com",
    "zahrah-boutique.firebasestorage.app",
    `${serviceAccount.project_id}.appspot.com`,
    `${serviceAccount.project_id}.firebasestorage.app`
];

// Deduplicate
const uniqueNames = [...new Set(possibleNames)];

async function tryBucket(name) {
    console.log(`\nTrying bucket: ${name}...`);
    const bucket = storage.bucket(name);
    try {
        await bucket.setCorsConfiguration([
            {
                origin: ["*"],
                method: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
                responseHeader: ["Content-Type", "x-goog-resumable"],
                maxAgeSeconds: 3600
            }
        ]);
        console.log(`>>> SUCCESS! CORS updated on ${name}`);
        return true;
    } catch (e) {
        console.log(`x Failed on ${name}: ${e.message}`);
        // console.log(e);
        return false;
    }
}

async function run() {
    let success = false;
    for (const name of uniqueNames) {
        if (await tryBucket(name)) {
            success = true;
            break;
        }
    }

    if (success) {
        console.log("\nPassed! You can verify uploads now.");
    } else {
        console.error("\nFAILED. Could not find or access any valid bucket.");
    }
}

run();
