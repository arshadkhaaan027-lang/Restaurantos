# RestaurantOS Customer QR Ordering Interface: Feature Gap Audit Report

**Date:** November 4, 2026  
**Application:** RestaurantOS Customer Interface  
**Audit Target:** Production-grade Restaurant QR Ordering, Table Management, & Loyalty Experience  
**Environment:** React 19, Vite 8, Tailwind CSS v4, TypeScript  

---

## 1. Executive Summary

An in-depth technical and functional audit was conducted on the current **RestaurantOS** customer-facing mobile web interface. 

The application currently serves as an **editorial-grade frontend visual & interaction preview**. Core layout mechanics (responsive mobile viewport, pinned header, category tabs, inline quantity steppers, item details sheet, floating luxury order strip, and simulated loyalty stamp card) are verified and working smoothly in client memory.

However, to transition from a design prototype to an operational restaurant QR system, the platform requires:
1. **Dynamic URL/QR session parsing** to bind customers to real tables and locations.
2. **Backend persistence (Firebase Firestore)** for live order dispatch to kitchen display systems (KDS).
3. **Data security hardening** to eliminate client-side price/stamp forgery.
4. **CRM & customer lifecycle features** (WhatsApp phone opt-in, promo coupons, post-meal Google reviews, and real-time order tracking).

---

## 2. 16-Point Detailed Feature Gap Audit

