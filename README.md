# Raja Boot House — Leather Boots Since 2025

A modern, high-performance, full-stack boutique e-commerce application for **Raja Boot House**, migrated to **Next.js App Router** with a modular components architecture.

Designed with premium, rich design aesthetics tailormade for luxury leather craftsmanship—featuring a curated color palette (Oxblood, Cognac, Brass, Cream, and Charcoal), custom typography, micro-interactions, smooth layout animations, and complete decoupling from obsolete builders/frameworks.

---

## 🚀 Key Features & Architectural Upgrades

- **Complete Next.js Migration**: Fully migrated from TanStack Start to Next.js App Router.
- **Modular Codebase**: Split monolithic pages into focused, reusable components.
- **Premium Brand Aesthetics**: Custom oklch theme color definitions, smooth slide/fade animations (`framer-motion`), and elegant typeface setups.
- **Decoupled Architecture**: Fully removed Lovable telemetry, TanStack Router dependencies, and Vite configurations.
- **Native INR Currency Model**: Removed legacy USD-equivalent multiplier logic (`* 84` and `/ 84`) across settings, checkout flows, and formatting utilities to establish Indian Rupees (₹) as the single source of truth.
- **Atomic Order Sequencing**: Integrated a Mongoose `Counter` tracking schema to atomically generate human-readable, collision-free sequential Order IDs (`RBH-XXXXX`) via `$inc` transactions.
- **React Server Components (RSC) & SEO**:
  - Converted the Home feed, Shop Catalog, and Product Details pages into SEO-friendly React Server Components.
  - Interactive states (selectors, filter menus, and newsletter forms) are isolated in client boundaries (`ProductClient`, `ShopClient`, `NewsletterFormClient`, `HomeAnimations`).
  - Dynamic metadata generation and standard **JSON-LD Schema structured data** markup injected directly from the server.
  - Added dynamic `sitemap.ts` and crawler indexing rules in `robots.ts`.
- **Database Query Performance**:
  - Replaced sequential daily sales loops in admin dashboard with a single MongoDB `$group` timezone-aware aggregation pipeline.
  - Optimized user identity retrieval in transaction logs using Mongoose `.populate()`.
  - Streamlined lifetime revenue metrics using a fast MongoDB `$sum` aggregation.
- **Robust DB Connection Handler**: Implemented a URL-parsed `resolveMongoSrv` custom SRV record resolver. This avoids double-question-mark query parameter corruption on modern environments, enabling robust, resilient connections to MongoDB Atlas.
- **UX Refinements**:
  - Smooth loading skeletons for the shop catalog, wishlist, and customer orders.
  - Inline, modern confirmation toggles replacing native browser-blocking `window.confirm()` popups.
  - Order cancellation actions in the customer dashboard with automated variant stock restoration in MongoDB.
  - Indian postal PIN (6-digit) and mobile (10-digit) frontend regex validation guards.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS integration
- **State Management**: [React Context](https://react.dev/) + [React Query](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Alerts & Toast**: [Sonner](https://sonner.dev/)

---

## 📂 Project Structure

```
raja-boot-house/
├── src/
├── src/app/                      # Next.js App Router Directories
│   ├── (public)/                 # E-commerce Shop & Customer Routes
│   │   ├── shop/                 # Catalog filters & Dynamic details
│   │   ├── cart/                 # Shopping Cart
│   │   ├── checkout/             # Checkout flow wizard
│   │   └── account/              # Customer account sidebar pages
│   ├── admin/                    # Admin Panel console routes
│   ├── vendor/                   # Vendor Portal routes
│   ├── layout.tsx                # HTML Root wrapper & Google Font imports
│   ├── sitemap.ts                # Dynamic sitemap generator
│   ├── robots.ts                 # Crawler search rules
│   └── globals.css               # Tailwind v4 configuration & theme tokens
├── src/components/
│   ├── public/                   # Public e-commerce interactive elements
│   ├── dashboard/                # Dashboard layouts, cards & charts
│   └── shared/                   # Reusable input & layout components
├── src/modules/
│   └── products/components/      # Extracted client components (ShopClient, ProductClient)
├── src/lib/
│   ├── models/                   # Mongoose Database Models (Counter, Product, Category, User, Order)
│   ├── cart-store.tsx            # Zustand-based Cart Store state logic
│   ├── db.ts                     # Robust connection resolver
│   └── db-utils.ts               # Normalized product mappings and connection flags
├── eslint.config.js              # Clean Next.js-friendly ESLint configuration
└── tsconfig.json                 # Standard Next.js TypeScript compilation scope
```

---

## ⚙️ Running Locally

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build the production bundle**:

   ```bash
   npm run build
   ```

4. **Start the production server**:
   ```bash
   npm run start
   ```

---

## 🌐 Deployment

The codebase is optimized for seamless deployment to **Vercel** with zero configuration required. The custom `vercel.json` ensures immediate framework detection.
