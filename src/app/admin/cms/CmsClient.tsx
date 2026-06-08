"use client";

import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { saveBanner, deleteBanner, saveSetting } from "./actions";
import { updateCategory } from "@/app/admin/actions";
import { toast } from "sonner";
import { DataTable, type Column } from "@/modules/admin/shared/components/DataTable";

export function CmsClient({ 
  banners, 
  settings, 
  categories = [] 
}: { 
  banners: any[], 
  settings: any[], 
  categories?: any[] 
}) {
  const [tab, setTab] = useState<"banners" | "categories" | "settings">("banners");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("banners")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${tab === "banners" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Banners
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${tab === "categories" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          By Silhouette (Categories)
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${tab === "settings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Pages & Settings
        </button>
      </div>

      {/* Tab Content */}
      {tab === "banners" && <BannersTab banners={banners} />}
      {tab === "categories" && <CategoriesTab categories={categories} />}
      {tab === "settings" && <SettingsTab settings={settings} />}
    </div>
  );
}

function BannersTab({ banners }: { banners: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: "", title: "", subtitle: "", imageUrl: "", linkUrl: "", order: 0, isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cols: Column<any>[] = [
    { key: "img", header: "Image", render: b => <img src={b.imageUrl} alt="banner" className="h-10 w-20 object-cover rounded" /> },
    { key: "title", header: "Title", render: b => <span className="font-semibold text-sm">{b.title || "—"}</span> },
    { key: "order", header: "Order", render: b => <span className="text-sm">{b.order}</span> },
    { key: "status", header: "Status", render: b => (
      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${b.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
        {b.isActive ? "Active" : "Inactive"}
      </span>
    )},
    { key: "actions", header: "", className: "text-right", render: b => (
      <div className="flex justify-end gap-2">
        <button onClick={() => { setFormData(b); setShowForm(true); }} className="text-muted-foreground hover:text-foreground">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={async () => {
          if (confirm("Delete this banner?")) {
            await deleteBanner(b.id);
            toast.success("Banner deleted");
          }
        }} className="text-destructive hover:opacity-80">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )}
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveBanner(formData);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Banner saved successfully");
      setShowForm(false);
    } else {
      toast.error(res.error || "Failed to save banner");
    }
  };

  if (showForm) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-4">{formData.id ? "Edit Banner" : "New Banner"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL *</label>
            <input required type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Link URL</label>
              <input type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
            <span className="text-sm font-medium">Is Active</span>
          </label>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-foreground rounded font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium disabled:opacity-50">Save Banner</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Hero Banners</h3>
        <button onClick={() => { setFormData({ id: "", title: "", subtitle: "", imageUrl: "", linkUrl: "", order: 0, isActive: true }); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium text-sm flex items-center gap-2 hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>
      <DataTable columns={cols} rows={banners} empty="No banners configured." />
    </div>
  );
}

function SettingsTab({ settings }: { settings: any[] }) {
  const getVal = (key: string) => settings.find(s => s.key === key)?.value || "";
  
  const [storeName, setStoreName] = useState(getVal("storeName") || "Raja Boot House");
  const [contactEmail, setContactEmail] = useState(getVal("contactEmail") || "support@rajaboothouse.com");
  const [aboutUs, setAboutUs] = useState(getVal("aboutUs") || "Welcome to Raja Boot House. We sell shoes.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await saveSetting("storeName", storeName);
    await saveSetting("contactEmail", contactEmail);
    await saveSetting("aboutUs", aboutUs);
    setIsSubmitting(false);
    toast.success("Settings saved successfully");
  };

  return (
    <form onSubmit={handleSave} className="bg-card p-6 rounded-xl border border-border space-y-4 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Global Settings & Pages</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input required type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full p-2 border border-border rounded bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-2 border border-border rounded bg-background" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">About Us Text (Supports HTML)</label>
        <textarea rows={5} value={aboutUs} onChange={e => setAboutUs(e.target.value)} className="w-full p-2 border border-border rounded bg-background font-mono text-sm" />
      </div>

      <div className="pt-4">
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium disabled:opacity-50">Save Settings</button>
      </div>
    </form>
  );
}

function CategoriesTab({ categories }: { categories: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", slug: "", description: "", imageUrl: "", isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cols: Column<any>[] = [
    { key: "img", header: "Image", render: c => (
      <div className="h-10 w-10 rounded overflow-hidden bg-muted border border-border flex items-center justify-center">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">No Img</span>
        )}
      </div>
    )},
    { key: "name", header: "Name", render: c => (
      <div>
        <span className="font-semibold text-sm">{c.name}</span>
        <p className="text-xs text-muted-foreground">/{c.slug}</p>
      </div>
    )},
    { key: "description", header: "Description", render: c => <span className="text-sm line-clamp-1 max-w-xs">{c.description || "—"}</span> },
    { key: "styles", header: "Styles Count", render: c => <span className="text-sm">{c.productCount}</span> },
    { key: "status", header: "Status", render: c => (
      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
        {c.isActive ? "Active" : "Inactive"}
      </span>
    )},
    { key: "actions", header: "", className: "text-right", render: c => (
      <div className="flex justify-end gap-2">
        <button onClick={() => { setFormData(c); setShowForm(true); }} className="text-muted-foreground hover:text-foreground">
          <Edit className="h-4 w-4" />
        </button>
      </div>
    )}
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateCategory(formData.id, {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      isActive: formData.isActive,
      imageUrl: formData.imageUrl,
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Category updated successfully");
      setShowForm(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to update category");
    }
  };

  if (showForm) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-4">Edit Silhouette Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-2 border border-border rounded bg-background" placeholder="https://images.unsplash.com/..." />
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <img src={formData.imageUrl} alt="preview" className="h-20 w-20 object-cover rounded border border-border" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-border rounded bg-background" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
            <span className="text-sm font-medium">Is Active (Visible on home page grid)</span>
          </label>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-foreground rounded font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium disabled:opacity-50">Save Changes</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-base">Homepage Categories ("By Silhouette")</h3>
          <p className="text-xs text-muted-foreground">Manage the shoe silhouettes displayed on the homepage category grid.</p>
        </div>
      </div>
      <DataTable columns={cols} rows={categories} empty="No categories configured." />
    </div>
  );
}
