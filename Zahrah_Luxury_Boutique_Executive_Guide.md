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
* **📦 Orders & Shipping:** Unified tracking of all guest and registered checkouts. Admins can transition order statuses sequentially: `Pending` &rarr; `Shipped` &rarr; `Delivered`.
* **👥 Customers:** View list of registered store clients and check their purchase history.
* **🤖 Pricing AI:** Acts as an AI-driven price optimization tool. It analyzes your store's data and provides recommendations for price increases (scarcity pricing) or discounts (liquidation) based on demand and inventory velocity.
* **🛒 Abandoned Carts:** Tracks shopping sessions where a customer added items to their cart but left without completing the payment (after 30+ minutes). You can view the cart details and manually trigger beautifully formatted **Recovery Emails**.
* **🔔 Restock Requests:**
  * **Waitlist Intelligence:** Tracks customers who have requested notifications for out-of-stock items. When an item is restocked, you can notify all waiting customers at once via email or WhatsApp.
  * **Client Feedback:** Allows you to view and moderate (delete) product reviews left by customers.
* **🏷️ Pricing & Promos:** Create and configure discount codes (percentage, fixed value, or shipping waivers).
* **📜 Pages & Footer:** Acts as a mini Content Management System (CMS) for your text-heavy pages. Create, edit, and delete standard pages (Shipping Policy, Terms of Service, FAQs) and organize them into footer categories.
* **🔐 Activity Logs:** Provides a security and audit trail for your executive panel. It tracks every major action taken in the admin dashboard (e.g., who changed a price, who deleted a product), recording the timestamp, action summary, and staff email.
* **🛡️ Staff Access:** Manage who has access to the executive admin panel. Invite new team members via email, assign them specific roles (Manager, Support, Viewer), and revoke access.
* **⚙️ System Controls:**
  * **Return to Boutique:** A quick shortcut to leave the admin panel and view the live customer-facing storefront.
  * **Repair Database:** A developer/testing tool used to reset or populate the store with default placeholder products.
  * **Wipe Database:** *(Only visible to Super Admins)* A dangerous action that completely erases the store's database.
  * **End Session:** Logs you out of the admin panel securely.

### 4. Deep Dive: Theme & Layout Operations

Based on the **Theme & Layout** section, here is an explanation of what each of these configuration cards does. They allow you to dynamically customize the appearance and content of your live storefront's Home Page without touching any code:

#### 1. Home Page Configuration (Catalog Toggle)
The main toggle at the top (currently showing "CATALOG HIDDEN") allows you to completely hide or show the main product grid on the home page. This is useful if you want to temporarily turn your landing page into a purely promotional or "lookbook" style page without showing standard shopping grids.

#### 2. Hero Carousel
This controls the large, full-width image slider at the very top of your website. 
*   **Edit Slides:** Allows you to upload new banner images, reorder them, or delete old ones.
*   **Visibility Toggle (Eye Icon):** Lets you completely hide the top hero section.

#### 3. Features
*(As explained earlier)* This toggles the visibility of the "Signature Features" section (e.g., Bespoke Tailoring, Global Concierge, Authentic Luxury). The slash through the eye means it is currently hidden from your customers.

#### 4. Boutique Banner
This allows you to add a wide promotional banner midway down your home page.
*   You can set a custom **Banner Title**.
*   You can upload a background image for the banner.
*   You can toggle it on or off for special promotions or archive sales.

#### 5. Lifestyle Showcase
This section creates a visual mood board on your home page.
*   **Edit Muses:** Allows you to upload two side-by-side lifestyle or editorial images (usually representing different categories like "Accessories" and "Streetwear").
*   It breaks up the product grids with high-quality brand imagery.

#### 6. Manor Collection
This is a dedicated, hand-curated product section on the home page.
*   **Select Products:** Instead of showing products automatically (like "New Arrivals"), this lets you manually pick exactly which specific products from your inventory should be featured in this exclusive block.
*   Currently, it shows you have **5 products selected** for this collection.

