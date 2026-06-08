"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase as dbConnect } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { z } from "zod";

// --- CATEGORY ACTIONS ---

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function createCategory(data: z.infer<typeof categorySchema>) {
  try {
    await dbConnect();
    const parsed = categorySchema.parse(data);
    await Category.create(parsed);
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
  try {
    await dbConnect();
    const parsed = categorySchema.parse(data);
    await Category.findByIdAndUpdate(id, parsed);
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await dbConnect();
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return { success: false, error: `Cannot delete category. ${productsCount} products are attached to it.` };
    }
    await Category.findByIdAndDelete(id);
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- PRODUCT ACTIONS ---

const variantSchema = z.object({
  size: z.number().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().min(1, "Color hex is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
});

const productSchema = z.object({
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
  price: z.number().min(0, "Price must be positive"),
  salePrice: z.number().min(0, "Sale price must be positive"),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    await dbConnect();
    const parsed = productSchema.parse(data);
    await Product.create(parsed);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: z.infer<typeof productSchema>) {
  try {
    await dbConnect();
    const parsed = productSchema.parse(data);
    await Product.findByIdAndUpdate(id, parsed);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
