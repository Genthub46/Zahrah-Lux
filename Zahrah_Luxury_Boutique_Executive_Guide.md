# Zahrah Luxury Boutique: Complete Executive & Customer Operations Guide

This comprehensive guide is prepared exclusively for **Zahrah Luxury Boutique**. It details the shipping structure, client navigation flows, executive admin capabilities, and under-the-hood technical operations.

---

## SECTION 1: Dynamic Shipping Fee Calculation Model

The Zahrah Luxury checkout engine dynamically calculates shipping fees in real-time during **Step 2 (Information & Delivery)** of the checkout process. Calculations are based on the client's selected delivery state and order value.

### Shipping Fee Structure

| Delivery Method / Region | Destination States | Delivery Fee | Expected Delivery Time |
| :--- | :--- | :--- | :--- |
| **Boutique Pickup** | ASHLUXURY (22b Admiralty Way, Lekki Phase 1, Lagos) | **₦0 (Free)** | Ready within 24 Hours |
| **Elite Orders Threshold** | Any State in Nigeria (Order value &ge; ₦500,000) | **₦0 (Complimentary)** | 1–3 Business Days (Expedited) |
| **Lagos Delivery** | Lagos State | **₦5,000** | 1–2 Business Days |
| **South-West Region** | Ogun, Oyo, Osun, Ondo, Ekiti | **₦8,000** | 2–3 Business Days |
| **Rest of Nigeria** | Abuja, Rivers, Kano, Enugu, Delta, and all other states | **₦15,000** | 3–5 Business Days |

### Special Delivery Features
* **Free Shipping threshold:** Any single checkout totaling **₦500,000 or above** automatically activates free, premium white-glove shipping to any doorstep nationwide. A luxury progress bar in the bag summary informs clients how close they are to unlocking this complimentary service.
* **Complimentary Shipping Promo Codes:** Applying the exclusive promotional code **`FREESHIP`** instantly waives the delivery fee, regardless of destination or order value.
* **Secure Cache Enforcements:** Rates are computed on checkout before payment initialization to guarantee that there is never a mismatch between the paid total and database records.

---

## SECTION 2: Client User Guide (How to Use the Webapp)

### Step 1: Navigating the Curated Collections
1. **Explore the Manor:** Clients can browse the homepage to experience the flagship hero banners, curated picks tabs, and seasonal editorial lookbooks.
2. **Select & Modify Pieces:**
   * Clicking on a product opens a high-definition detailed view showcasing high-quality images, sizing options, color ways, and materials composition.
   * Clients select their desired size and color before clicking **Add to Bag**.
   * If a client adds a item from the list without specifying details, the webapp opens an elegant **Variant Selection Modal** to complete the choice.

### Step 2: Curating the Shopping Bag
1. **Open the Shopping Bag:** Click on the shopping bag icon on the top right header to enter the cart review step.
2. **Review Selections:** Clients can easily adjust quantities, modify sizes or colors, or delete items. Prices and currency indicators (NGN) are updated instantly.
3. **Apply Promos:** Clients can enter exclusive coupons in the promo section (e.g., `WELCOME10` for 10% off, `LUXURY5` for 5% off, `FREESHIP` for free shipping, or `ZAHRAH50K` for high-value orders) and watch their savings deduct in real-time.
4. **Proceed:** Once fully satisfied, click **Proceed to Checkout**.

### Step 3: Secure Shipping & Account Details
1. **Contact Details:** Clients input their Email and Phone Number. If they already have an account, they can click **Sign In** to automatically load their saved addresses.
2. **Choose Delivery Method:**
   * **Ship to Address:** Select the destination state (Lagos, Abuja, Rivers, etc.) and complete the street address. The system automatically computes the standard secure delivery fee and appends it to the Grand Total.
   * **Store Pickup:** Choose **Store Pickup** to collect the items directly from the Lekki boutique at no cost.
3. **Review Grand Total:** Verify the final invoice summary (items, shipping fee, applied discounts, and grand total in NGN).

### Step 4: Secure Payment Gateway (Paystack)
1. **Initialize Gateway:** Click **Complete Purchase**. A high-end secure loader will establish a connection to the Paystack checkout engine.
2. **Multiple Secure Payment Methods:** Inside the secure gateway popup, clients can select their preferred medium:
   * **Card:** Input Visa, Mastercard, or Verve details. Transactions are fully secured with OTP (One-Time-Password) and 3D Secure verification.
   * **Bank Transfer:** Generate a temporary bank account number to make an instant transfer from any mobile banking app.
   * **USSD:** Dial a quick banking code on their mobile device.
3. **Instant Order Processing:** Once authorized, Paystack validates the payment. The client is immediately returned to a gorgeous **Order Confirmed** screen, and their pieces are locked in (decreasing store stock automatically).

