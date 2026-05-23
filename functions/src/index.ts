import * as functions from 'firebase-functions';
import { Resend } from 'resend';

const resend = new Resend('re_dkBKdpUH_BFRm3nWvdXbgUtKzukosZxbC');

export const sendAutomatedEmail = functions.https.onCall(async (data, context) => {

    const { to, subject, html } = data;

    if (!to || !subject || !html) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing email parameters.');
    }

    try {
        const response = await resend.emails.send({
            from: 'Zarhrah Luxury Collections <alerts@zarhrahluxurycollections.com>',
            to,
            subject,
            html,
            reply_to: 'alerts@zarhrahluxurycollections.com',
        });
        
        return { success: true, id: response.data?.id };
    } catch (error: any) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send email.');
    }
});

import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

export const paystackWebhook = functions.https.onRequest(async (req, res) => {
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
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // Acknowledge other events without processing
        res.status(200).send('Event ignored');
    }
});
