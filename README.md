# Raja Boot House — Handcrafted Leather Boots Since 1972

A modern, high-performance, full-stack boutique e-commerce application for **Raja Boot House**, migrated to **Next.js App Router** with a modular components architecture. 

Designed with premium, rich design aesthetics tailormade for luxury leather craftsmanship—featuring a curated color palette (Oxblood, Cognac, Brass, Cream, and Charcoal), custom typography, micro-interactions, smooth layout animations, and complete decoupling from obsolete builders/frameworks.

---

## 🚀 Key Features

* **Complete Next.js Migration**: Fully migrated from TanStack Start to Next.js App Router.
* **Modular Codebase**: Split monolithic pages into focused, reusable components.
* **Premium Brand Aesthetics**: Custom oklch theme color definitions, smooth slide/fade animations (`framer-motion`), and elegant typeface setups.
* **Complete Decoupling**: Fully removed Lovable telemetry, TanStack Router dependencies, and Vite configurations.
* **Interactive Shopping Flow**: Fully operational cart state management (stored client-side in `localStorage`) and multi-step wizard checkout system.
* **Dedicated User Panels**:
  * **Customer Portal**: Account overview, orders tracking, address book management, profile configuration, and wishlist.
  * **Admin Console**: Analytics dashboard, catalog overview, order fulfillment logs, customers directory, and vendor registrations.
  * **Vendor Workshop**: Payout details, product listings, workshop-specific orders, and settings.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS integration
* **State Management**: [React Context](https://react.dev/) + [React Query](https://tanstack.com/query/latest)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```
raja-boot-house/
├── src/
│   ├── app/                      # Next.js App Router Directories
│   │   ├── (public)/             # E-commerce Shop & Customer Routes
│   │   │   ├── shop/             # Catalog filters & Dynamic details
│   │   │   ├── cart/             # Shopping Cart
│   │   │   ├── checkout/         # Checkout flow wizard
│   │   │   └── account/          # Customer account sidebar pages
│   │   ├── admin/                # Admin Panel console routes
│   │   ├── vendor/               # Vendor Portal routes
│   │   ├── layout.tsx            # HTML Root wrapper & Google Font imports
│   │   └── globals.css           # Tailwind v4 configuration & theme tokens
│   ├── components/
│   │   ├── public/               # Public e-commerce interactive elements
│   │   ├── dashboard/            # Dashboard layouts, cards & charts
│   │   └── shared/               # Reusable input & layout components
│   ├── data/                     # Mock dataset (products, orders, reviews, etc.)
│   └── lib/                      # Cart store state logic and formats
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