### Step 5: Official Receipt & Post-Purchase Curation
1. **Download Official Receipt:** On the confirmation page, clients can click the **Download Official Receipt** button. The app generates and exports a beautifully styled, high-end PDF receipt containing invoice details, payment status, and order specifications.
2. **Automated Order Confirmation Email:** A beautifully designed email receipt is sent directly to the client's inbox confirming their order, reference, and collection details.
3. **Experience Review:** Clients can submit a structured star rating (1–5) and note down shopping feedback to help curate future experiences.
4. **Account Creation:** Non-registered users can complete their signup from the confirmation page with one click using their pre-filled email. This creates an account to let them track order status (`Pending` &rarr; `Shipped` &rarr; `Delivered`) inside their customer dashboard.

---

## SECTION 3: The Zahrah Luxury Executive Admin Panel

The Admin Panel (`/admin`) is a premium, secure command center designed for store managers, inventory curators, and executive support staff. It features a complete **Role-Based Access Control (RBAC)** system and a real-time view of store status.

### 1. Secure Access & Role Permissions

Authorization is determined by Firebase Authentication verified emails matching a hardcoded security config. Changing user database profiles does **not** bypass this check, ensuring total security.

* **Super Admin (`super_admin`):** Full, unrestricted access to all aspects of the store—financial analytics, inventory edits, page layouts, staff logs, and global settings.
* **Manager (`manager`):** Full control over products, orders, customers, and waitlists. Restricted from modifying core security settings or structural homepage layouts.
* **Support (`support`):** Access to view and process orders (updating shipping statuses) and review waitlists. Cannot edit catalog prices, delete data, or read financial analytics.
* **Viewer (`viewer`):** Complete read-only view of products, orders, and customer lists. Restricted from making any database writes, deletes, or exporting data.

### 2. Secure Audit Trail (Activity Logs)
Every administrative action is recorded in `/adminLogs` Firestore collection with details including: Admin Email address, Timestamp, Action performed, and Before & After State (JSON diff of exact values modified).

### 3. Detailed Tab-by-Tab Operations
* **📊 Dashboard:** Real-time visual charts displaying gross revenue, total completed sales, waitlist size, and average order value. Compares growth rates month-over-month.
* **👗 Products & Inventory:** Curate product collections, stock levels (including multi-variant stock limits), visibility status, compositions, and pricing.
* **📦 Orders & Shipping:** unified tracking of all guest and registered checkouts. Admins can transition order statuses sequentially: `Pending` &rarr; `Shipped` &rarr; `Delivered`.
* **👥 Customers:** View list of registered store clients, check their purchase history, and configure administrative staff roles.
* **🔔 Waitlist (Restock Requests):** Monitors high-demand requests from clients for out-of-stock items, including customer contact channel (Email or WhatsApp).
* **🛒 Abandoned Checkouts:** Automatically records cart sessions that have remained inactive for over **30 minutes**, helping run customer outreach or retargeting.
* **🎨 Homepage Layout Curation (Visual Builder):** Organize products, curate visual grids, and build vibrant lookbooks with clickable hotspots containing active product links.
* **🏷️ Pricing & Promos:** Create and configure discount codes (percentage, fixed value, or shipping waivers).
* **📜 Page Content Manager:** Edit static guidelines like Refund Policy, Shipping Guidelines, and Terms of Service.
* **🔐 Activity Logs:** Complete logs feed of all admin database actions to ensure pristine record integrity.

---

## SECTION 4: Technical & Under-the-Hood Site Functions

The boutique uses a high-performance, resilient architecture designed to provide an ultra-speed shopping experience under high traffic, while securing client transactions.

### 1. Speed & Cache: React client + IndexedDB Offline Caching
* **Real-time Synchronization:** Built on React and compiled using Vite, database reads are bound to Firestore observers. If a curator updates a price, color image, or stock number in the Admin panel, it changes instantly for all clients browsing the boutique.
* **Offline Caching:** The database uses **IndexedDB Offline Persistence**. The first time a client visits the site, their browser caches the store catalog. Subsequent loads are near-instantaneous. If a client's internet connection drops during checkout, the app stores their cart locally and syncs with store servers as soon as connection is recovered.

### 2. Secure Checkout Transactions (Anti-Race-Condition Engine)
To prevent overselling during flash clothing drops:
* **Firestore Transaction Blocks:** Checkouts execute concurrent Firestore transaction blocks.
* **Read-Before-Write Verification:** The database verifies that live stock is greater than or equal to the cart request before updating.
* **Atomic Deduction:** Stock levels are decremented and the order document is recorded in a single, atomic operation. If the stock falls below the cart count during payment, the transaction cancels safely to prevent double-selling.

### 3. Secure Gateway Integration (Paystack)
* **Public Key Exchange:** Checkouts utilize `VITE_PAYSTACK_PUBLIC_KEY` client-side, keeping server secret keys secure.
* **Reference Anchoring:** Every order is bound to a unique Paystack reference token, allowing instant verification on the merchant dashboard and preventing fake payment creation in database documents.

### 4. Automatic Customer Retention
* **Abandoned Carts:** Cart state changes register debounced draft sessions to `/abandonedCheckouts`. Successful checkouts instantly delete these drafts to keep data clean.
* **Waitlists:** Clicking "Notify Me" stores contact profiles under the `/restockRequests` collection, ready for automatic or manual notification when inventory updates.
