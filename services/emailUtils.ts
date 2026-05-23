import { httpsCallable } from "firebase/functions";
import { functions } from "./firebaseConfig";

export const sendAutomatedEmail = async (to: string | string[], subject: string, html: string) => {
    try {
        const sendEmailFn = httpsCallable(functions, 'sendAutomatedEmail');
        const result = await sendEmailFn({ to, subject, html });
        return result.data;
    } catch (error) {
        console.error("Failed to send automated email:", error);
        throw error;
    }
};
