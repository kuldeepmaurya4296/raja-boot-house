"use server";

import { connectToDatabase } from "@/lib/db";
import Banner from "@/lib/models/Banner";
import Settings from "@/lib/models/Settings";
import { revalidatePath } from "next/cache";

export async function saveBanner(data: any) {
  try {
    await connectToDatabase();
    if (data.id) {
      await Banner.findByIdAndUpdate(data.id, data);
    } else {
      await Banner.create(data);
    }
    revalidatePath("/admin/cms");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBanner(id: string) {
  try {
    await connectToDatabase();
    await Banner.findByIdAndDelete(id);
    revalidatePath("/admin/cms");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveSetting(key: string, value: string) {
  try {
    await connectToDatabase();
    await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
