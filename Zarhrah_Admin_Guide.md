# Zarhrah Luxury Web App - Administrator Guide

Welcome to the Zarhrah Luxury Administrator Guide. This document provides a comprehensive overview of the executive panel, detailing how to manage the boutique, fulfill orders, and configure the main landing page to reflect your brand's unique style.

## Table of Contents
1. [Introduction to the Executive Panel](#1-introduction-to-the-executive-panel)
2. [Dashboard & Analytics](#2-dashboard--analytics)
3. [Managing Artifacts (Products)](#3-managing-artifacts-products)
4. [Order Fulfillment](#4-order-fulfillment)
5. [Home Layout Configuration](#5-home-layout-configuration)
6. [Other Administrative Features](#6-other-administrative-features)

---

## 1. Introduction to the Executive Panel

The Zarhrah Executive Panel is the nerve center of your luxury boutique. Accessible securely via `/admin`, it allows authorized administrators to control every aspect of the e-commerce experience.

**Key Concepts:**
*   **Real-time Synchronization:** Changes made in the Admin panel (e.g., product updates, layout changes) are instantly reflected on the main customer-facing website without requiring page reloads or deployments.
*   **Role-Based Access:** Access is restricted to authorized email addresses. The system supports full access and view-only roles for different sections.
*   **Security:** The panel features automatic session timeouts for inactivity to ensure unauthorized access is prevented.

---

## 2. Dashboard & Analytics

### The Dashboard Tab
The Dashboard provides an immediate overview of your boutique's performance.
*   **Key Metrics:** View essential statistics such as Total Revenue, Active Artifacts, Total Registered Customers, and Total Completed Orders.
*   **Recent Activity:** A quick glance at the latest transactions and recently added products.
*   **Quick Actions:** Direct links to add new products or manage specific sections.

### The Analytics Tab
For a deeper dive, the Analytics section provides visual insights.
*   **Revenue Trends:** Charts displaying revenue over time.
*   **Top Products:** Identifies best-selling items.
*   **Visitor Insights:** Data on viewed products and customer interactions to help guide inventory decisions.

---

## 3. Managing Artifacts (Products)

The **Products** tab is where you manage your catalog. The term "Artifacts" emphasizes the luxury nature of your items.

### Creating and Editing Products
*   **Basic Details:** Enter the designation (name), price, cost price, and base stock level.
*   **Brands Strategy:** Group products under specific signature collections (e.g., Zara, Ashluxe) or create custom brand tags. This directly affects the `Brand Collection` filter on the main page.
*   **Categories:** Assign products to categories (e.g., Clothing, Accessories). The main page's navigation and `Category` filter rely on these assignments.
*   **Variants (Sizing & Colors):** Enable multiple sizes (S, M, L) and specific color names with hex codes. Customers select these options on the Product Detail page before adding to their cart.
*   **Visual Assets:** Upload high-quality images directly or via URLs. The first image serves as the main display picture throughout the store.

### Inventory Management
*   **Stock Levels:** Update stock numbers. The system automatically calculates **Inventory Velocity** based on sales history.
*   **Stockout Risk:** The panel provides visual indicators (e.g., `Sold Out`, `< 7 Days Left`, `> 2 Weeks`) to warn you before popular items run out of stock. Products marked as "Out of Stock" are visually flagged on the main page.
*   **Visibility Toggle:** You can temporarily hide a product without deleting it. Hidden products will immediately disappear from the main catalog.

---

## 4. Order Fulfillment

The **Orders** tab is designed for processing customer purchases efficiently.

### Order Processing Workflow
1.  **View Orders:** Filter orders by Week, Month, Year, or search by Order ID/Customer Name.
2.  **Order Details:** See the purchased items (Artifacts), customer contact details, and total value.
3.  **Update Status:** Change the fulfillment status:
    *   **Processing (Pending):** Order received, preparing for dispatch.
    *   **Dispatched (Shipped):** Order handed over to logistics.
    *   **Delivered:** Order successfully reached the client.
    *(Note: Customers view their specific order statuses via their account or order tracking page).*

### Exporting Data
*   **CSV Export:** Download order data in a spreadsheet format for accounting purposes.
*   **PDF Report:** Generate a professional PDF summary of selected orders.

---

## 5. Home Layout Configuration

The **Home Layout** tab is a powerful tool that allows you to act as the creative director of the main website. You can toggle sections on/off and select specific products to feature.

### Controlling Main Page Sections
Changes here instantly alter the `Home` page experience for visitors.

1.  **Catalog Visibility Toggle:** A master switch to completely hide or show the main product catalog grid at the bottom of the home page.
2.  **Hero Banner:** Toggle visibility and update the main introductory image URL.
3.  **Features (Signature Features):** Toggle the display of the three core brand pillars (Bespoke Tailoring, Global Concierge, Authentic Luxury).
4.  **Boutique Banner:** Update the mid-page banner image and its title text.
5.  **Manor Collection:**
    *   **Function:** Highlight a specific set of premium items.
    *   **Action:** Click 'Select Products' to choose exactly which items appear in the horizontal scrolling collection titled "Manor Collection" on the home page.
6.  **Styling Ideas (The Lookbook):**
    *   **Function:** Create curated outfits ("Looks").
    *   **Action:** Upload an image of an outfit, set a total price, and then associate specific inventory products that make up that look. Customers can view the look and add individual constituent items to their cart.
7.  **Bundles & Deals:** Similar to the Manor Collection, choose specific products to feature in a dedicated promotional scroller.
8.  **Curated Categories (Tabbed Products):**
    *   **Function:** Manage the multi-tabbed product showcase (e.g., T-Shirts, Pants, Jackets).
    *   **Action:** Edit tab names, hide specific tabs, and select which products appear under each tab. If no specific products are selected, the system may fall back to default tagging logic.
9.  **Lifestyle Showcase:** Update the two aesthetic "lifestyle" images typically shown side-by-side to emphasize brand mood.
10. **Deploy Custom Sections:** Create entirely new Carousel sections on the fly by providing a title and selecting products.

---

## 6. Other Administrative Features

*   **Customers Tab:** View a roster of registered clients, their total spend, and contact information.
*   **Waitlist (Requests Tab):** If items go out of stock, customers can request restocks. This tab aggregates those requests, allowing you to gauge demand for out-of-stock items.
*   **Pricing AI:** A streamlined interface to adjust prices quickly across the entire catalog or specific segments without opening individual product edit forms.
*   **Activity Log:** An audit trail detailing which administrator performed critical actions (like deleting products or wiping the database), ensuring accountability.
*   **Database Tools (Sidebar):**
    *   *Repair Database:* Resets standard layout settings and seeds initial demo data.
    *   *Wipe Database:* **CRITICAL ACTION.** Permanently deletes all products, orders, and layout settings, leaving only admin access. Use with extreme caution.
