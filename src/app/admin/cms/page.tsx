import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { connectToDatabase } from "@/lib/db";
import Banner from "@/lib/models/Banner";
import Settings from "@/lib/models/Settings";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { CmsClient } from "./CmsClient";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  await connectToDatabase();
  
  const [bannersRaw, settingsRaw, categoriesRaw] = await Promise.all([
    Banner.find({}).sort({ order: 1 }).lean(),
    Settings.find({}).lean(),
    Category.find({}).sort({ name: 1 }).lean()
  ]);

  const banners = bannersRaw.map((b: any) => ({
    id: b._id.toString(),
    title: b.title || "",
    subtitle: b.subtitle || "",
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl || "",
    order: b.order || 0,
    isActive: b.isActive,
  }));

  const settings = settingsRaw.map((s: any) => ({
    id: s._id.toString(),
    key: s.key,
    value: s.value,
  }));

  const categories = await Promise.all(categoriesRaw.map(async (c: any) => {
    const count = await Product.countDocuments({ category: c._id });
    return {
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      isActive: c.isActive,
      imageUrl: c.imageUrl || "",
      productCount: count,
    };
  }));

  return (
    <DashboardPage eyebrow="Content" title="Website CMS">
      <CmsClient banners={banners} settings={settings} categories={categories} />
    </DashboardPage>
  );
}
