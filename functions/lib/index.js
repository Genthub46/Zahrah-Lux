"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProductPage = exports.paystackWebhook = exports.sendAutomatedEmail = void 0;
const functions = require("firebase-functions");
const fs = require("fs");
const path = require("path");
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY || '');
exports.sendAutomatedEmail = functions.https.onCall(async (data, context) => {
    var _a;
    const { to, subject, html } = data;
    if (!to || !subject || !html) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing email parameters.');
    }
    try {
        const response = await resend.emails.send({
            from: 'Zarhrah Luxury Collections <onboarding@resend.dev>',
            to,
            subject,
            html,
            reply_to: 'alerts@zarhrahluxurycollections.com',
        });
        if (response.error) {
            console.error("Resend API Error:", response.error);
            throw new functions.https.HttpsError('internal', response.error.message);
        }
        return { success: true, id: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send email.');
    }
});
const admin = require("firebase-admin");
const crypto = require("crypto");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_PLACEHOLDER_KEY';
    // Validate signature
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
        res.status(401).send('Unauthorized');
        return;
    }
    const event = req.body;
    if (event.event === 'charge.success') {
        const reference = event.data.reference;
        try {
            // Find order by reference (assuming paymentReference was saved as Pending)
            const ordersRef = db.collection('orders');
            const snapshot = await ordersRef.where('paymentReference', '==', reference).limit(1).get();
            if (snapshot.empty) {
                console.error(`Order with reference ${reference} not found.`);
                res.status(404).send('Order not found');
                return;
            }
            const orderDoc = snapshot.docs[0];
            const orderData = orderDoc.data();
            if (orderData.paymentStatus === 'Paid') {
                res.status(200).send('Already processed');
                return;
            }
            // Start a batch write to atomically update order and decrement stock
            const batch = db.batch();
            // Mark order as paid
            batch.update(orderDoc.ref, { paymentStatus: 'Paid' });
            // Decrement stock for each item
            const items = orderData.items || [];
            for (const item of items) {
                const productRef = db.collection('products').doc(item.id);
                // We use increment with a negative value to safely decrement
                batch.update(productRef, {
                    stock: admin.firestore.FieldValue.increment(-item.quantity)
                });
            }
            await batch.commit();
            console.log(`Successfully processed payment for order ${orderDoc.id}`);
            res.status(200).send('Success');
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else {
        // Acknowledge other events without processing
        res.status(200).send('Event ignored');
    }
});
exports.renderProductPage = functions.https.onRequest(async (req, res) => {
    try {
        const pathParts = req.path.split('/').filter(p => p);
        // req.path is usually something like "/product/123"
        const productId = pathParts[pathParts.length - 1];
        // 1. Read the base index.html
        // We assume index.html is copied to functions/lib/index.html during build
        const indexPath = path.resolve(__dirname, 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');
        // 2. Fetch the product from Firestore
        if (productId) {
            // Check if it's the id directly or prefixed with 'p-'
            let docRef = db.collection('products').doc(productId);
            let docSnap = await docRef.get();
            if (!docSnap.exists && !productId.startsWith('p-')) {
                docRef = db.collection('products').doc(`p-${productId}`);
                docSnap = await docRef.get();
            }
            if (docSnap.exists) {
                const product = docSnap.data();
                if (product) {
                    const title = `${product.name} | Zarhrah Luxury`;
                    const description = product.description || 'Experience premium luxury fashion at Zarhrah.';
                    const image = (product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1549439602-43ebca23d7bc?q=80&w=2070&auto=format&fit=crop';
                    // 3. Inject meta tags
                    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
                    html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`);
                    html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${title}">`);
                    html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${description}">`);
                    html = html.replace(/<meta property="og:image" content=".*?">/, `<meta property="og:image" content="${image}">\n    <meta property="og:image:width" content="2160">\n    <meta property="og:image:height" content="2700">`);
                    html = html.replace(/<meta name="twitter:title" content=".*?">/, `<meta name="twitter:title" content="${title}">`);
                    html = html.replace(/<meta name="twitter:description" content=".*?">/, `<meta name="twitter:description" content="${description}">`);
                    html = html.replace(/<meta name="twitter:image" content=".*?">/, `<meta name="twitter:image" content="${image}">`);
                }
            }
        }
        // 4. Return the modified (or original) HTML
        res.status(200).send(html);
    }
    catch (error) {
        console.error("Error in renderProductPage:", error);
        // Fallback to sending the original index.html or a 500 error
        try {
            const fallbackPath = path.resolve(__dirname, 'index.html');
            res.status(200).send(fs.readFileSync(fallbackPath, 'utf8'));
        }
        catch (e) {
            res.status(500).send('Server Error');
        }
    }
});
//# sourceMappingURL=index.js.map