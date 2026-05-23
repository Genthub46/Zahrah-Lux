import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AdminRole } from './adminPermissions';

const STAFF_COL = 'staff_members';

export interface StaffMember {
    email: string;
    role: AdminRole;
    name?: string;
    addedAt: string;
}

export const getStaffRole = async (email: string | null | undefined): Promise<AdminRole | null> => {
    if (!email) return null;
    if (email === 'admin@zahrah.com') return 'super_admin'; // Fallback owner

    try {
        const ref = doc(db, STAFF_COL, email.toLowerCase());
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data().role as AdminRole;
        }
        return null;
    } catch (err) {
        console.error("Error fetching staff role:", err);
        return null;
    }
};

export const getAllStaffMembers = async (): Promise<StaffMember[]> => {
    try {
        const snap = await getDocs(collection(db, STAFF_COL));
        return snap.docs.map(doc => doc.data() as StaffMember);
    } catch (err) {
        console.error("Error fetching staff members:", err);
        return [];
    }
};

export const addStaffMember = async (member: StaffMember): Promise<void> => {
    try {
        const ref = doc(db, STAFF_COL, member.email.toLowerCase());
        await setDoc(ref, member);
    } catch (err) {
        console.error("Error adding staff member:", err);
        throw err;
    }
};

export const removeStaffMember = async (email: string): Promise<void> => {
    try {
        if (email.toLowerCase() === 'admin@zahrah.com') throw new Error("Cannot remove primary owner");
        const ref = doc(db, STAFF_COL, email.toLowerCase());
        await deleteDoc(ref);
    } catch (err) {
        console.error("Error removing staff member:", err);
        throw err;
    }
};
