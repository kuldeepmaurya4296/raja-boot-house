import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/modules/admin/dashboard/components/DashboardLayout";
const items = [
  { to: "/admin", label: "Overview", icon: "LayoutDashboard", exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { to: "/admin/orders", label: "Orders", icon: "ShoppingCart" },
  { to: "/admin/products", label: "Products", icon: "Package" },
  { to: "/admin/categories", label: "Categories", icon: "Tag" },
  { to: "/admin/coupons", label: "Coupons", icon: "Ticket" },
  { to: "/admin/customers", label: "Customers", icon: "Users" },
  { to: "/admin/vendors", label: "Vendors", icon: "Store" },
  { to: "/admin/cms", label: "Website CMS", icon: "Globe" },
  { to: "/admin/settings", label: "Settings", icon: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <DashboardLayout items={items} title="Admin Console">
      {children}
    </DashboardLayout>
  );
}
