import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Brand from "@/lib/models/Brand";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#FBBF24",
  grey: "#6B7280",
  gray: "#6B7280",
  brown: "#78350F",
  tan: "#D2B48C",
  navy: "#1E3A8A",
  pink: "#EC4899",
  orange: "#F97316",
  gold: "#D97706",
  silver: "#E5E7EB",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  cognac: "#9A3412",
};

function getColorHex(colorName: string): string {
  const norm = colorName.toLowerCase().trim();
  return COLOR_MAP[norm] || "#cccccc";
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    lines.push(row);
  }
  return lines.filter((r) => r.length > 0 && r.some((cell) => cell !== ""));
}

// GET handler: Downloads standard import template
export async function GET() {
  const headers = [
    "Name",
    "Description",
    "Price",
    "SalePrice",
    "Category",
    "Brand",
    "Gender",
    "Occasions",
    "Sizes",
    "Colors",
    "Stock",
    "ImageURL",
  ].join(",");

  const sampleRow = [
    '"Premium Oxford Shoes"',
    '"Hand-crafted genuine leather formal dress shoes."',
    "4999",
    "3999",
    '"Formal Shoes"',
    '"Raja Style"',
    "Men",
    "Daily;Wedding",
    "7;8;9;10",
    "Black;Brown;Tan",
    "10",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509",
  ].join(",");

  const csvContent = `${headers}\n${sampleRow}`;

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inventory_upload_template.csv"',
    },
  });
}