#### 7. Styling Ideas
This is a "Shop the Look" feature to inspire customers and encourage multi-item purchases.
*   **Manage Looks:** You can create different outfits or ensembles. For each "Look", you upload an editorial photo of a model wearing the outfit, give it a title and total price, and then link the individual pieces from your catalog so customers can easily buy the whole outfit.

---

## SECTION 5: Technical & Under-the-Hood Site Functions

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

---

## SECTION 6: Recent System Upgrades (May 2026)

The boutique's digital infrastructure has recently been updated to enhance both the customer experience and administrative control:

### 1. Luxury PDF Reporting
The Admin dashboard's PDF exports (Executive Order Manifests, Waitlist Intelligence Reports, and Customer Invoices) have been significantly upgraded. They now feature elegant typography, a premium off-white background, structured table alignments, and a subtle watermark of the boutique's gold logo on every page.

### 2. Mega-Menu Navigation
The storefront's primary navigation has been completely overhauled. Hovering over main collection categories (e.g., "Women", "Men") now triggers a smooth, animated "mega-menu" that reveals sub-categories in a beautifully structured, split-column layout, replacing the old simple dropdowns.

### 3. Database "Soft Reset" & Backups
The dangerous "Wipe Database" system control has been refined into a **Soft Reset**. Instead of permanently deleting everything, it now only clears transactional data (orders, logs, abandoned carts) to prepare for a fresh season. Crucially, it automatically creates a secure backup of all wiped data, which can be instantly restored via a new `Restore Database` button.

### 4. Homepage Premium Refinements
The live storefront homepage has received subtle premium visual adjustments:
* **Refined Copywriting:** Language has been updated to feel both exclusive and customer-friendly (e.g., "Curated Daily" to "Handpicked Daily", "Bespoke Tailoring" to "Custom Fit").
* **Layout Scaling:** Product cards in the horizontal scrolling collections have been slightly widened to better showcase high-resolution product imagery on larger screens.

---

## SECTION 7: Advanced Telemetry & Operations Upgrades (October 2026)

### 1. Google Analytics 4 (GA4) Dual-Dispatch & Live Intelligence Hub
* **Unified Event Dispatcher:** Dispatches full e-commerce events (`page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`) simultaneously to `window.gtag` (Measurement ID: `G-N2CS95WEY2`) and Firebase Analytics SDK.
* **Executive 1-Line Control Strip:** Replaced heavy developer telemetry with a clean, luxury 1-line control bar offering direct 1-click links to Google Analytics *Real-Time Visitors ↗*, *Traffic Acquisition ↗*, and *E-Commerce Monetization ↗*.
* **Dynamic Time-Window Filtering:** Allows store executives to toggle between 7 Days, 14 Days, and 30 Days of sales, revenue trends, and gross profit modeling in real time.

### 2. Dynamic Size-Based Price Overrides
* **Per-Variant Pricing:** Under the Sizing toggle in the product drawer, merchants can define custom prices per individual size (e.g., standard sizes at ₦50,000, while XXL/plus sizes are custom-priced at ₦55,000).
* **Storefront Price Animation:** Size buttons on product detail pages dynamically transition and update the displayed price with real-time badges.
* **Serverless Price Integrity:** Bag consolidation and Firestore checkout stock validation automatically compute totals against size-specific prices, completely eliminating price mismatch payment errors.

### 3. Intelligent Searchable Product Selector in Layout
* **Instant Filter & Search:** Replaced static product grids in the Theme & Layout tab with an interactive product picker featuring real-time title/brand search, category pills (*All, Clothing, Shoes, Bags*), and "Selected (X)" filters.
* **Full-Width Styling Ideas:** "Styling Ideas" (Lookbook) and "Curated Categories" are housed in dedicated full-width cards with clickable expand/collapse headers for seamless outfit curation.

### 4. Automated XML Sitemap & Robots.txt SEO Engine
* **Dynamic Live Catalog Ingestion:** Build pipeline automatically reads all visible Firestore products and pages, generating `sitemap.xml` with 280+ indexed URLs and Google Image Search schemas.
* **Crawler Protection (`robots.txt`):** Permits search engines to crawl public catalog and lookbook pages while strictly disallowing private administrative and checkout routes (`/admin`, `/checkout`, `/orders`).

