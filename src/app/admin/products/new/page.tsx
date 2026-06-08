import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { ProductForm } from "../ProductForm";
import { connectToDatabase as dbConnect } from "@/lib/db";
import Category from "@/lib/models/Category";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await dbConnect();
  const categoriesRaw = await Category.find({ isActive: true }).select("name _id").lean();
  
  const categories = categoriesRaw.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  return (
    <DashboardPage eyebrow="Catalog" title="New Product">
      <div className="py-6">
        <ProductForm categories={categories} />
      </div>
    </DashboardPage>
  );
}