| # | Functional Domain | Classification | Current State in Codebase | Technical Deficiencies & Requirements |
|---|---|---|---|---|
| **1** | **Customer Onboarding & QR Entry** | **UI exists but functionality is incomplete** | `OnboardingScreen.tsx` provides an editorial splash with a "Get Started" / "Skip" button. | No URL query parameter parsing (`?table=14&branch=central&token=xyz`). The table is hardcoded to `'Table 14'` in `App.tsx:33`. No dining session initialization, geofencing, or QR token validation. |
| **2** | **Restaurant Branding & Cafe Info** | **UI exists but functionality is incomplete** | "RestaurantOS" and "Fresh Meals. Better Moments." are hardcoded across `HomeScreen.tsx` and headers. | No multi-tenant support (`cafeId`/`branchId`). Operating hours, live open/closed status, service availability, and restaurant address are non-configurable. |
| **3** | **Menu Categories, Search & Filters** | **Fully implemented (Client-side) / Requires Backend for Live Menus** | `CATEGORIES` and `DISHES` in `src/data/menuData.ts` provide instant category switching and text search in `HomeScreen.tsx:55-62`. | Lacks dietary filters (Jain, Halal, Veg, Vegan, Gluten-Free), allergen tags, and real-time out-of-stock (86'd) menu toggling. |
| **4** | **Food Product Details** | **Fully implemented and verified (UI Preview)** | `ProductDetailScreen.tsx` provides high-res food photography, calories, prep time, star ratings, and culinary features. | Content is statically sourced from `menuData.ts` rather than dynamic database documents. |
| **5** | **Product Customization & Add-ons** | **UI exists but functionality is incomplete** | Basic steak doneness (`Rare`, `Medium-Rare`) and sauce selection buttons in `ProductDetailScreen.tsx:39-44`. | No paid modifier pricing (e.g., extra cheese +₹80, double patty +₹150), no required vs. optional modifier groups, and no inventory limits. |
| **6** | **Cart Management** | **Fully implemented and verified (Client-side)** | `App.tsx:37-89` manages `cartItems` state with live quantity modification, item removal, and subtotal calculation. Floating bar dynamically updates. | Cart state is stored strictly in transient React memory (`useState`). Page reload or browser closure wipes the cart. |
| **7** | **Checkout & Bill Calculation** | **UI exists but functionality is incomplete** | Subtotal, 8% table sales tax, and 10% kitchen service are computed in `CartDrawer.tsx:44-50`. | Taxes and gratuity are hardcoded. No payment gateway integration (Razorpay / UPI / Cash at Counter), tip selector, or bill-split capability. |
| **8** | **Table Identification** | **UI exists but functionality is incomplete** | Static badge (`Table 14 · QR`) is rendered across the pinned top header and drawer. | No dynamic table resolution via QR code URL tokens; cannot prevent customers from placing orders from outside the premises. |
| **9** | **Order Placement & Firestore Storage** | **Requires Firebase / Backend integration** | Tapping "Confirm Order" sets `orderSent = true` in local component state (`CartDrawer.tsx:52`), showing mock Ticket #104. | **Zero database operations.** No order documents are written to Firestore; kitchen display systems (KDS) and POS terminals receive no notification. |
| **10** | **Order Status Tracking** | **UI exists but functionality is incomplete & Requires Backend** | Static receipt summary (`Ticket #104 · Prep ~18 min`) in `CartDrawer.tsx:116-120`. | No real-time status progression (Received ➔ Preparing ➔ Ready ➔ Served ➔ Paid) and no Firestore live listener (`onSnapshot`). |
| **11** | **Loyalty Stamps & Points** | **UI exists but functionality is incomplete** | `RewardsScreen.tsx` provides a 10-stamp loyalty card and reward claiming mechanism. | Completely insecure client-side state. The user can artificially fill all stamps via `handleSimulateStamp`. Stamps are not validated against paid orders. |
| **12** | **Customer Profiles & Order History** | **Not implemented** | Navigation supports Home, Rewards, and Cart. Profile tab was removed. | No customer account, no past order history, and no saved billing details. |
| **13** | **Coupons & Promotional Offers** | **Not implemented** | No promo code input or discount rules engine. | Cannot apply percentage discounts, minimum bill thresholds, or promo campaigns. |
| **14** | **Feedback & Google Reviews** | **Not implemented** | Dishes show static review counts. | No post-dining rating modal, food feedback prompt, or Google Review redirect flow upon order fulfillment. |
| **15** | **Reorder & Recommendations** | **UI exists but functionality is incomplete** | Static 3-dish recommendation rail ("You May Also Like") in `ProductDetailScreen.tsx:50`. "Order More Items" resets cart. | No algorithmic pairing recommendations (e.g., drinks with steaks) or "Reorder Previous Round" capability. |
| **16** | **WhatsApp Membership & Offers Opt-in** | **Not implemented** | No phone input or opt-in component exists. | No mechanism to capture customer WhatsApp phone numbers for automated e-bills, loyalty updates, or promotional broadcasts. |

---

## 3. Security, Multi-Tenancy & Integrity Analysis

### A. Missing Multi-Tenant Isolation (`cafeId` / `tenantId`)
- All menu data, categories, and tax rates are statically imported from local files (`src/data/menuData.ts`).
- There is no tenant context; multiple branches or separate restaurant locations cannot run on the same platform without code duplication.

### B. Client-Side Price & Stamp Tampering
- Orders and totals are calculated entirely on the client without backend validation. If a client-side API call were wired directly, malicious actors could alter prices in payload requests.
- The loyalty reward system has no server signature; stamps must be issued exclusively by authenticated backend webhooks triggered by settled table bills.

### C. Order Duplication & Network Resiliency
- "Confirm Order" currently lacks an **idempotency key** (`orderId` generated on the client and enforced unique in the database). A double-click or connection retry would produce duplicate tickets.
- If a guest accidentally refreshes the browser, active orders and receipts vanish.

---

## 4. Categorized Feature Inventory

### A. Existing Working Features (Verified Client Functionality)
- Warm off-white (`#faf7f2`) and deep wine-red (`#82181a`) editorial responsive mobile interface.
- Pinned non-scrolling top header with live brand and table badge.
- Category filtering tabs (All, Steaks, Pasta, Woodfire, Starters, Drinks, Desserts) and instant text search.
- Product cards with direct `+` / `[-] Qty [+]` quantity adjustments without triggering modal navigation.
- High-fidelity product detail view with doneness and sauce selectors.
- Floating luxury order strip showing live item count, table tag, and uniform INR (`₹`) pricing.
- Interactive cart drawer with itemized line totals, 8% tax, 10% service calculation, and kitchen notes input.
- Interactive loyalty card visualization with milestone unlock states.

### B. Missing Features (To Be Implemented)
- Dynamic QR code URL parameter parser (`?table=X&cafe=Y&auth=token`).
- WhatsApp phone number capture modal for digital bill delivery and loyalty registration.
- Promo coupon code validation engine.
- Post-meal feedback form and direct Google Reviews link.
- Customer profile with past dining history.
- Dietary tags (Veg / Non-Veg / Vegan) and out-of-stock badges.

### C. Backend & Firebase Requirements
1. **Firestore Collections:**
   - `cafes/{cafeId}/menu`: Live menu items, modifier groups, and inventory status.
   - `cafes/{cafeId}/tables/{tableId}`: Live table sessions, active cart, and occupancy.
   - `cafes/{cafeId}/orders`: Kitchen ticket queue, preparation status, and timestamps.
   - `customers/{phoneOrUid}/rewards`: Authenticated loyalty stamps linked to verified paid tickets.
2. **Security Rules:** Enforce read-only access for menus and validate that submitted order amounts match current database prices.
3. **Real-time Status Sync:** `onSnapshot` listener on `/orders/{orderId}` to power live kitchen status updates.

---

## 5. Recommended Implementation Roadmap

1. **Phase 1: Dynamic Session & QR Parameter Parser**
   - Automatically detect table number and cafe ID from the QR URL query string and persist in `localStorage`.
2. **Phase 2: WhatsApp Number Capture & Membership Opt-In**
   - Add a phone number input during order confirmation or rewards access to link bills and loyalty stamps.
3. **Phase 3: Firestore Database Provisioning & Order Pipeline**
   - Save verified orders to Firestore with unique Order IDs, kitchen instructions, and table identifiers.
4. **Phase 4: Live Order Status Tracking Screen**
   - Replace the static ticket mockup with a live tracking view (Received ➔ Preparing ➔ Ready ➔ Served).
5. **Phase 5: Dynamic Menu & Out-of-Stock Management**
   - Connect `HomeScreen.tsx` to live Firestore menu snapshots.
6. **Phase 6: Coupon Code & Promo Engine**
   - Add coupon input with server-verified discount calculations.
7. **Phase 7: Google Reviews & Post-Dining Feedback**
   - Prompt customers for ratings and redirect positive feedback to the restaurant's Google Maps listing.

---

## 6. Files Requiring Modification in Next Phase

- `/src/types/restaurant.ts`: Add schemas for `Order`, `OrderStatus`, `CafeConfig`, `Coupon`, and `CustomerProfile`.
- `/src/App.tsx`: Parse URL query parameters, manage session persistence, and handle routing.
- `/src/components/HomeScreen.tsx`: Connect to live Firestore menu snapshot and display stock tags.
- `/src/components/CartDrawer.tsx`: Integrate coupon input, WhatsApp number field, and Firestore order creation.
- `/src/components/OrderStatusScreen.tsx`: New component for real-time order tracking.
- `/src/components/WhatsAppMembershipModal.tsx`: New component for phone-based membership opt-in.
- `/src/firebase/config.ts`: Firebase SDK initialization.
- `/firestore.rules`: Security rules protecting orders, menus, and loyalty points.
