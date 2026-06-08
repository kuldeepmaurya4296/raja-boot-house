import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { ProductForm } from "../../ProductForm";
import { connectToDatabase as dbConnect } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  const [productRaw, categoriesRaw] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ isActive: true }).select("name _id").lean()
  ]);
  
  if (!productRaw) {
    notFound();
  }

  const categories = categoriesRaw.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  // Clean up MongoDB object before passing to client component
  const initialData = {
    name: productRaw.name,
    slug: productRaw.slug,
    description: productRaw.description,
    brand: productRaw.brand,
    category: productRaw.category?.toString() || "",
    gender: productRaw.gender,
    occasion: productRaw.occasion || [],
    images: productRaw.images?.map((img: any) => ({ url: img.url, public_id: img.public_id })) || [],
    variants: productRaw.variants?.map((v: any) => ({
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      sku: v.sku,
    })) || [],
    price: productRaw.price,
    salePrice: productRaw.salePrice,
    isFeatured: productRaw.isFeatured,
    isNewArrival: productRaw.isNewArrival,
    isActive: productRaw.isActive,
    tags: productRaw.tags || [],
  };

  return (
    <DashboardPage eyebrow="Catalog" title="Edit Product">
      <div className="py-6">
        <ProductForm initialData={initialData} id={id} categories={categories} />
      </div>
    </DashboardPage>
  );
}
