/**
 * Google Analytics 4 (GA4) & Firebase Analytics Integration Service
 * Measurement ID: G-N2CS95WEY2 | Property ID: 55990544 | Stream: ZahrahWeb (16175982511)
 */

import { Product, CartItem } from '../types';
import { getAnalyticsInstance } from './firebaseConfig';
import { logEvent } from 'firebase/analytics';

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

export const GA_MEASUREMENT_ID = 'G-N2CS95WEY2';
export const GA_PROPERTY_ID = '55990544';
export const GA_STREAM_ID = '16175982511';

/**
 * Universal event dispatcher for both gtag.js and Firebase Analytics SDK
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
    // 1. Dispatch via window.gtag if loaded
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        try {
            window.gtag('event', eventName, params);
        } catch (err) {
            console.debug('[GA4] gtag error:', err);
        }
    }

    // 2. Dispatch via Firebase Analytics SDK if supported
    try {
        const analytics = getAnalyticsInstance();
        if (analytics) {
            logEvent(analytics, eventName, params);
        }
    } catch (err) {
        console.debug('[GA4] Firebase Analytics error:', err);
    }
}

/**
 * Track SPA Route Page Views
 */
export function trackPageView(path: string, title?: string) {
    trackEvent('page_view', {
        page_location: window.location.href,
        page_path: path,
        page_title: title || document.title,
    });
}

/**
 * Track Product Detail Page View (view_item)
 */
export function trackViewItem(product: Product) {
    if (!product) return;

    trackEvent('view_item', {
        currency: 'NGN',
        value: product.price,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category,
                item_brand: product.brand || 'Zarhrah Luxury',
            }
        ]
    });
}

/**
 * Track Add To Cart Event (add_to_cart)
 */
export function trackAddToCart(
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    selectedColor?: string,
    effectivePrice?: number
) {
    if (!product) return;
    const unitPrice = effectivePrice || product.price;

    trackEvent('add_to_cart', {
        currency: 'NGN',
        value: unitPrice * quantity,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: unitPrice,
                quantity: quantity,
                item_category: product.category,
                item_brand: product.brand || 'Zarhrah Luxury',
                item_variant: [selectedColor, selectedSize].filter(Boolean).join(' / ') || undefined
            }
        ]
    });
}

/**
 * Track Begin Checkout Event (begin_checkout)
 */
export function trackBeginCheckout(cart: CartItem[], total: number) {
    if (!cart || cart.length === 0) return;

    trackEvent('begin_checkout', {
        currency: 'NGN',
        value: total,
        items: cart.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_category: item.category,
            item_brand: item.brand || 'Zarhrah Luxury',
            item_variant: [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || undefined
        }))
    });
}

/**
 * Track Completed Purchase Event (purchase)
 */
export function trackPurchase(orderId: string, total: number, items: CartItem[]) {
    if (!items || items.length === 0) return;

    trackEvent('purchase', {
        transaction_id: orderId,
        currency: 'NGN',
        value: total,
        items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_category: item.category,
            item_brand: item.brand || 'Zarhrah Luxury',
            item_variant: [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || undefined
        }))
    });
}

/**
 * Track Search Events (search)
 */
export function trackSearch(searchTerm: string) {
    if (!searchTerm) return;
    trackEvent('search', {
        search_term: searchTerm
    });
}
