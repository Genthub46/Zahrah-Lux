import { httpsCallable } from "firebase/functions";
import { functions } from "./firebaseConfig";
import { isSandboxMode } from "./dbUtils";

export interface AutomatedEmailResult {
    success: boolean;
    id?: string;
    sandbox?: boolean;
    message?: string;
}

export const sendAutomatedEmail = async (to: string | string[], subject: string, html: string): Promise<AutomatedEmailResult> => {
    // 1. Sandbox Playground Interception
    // In Sandbox mode, we simulate email sending to allow end-to-end checkout & admin testing
    // without requiring an active Resend API key or verified domain.
    if (isSandboxMode()) {
        const simulatedId = `sandbox_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        console.groupCollapsed(`🧪 [Sandbox Email Simulator] ${subject}`);
        console.log(`To:`, to);
        console.log(`Subject:`, subject);
        console.log(`Simulated ID:`, simulatedId);
        console.log(`Timestamp:`, new Date().toISOString());
        console.log(`HTML Body Preview:`, html);
        console.groupEnd();

        return {
            success: true,
            sandbox: true,
            id: simulatedId,
            message: "Simulated email delivery in Sandbox Playground mode."
        };
    }

    // 2. Production Dispatch via Firebase Cloud Function
    try {
        const sendEmailFn = httpsCallable<{ to: string | string[]; subject: string; html: string }, AutomatedEmailResult>(functions, 'sendAutomatedEmail');
        const result = await sendEmailFn({ to, subject, html });
        return (result.data as AutomatedEmailResult) || { success: true };
    } catch (error) {
        console.error("Failed to send automated email via backend:", error);
        throw error;
    }
};
