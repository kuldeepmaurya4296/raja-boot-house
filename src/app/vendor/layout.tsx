"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Package, ShoppingCart, Wallet, Settings } from "lucide-react";

const items = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/vendor/products", label: "My Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendor/payouts", label: "Payouts", icon: Wallet },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout items={items} title="Vendor Portal" accent="accent">
      {children}
    </DashboardLayout>
  );
}
