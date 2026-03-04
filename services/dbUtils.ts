import { db } from "./firebaseConfig";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    writeBatch,
    getDocs,
    query,
    where,
    getDoc
} from "firebase/firestore";
import { Product, Order, ViewLog, RestockRequest, FooterPage, HomeLayoutConfig, Review } from "../types";
import { PRODUCT_CATEGORIES } from "../constants";

// Collection References
const PRODUCTS_COL = "products";
const ORDERS_COL = "orders";
const LOGS_COL = "viewLogs";
const REQUESTS_COL = "restockRequests";
const PAGES_COL = "pages";
const BRANDS_COL = "brands";
const REVIEWS_COL = "reviews";
const CONFIG_COL = "siteConfig";
const USERS_COL = "users";

// --- Subscriptions ---
export const subscribeToBrands = (callback: (data: any[]) => void) => {
    return onSnapshot(collection(db, BRANDS_COL), (snapshot) => {
        const brands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(brands);
    });
};
export const subscribeToProducts = (callback: (data: Product[]) => void) => {
    return onSnapshot(collection(db, PRODUCTS_COL), (snapshot) => {
        const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        // Sort by ID descending (Newest First, assuming p-TIMESTAMP format)
        products.sort((a, b) => b.id.localeCompare(a.id));
        callback(products);
    });
};

export const subscribeToOrders = (callback: (data: Order[]) => void) => {
    return onSnapshot(collection(db, ORDERS_COL), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        callback(orders);
    });
};

export const subscribeToUserOrders = (email: string, callback: (data: Order[]) => void) => {
    if (!email) return () => { };
    const q = query(collection(db, ORDERS_COL), where("customerEmail", "==", email));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        // Sort by date descending
        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(orders);
    });
};

export const subscribeToLogs = (callback: (data: ViewLog[]) => void) => {
    return onSnapshot(collection(db, LOGS_COL), (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ ...doc.data() } as ViewLog));
        callback(logs);
    });
};

export const subscribeToRequests = (callback: (data: RestockRequest[]) => void) => {
    return onSnapshot(collection(db, REQUESTS_COL), (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RestockRequest));
        callback(reqs);
    });
};

export const subscribeToPages = (callback: (data: FooterPage[]) => void) => {
    return onSnapshot(collection(db, PAGES_COL), (snapshot) => {
        const pages = snapshot.docs.map(doc => ({ ...doc.data() } as FooterPage));
        // Sort logic if needed
        callback(pages);
    });
};

export const subscribeToLayout = (callback: (data: HomeLayoutConfig | null) => void) => {
    return onSnapshot(doc(db, CONFIG_COL, "homeLayout"), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as HomeLayoutConfig);
        } else {
            callback(null);
        }
    });
};

// --- Operations ---
export const saveProduct = async (product: Partial<Product> & { id: string }) => {
    // Use setDoc with merge: true for safer partial updates
    const docRef = doc(db, PRODUCTS_COL, product.id);
    await setDoc(docRef, product, { merge: true });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    const docRef = doc(db, PRODUCTS_COL, id);
    await updateDoc(docRef, data);
};

export const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, PRODUCTS_COL, id));
};

export const saveOrder = async (order: Order) => {
    // Orders can be addDoc or setDoc. Let's use setDoc for consistency if ID exists
    if (order.id) {
        await setDoc(doc(db, ORDERS_COL, order.id), order);
    } else {
        await addDoc(collection(db, ORDERS_COL), order);
    }
};

export const logView = async (productId: string, userId?: string) => {
    await addDoc(collection(db, LOGS_COL), { productId, userId: userId || null, timestamp: Date.now() });
};

export const addRestockRequest = async (req: RestockRequest) => {
    await addDoc(collection(db, REQUESTS_COL), req);
};


export const saveRestockRequest = async (request: RestockRequest) => {
    try {
        if (!request.id) {
            // New Request: removing 'id' to let Firestore generate it
            // Firestore errors if you pass 'undefined' as a value
            const { id, ...data } = request;
            const docRef = await addDoc(collection(db, REQUESTS_COL), data);
            return docRef.id;
        } else {
            await updateDoc(doc(db, REQUESTS_COL, request.id), { ...request });
            return request.id;
        }
    } catch (error) {
        console.error("Error saving restock request", error);
        throw error;
    }
};

export const deleteRestockRequest = async (id: string) => {
    await deleteDoc(doc(db, REQUESTS_COL, id));
};

export const updateRestockRequestStatus = async (id: string, status: 'Pending' | 'Notified') => {
    await updateDoc(doc(db, REQUESTS_COL, id), { status });
};

export const saveFooterPage = async (page: FooterPage) => {
    // Use slug as ID
    await setDoc(doc(db, PAGES_COL, page.slug), page);
};

export const deleteFooterPage = async (slug: string) => {
    await deleteDoc(doc(db, PAGES_COL, slug));
};

export const subscribeToReviews = (callback: (reviews: Review[]) => void) => {
    const q = query(collection(db, REVIEWS_COL));
    return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        // Sort by date descending
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(reviews);
    });
};

export const saveReview = async (review: Review) => {
    // If ID starts with 'rev-', it might be a temporary client-side ID.
    // However, if we want to let Firestore generate the ID, we should remove it.
    // But typically we want to keep the ID if we generated it.
    // Let's assume we want to use setDoc with the provided ID since Checkout generates a timestamp-based ID.
    if (review.id) {
        await setDoc(doc(db, REVIEWS_COL, review.id), review);
    } else {
        await addDoc(collection(db, REVIEWS_COL), review);
    }
};

