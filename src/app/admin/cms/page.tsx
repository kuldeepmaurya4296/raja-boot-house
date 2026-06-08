import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { connectToDatabase } from "@/lib/db";
import Banner from "@/lib/models/Banner";
import Settings from "@/lib/models/Settings";
import { CmsClient } from "./CmsClient";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  await connectToDatabase();
  
  const [bannersRaw, settingsRaw] = await Promise.all([
    Banner.find({}).sort({ order: 1 }).lean(),
    Settings.find({}).lean()
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

  return (
    <DashboardPage eyebrow="Content" title="Website CMS">
      <CmsClient banners={banners} settings={settings} />
    </DashboardPage>
  );
}
