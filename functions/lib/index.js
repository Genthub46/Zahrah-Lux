"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAutomatedEmail = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
const resend = new resend_1.Resend('re_dkBKdpUH_BFRm3nWvdXbgUtKzukosZxbC');
exports.sendAutomatedEmail = functions.https.onCall(async (data, context) => {
    var _a;
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
        return { success: true, id: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send email.');
    }
});
//# sourceMappingURL=index.js.map