export const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, REVIEWS_COL, id));
};

export const saveLayoutConfig = async (config: Partial<HomeLayoutConfig>) => {
    await setDoc(doc(db, CONFIG_COL, "homeLayout"), config, { merge: true });
};

// --- Categories ---
const CATEGORIES_COL = "categories";

export const subscribeToCategories = (callback: (data: { id: string; name: string }[]) => void) => {
    return onSnapshot(collection(db, CATEGORIES_COL), (snapshot) => {
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; name: string }));
        callback(categories.sort((a, b) => a.name.localeCompare(b.name)));
    });
};

export const saveCategory = async (name: string) => {
    const q = query(collection(db, CATEGORIES_COL), where("name", "==", name));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return; // Exists
    await addDoc(collection(db, CATEGORIES_COL), { name });
};

export const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
};

// --- Brands ---
export const saveBrand = async (name: string) => {
    await addDoc(collection(db, BRANDS_COL), { name });
};

export const deleteBrand = async (id: string) => {
    await deleteDoc(doc(db, BRANDS_COL, id));
};

// --- Seeding ---
export const seedInitialData = async (products: Product[], config: HomeLayoutConfig, pages: FooterPage[]) => {
    console.log("Seeding initial data to Firestore...");
    const batch = writeBatch(db);

    products.forEach(p => {
        const ref = doc(db, PRODUCTS_COL, p.id);
        batch.set(ref, p);
    });

    pages.forEach(p => {
        const ref = doc(db, PAGES_COL, p.slug);
        batch.set(ref, p);
    });

    // Seed Default Categories
    for (const c of PRODUCT_CATEGORIES) {
        const q = query(collection(db, CATEGORIES_COL), where("name", "==", c));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            const ref = doc(collection(db, CATEGORIES_COL));
            batch.set(ref, { name: c });
        }
    }

    const configRef = doc(db, CONFIG_COL, "homeLayout");
    batch.set(configRef, config);

    await batch.commit();
    console.log("Seeding complete.");
};

// --- User Data Persistence ---
export const saveUserData = async (userId: string, data: { cart?: any[], wishlist?: any[] }) => {
    if (!userId) return;
    const userRef = doc(db, USERS_COL, userId);
    await setDoc(userRef, data, { merge: true });
};

export const subscribeToUsers = (callback: (data: any[]) => void) => {
    return onSnapshot(collection(db, USERS_COL), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ ...doc.data() }));
        callback(users);
    });
};

export const getUserData = async (userId: string) => {
    if (!userId) return null;
    const docRef = doc(db, USERS_COL, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return snap.data() as { cart?: any[], wishlist?: any[] };
    }
    return null;
};

export const subscribeToUserData = (userId: string, callback: (data: { cart: any[], wishlist: any[] } | null) => void) => {
    if (!userId) return () => { };
    return onSnapshot(doc(db, USERS_COL, userId), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback({ cart: data.cart || [], wishlist: data.wishlist || [] });
        } else {
            callback(null);
        }
    });
};

// --- Activity Logs ---
const ADMIN_LOGS_COL = "adminLogs";

export const subscribeToAdminLogs = (callback: (logs: any[]) => void) => {
    // Sort logic should ideally happen server-side or via query, but client-side sort for now
    const q = query(collection(db, ADMIN_LOGS_COL));
    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        logs.sort((a: any, b: any) => b.timestamp - a.timestamp); // Newest first
        callback(logs);
    });
};

export const logAdminAction = async (
    action: string,
    details: string,
    userEmail: string = "Unknown",
    options?: {
        resourceType?: string;
        resourceId?: string;
        beforeState?: any;
        afterState?: any;
    }
) => {
    // Fire and forget - do not block the UI for logging
    Promise.resolve().then(async () => {
        try {
            // Capture browser info
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

            // Attempt to get IP address (will be fetched client-side via external service)
            let ipAddress = 'Unknown';
            try {
                // Use a simple IP detection service (fallback to unknown)
                const ipResponse = await fetch('https://api.ipify.org?format=json', {
                    signal: AbortSignal.timeout(1000) // Reduced to 1 second
                });
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    ipAddress = ipData.ip || 'Unknown';
                }
            } catch {
                // Ignore IP fetch errors - not critical
            }

            await addDoc(collection(db, ADMIN_LOGS_COL), {
                action,
                details,
                userEmail,
                timestamp: Date.now(),
                // Enhanced audit fields
                ipAddress,
                userAgent,
                resourceType: options?.resourceType || null,
                resourceId: options?.resourceId || null,
                beforeState: options?.beforeState ? JSON.stringify(options.beforeState) : null,
                afterState: options?.afterState ? JSON.stringify(options.afterState) : null,
            });
        } catch (error) {
            console.error("Failed to log admin action:", error);
        }
    });
};

// --- Newsletter ---
const NEWSLETTER_COL = "newsletter";

export const subscribeToNewsletter = async (email: string) => {
    // Check if already exists to avoid duplicates
    const q = query(collection(db, NEWSLETTER_COL), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return; // Already subscribed
    }

    await addDoc(collection(db, NEWSLETTER_COL), {
        email,
        date: new Date().toISOString()
    });
};
