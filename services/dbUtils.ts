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
    where
} from "firebase/firestore";
import { Product, Order, ViewLog, RestockRequest, FooterPage, HomeLayoutConfig, Review } from "../types";

// Collection References
const PRODUCTS_COL = "products";
const ORDERS_COL = "orders";
const LOGS_COL = "viewLogs";
const REQUESTS_COL = "restockRequests";
const PAGES_COL = "pages";
const BRANDS_COL = "brands";
const REVIEWS_COL = "reviews";
const CONFIG_COL = "siteConfig";

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
        callback(products);
    });
};

export const subscribeToOrders = (callback: (data: Order[]) => void) => {
    return onSnapshot(collection(db, ORDERS_COL), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
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
export const saveProduct = async (product: Product) => {
    // Use setDoc to strictly set the ID, effectively "Upsert"
    const docRef = doc(db, PRODUCTS_COL, product.id);
    await setDoc(docRef, product);
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

export const logView = async (productId: string) => {
    await addDoc(collection(db, LOGS_COL), { productId, timestamp: Date.now() });
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

export const saveLayoutConfig = async (config: HomeLayoutConfig) => {
    await setDoc(doc(db, CONFIG_COL, "homeLayout"), config);
};

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

    const configRef = doc(db, CONFIG_COL, "homeLayout");
    batch.set(configRef, config);

    await batch.commit();
    console.log("Seeding complete.");
};
