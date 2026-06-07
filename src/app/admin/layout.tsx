"use client";

import { DashboardLayout } from "@/modules/admin/dashboard/components/DashboardLayout";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Store, Settings } from "lucide-react";

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/vendors", label: "Vendors", icon: Store },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout items={items} title="Admin Console">
      {children}
    </DashboardLayout>
  );
}