// POST handler: Processes CSV upload
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "vendor")) {
      return NextResponse.json(
        { error: "Unauthorized. Administrative privileges required." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No CSV file provided." }, { status: 400 });
    }

    const csvText = await file.text();
    const parsedData = parseCSV(csvText);

    if (parsedData.length < 2) {
      return NextResponse.json(
        { error: "CSV file is empty or missing data rows." },
        { status: 400 },
      );
    }

    const headers = parsedData[0].map((h) => h.toLowerCase());
    const dataRows = parsedData.slice(1);

    const nameIdx = headers.indexOf("name");
    const descIdx = headers.indexOf("description");
    const priceIdx = headers.indexOf("price");
    const salePriceIdx = headers.indexOf("saleprice");
    const categoryIdx = headers.indexOf("category");
    const brandIdx = headers.indexOf("brand");
    const genderIdx = headers.indexOf("gender");
    const occasionsIdx = headers.indexOf("occasions");
    const sizesIdx = headers.indexOf("sizes");
    const colorsIdx = headers.indexOf("colors");
    const stockIdx = headers.indexOf("stock");
    const imgIdx = headers.indexOf("imageurl");

    if (
      nameIdx === -1 ||
      descIdx === -1 ||
      priceIdx === -1 ||
      salePriceIdx === -1 ||
      categoryIdx === -1 ||
      brandIdx === -1 ||
      genderIdx === -1
    ) {
      return NextResponse.json(
        { error: "Missing required columns in CSV header. Check the template." },
        { status: 400 },
      );
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2;

      try {
        const name = row[nameIdx];
        const description = row[descIdx];
        const price = Number(row[priceIdx]);
        const salePrice = Number(row[salePriceIdx]);
        const categoryName = row[categoryIdx];
        const brandName = row[brandIdx];
        const gender = row[genderIdx];

        if (
          !name ||
          !description ||
          isNaN(price) ||
          isNaN(salePrice) ||
          !categoryName ||
          !brandName ||
          !gender
        ) {
          errors.push(`Row ${rowNumber}: Missing or invalid required fields.`);
          continue;
        }

        // 1. Resolve Category
        let dbCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
        });
        if (!dbCategory) {
          const categorySlug = generateSlug(categoryName);
          dbCategory = await Category.create({
            name: categoryName.trim(),
            slug: categorySlug,
            description: `Auto-created during bulk upload`,
            isActive: true,
          });
        }

        // 2. Resolve Brand
        let dbBrand = await Brand.findOne({
          name: { $regex: new RegExp(`^${brandName.trim()}$`, "i") },
        });
        if (!dbBrand) {
          const brandSlug = generateSlug(brandName);
          dbBrand = await Brand.create({
            name: brandName.trim(),
            slug: brandSlug,
            description: `Auto-created during bulk upload`,
            isActive: true,
          });
        }

        // 3. Resolve Gender
        const validGenders = ["Men", "Women", "Children", "Unisex"];
        const matchedGender = validGenders.find((g) => g.toLowerCase() === gender.toLowerCase());
        if (!matchedGender) {
          errors.push(
            `Row ${rowNumber}: Invalid gender "${gender}". Must be one of Men, Women, Children, Unisex.`,
          );
          continue;
        }

        // 4. Resolve Occasions
        const rawOccasions =
          occasionsIdx !== -1 && row[occasionsIdx] ? row[occasionsIdx].split(";") : ["Daily"];
        const validOccasions = ["Daily", "Wedding", "Bridal", "Party", "Function", "Sports"];
        const occasions = rawOccasions
          .map((o) => o.trim())
          .filter((o) => validOccasions.some((vo) => vo.toLowerCase() === o.toLowerCase()))
          .map((o) => validOccasions.find((vo) => vo.toLowerCase() === o.toLowerCase()) as string);

        // 5. Generate variants from Sizes and Colors cross-product
        const rawSizes =
          sizesIdx !== -1 && row[sizesIdx]
            ? row[sizesIdx]
                .split(";")
                .map(Number)
                .filter((n) => !isNaN(n))
            : [7, 8, 9, 10];
        const rawColors =
          colorsIdx !== -1 && row[colorsIdx]
            ? row[colorsIdx]
                .split(";")
                .map((c) => c.trim())
                .filter(Boolean)
            : ["Default"];
        const stockPerVariant = stockIdx !== -1 && row[stockIdx] ? Number(row[stockIdx]) : 10;

        const variants = [];
        for (const size of rawSizes) {
          for (const color of rawColors) {
            const cleanColor = color === "Default" ? "Default Color" : color;
            const sku = `${brandName.substring(0, 3).toUpperCase()}-${name.substring(0, 3).toUpperCase()}-${size}-${cleanColor.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            variants.push({
              size,
              color: cleanColor,
              colorHex: getColorHex(color),
              stock: isNaN(stockPerVariant) ? 0 : stockPerVariant,
              sku,
              images: [],
            });
          }
        }

        // 6. Image
        const imageUrl =
          imgIdx !== -1 && row[imgIdx] ? row[imgIdx].trim() : "/uploads/placeholder.jpg";
        const images = [{ url: imageUrl, public_id: `bulk-${Date.now()}` }];

        // 7. Uniqueness of Slug
        const baseSlug = generateSlug(name);
        let slug = baseSlug;
        let count = 1;
        while (await Product.findOne({ slug })) {
          slug = `${baseSlug}-${count++}`;
        }

        // 8. Create Product
        const newProduct = await Product.create({
          name: name.trim(),
          slug,
          description: description.trim(),
          brand: dbBrand._id,
          category: dbCategory._id,
          vendorId: new mongoose.Types.ObjectId(session.user.id),
          gender: matchedGender,
          occasion: occasions.length > 0 ? occasions : ["Daily"],
          images,
          variants,
          price,
          salePrice,
          isActive: true,
          isFeatured: false,
          isNewArrival: true,
          tags: [categoryName.toLowerCase(), brandName.toLowerCase()],
        });

        createdProducts.push(newProduct);
      } catch (err: any) {
        console.error(`Error at row ${rowNumber}:`, err);
        errors.push(`Row ${rowNumber}: ${err.message || "Unknown error during creation."}`);
      }
    }

    // Bust the shop caches so bulk-imported products appear immediately.
    if (createdProducts.length > 0) {
      revalidatePath("/shop");
      revalidateTag("shop-data", "max");
      revalidateTag("filter-metadata", "max");
    }

    return NextResponse.json({
      success: true,
      importedCount: createdProducts.length,
      errorsCount: errors.length,
      errors: errors.slice(0, 50), // Cap error details at 50 logs
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bulk upload" },
      { status: 500 },
    );
  }
}
