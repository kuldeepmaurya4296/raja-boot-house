"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/modules/admin/shared/components/ImageUploader";

const variantSchema = z.object({
  size: z.coerce.number().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().min(1, "Color hex is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
});

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(10, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  gender: z.enum(["Men", "Women", "Children", "Unisex"]),
  occasion: z.array(z.string()).min(1, "At least one occasion is required"),
  images: z.array(z.object({
    url: z.string().url("Must be a valid URL"),
    public_id: z.string()
  })).min(1, "At least one image is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce.number().min(0, "Sale price must be positive"),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export function ProductForm({ 
  initialData, 
  id, 
  categories 
}: { 
  initialData?: Partial<FormData>, 
  id?: string,
  categories: { id: string, name: string }[]
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      brand: initialData?.brand || "",
      category: initialData?.category || "",
      gender: initialData?.gender || "Unisex",
      occasion: initialData?.occasion || ["Daily"],
      images: initialData?.images || [{ url: "", public_id: "placeholder" }],
      variants: initialData?.variants || [{ size: 7, color: "Black", colorHex: "#000000", stock: 10, sku: "" }],
      price: initialData?.price || 0,
      salePrice: initialData?.salePrice || 0,
      isFeatured: initialData?.isFeatured ?? false,
      isNewArrival: initialData?.isNewArrival ?? false,
      isActive: initialData?.isActive ?? true,
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "images" });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!initialData?.slug && !watch("slug")) {
      setValue("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    let res;
    if (id) {
      res = await updateProduct(id, data);
    } else {
      res = await createProduct(data);
    }
    
    if (res.success) {
      toast.success(`Product ${id ? 'updated' : 'created'} successfully!`);
      router.push("/admin/products");
    } else {
      toast.error(res.error || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Products
      </Link>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-serif font-bold text-xl mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input {...register("name")} onChange={handleNameChange} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input {...register("slug")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input {...register("brand")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register("category")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register("description")} rows={4} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-serif font-bold text-xl mb-6">Pricing & Classifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (MRP)</label>
              <input type="number" {...register("price")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price</label>
              <input type="number" {...register("salePrice")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select {...register("gender")} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Children">Children</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isActive" {...register("isActive")} className="h-4 w-4 rounded border-border text-primary" />
              <label htmlFor="isActive" className="text-sm font-medium">Active Status</label>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif font-bold text-xl">Images (URLs)</h2>
            <button type="button" onClick={() => appendImage({ url: "", public_id: "placeholder" })} className="text-sm bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Image
            </button>
          </div>
          <div className="space-y-4">
            {imageFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 border border-border/40 p-4 rounded-lg bg-muted/5 relative">
                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`images.${index}.url` as const}
                    render={({ field: uploaderField }) => (
                      <ImageUploader
                        value={uploaderField.value || ""}
                        onChange={uploaderField.onChange}
                        placeholder="Image URL (e.g. https://images.unsplash.com/... or upload a file)"
                      />
                    )}
                  />
                </div>
                {imageFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md mt-1 cursor-pointer self-start"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif font-bold text-xl">Variants (Size/Color)</h2>
            <button type="button" onClick={() => appendVariant({ size: 8, color: "Black", colorHex: "#000000", stock: 10, sku: "" })} className="text-sm bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Variant
            </button>
          </div>
          <div className="space-y-4">
            {variantFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-5 gap-3 items-start border border-border/50 p-4 rounded-lg bg-muted/10 relative">
                <div>
                  <label className="block text-xs font-medium mb-1">Size</label>
                  <input type="number" {...register(`variants.${index}.size` as const)} className="w-full px-2 py-1.5 border border-border rounded text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Color Name</label>
                  <input {...register(`variants.${index}.color` as const)} className="w-full px-2 py-1.5 border border-border rounded text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Color Hex</label>
                  <input type="color" {...register(`variants.${index}.colorHex` as const)} className="w-full h-8 p-0.5 border border-border rounded bg-background cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Stock</label>
                  <input type="number" {...register(`variants.${index}.stock` as const)} className="w-full px-2 py-1.5 border border-border rounded text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">SKU</label>
                  <input {...register(`variants.${index}.sku` as const)} className="w-full px-2 py-1.5 border border-border rounded text-sm bg-background" />
                </div>
                {variantFields.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 p-1.5 bg-background border border-border shadow-sm text-destructive hover:bg-destructive hover:text-white rounded-full transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-lg shadow-sm"
          >
            {loading ? "Saving Product..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
