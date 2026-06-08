import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";

// Force IPv4 DNS resolution order to prevent querySrv ECONNREFUSED on some networks
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e);
}

// Models
import Category from "../src/lib/models/Category";
import Product from "../src/lib/models/Product";
import User from "../src/lib/models/User";
import Order from "../src/lib/models/Order";
import Coupon from "../src/lib/models/Coupon";
import Banner from "../src/lib/models/Banner";
import Settings from "../src/lib/models/Settings";
import Review from "../src/lib/models/Review";

// Load environment variables manually from .env file
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      // Ignore comments and empty lines
      if (line.trim().startsWith("#") || line.trim() === "") return;
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

async function runSeed() {
  loadEnv();

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to database:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to MongoDB.");
  } catch (err: any) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }

  try {
    // 1. Clean existing collections
    console.log("Cleaning database collections...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await Banner.deleteMany({});
    await Settings.deleteMany({});
    await Review.deleteMany({});
    console.log("Database cleaned.");

    // 2. Seed Users
    console.log("Seeding Users...");
    const adminPasswordHash = await bcrypt.hash("RajaBoots@2025", 10);
    const customerPasswordHash = await bcrypt.hash("Customer@2025", 10);

    const adminUser = await User.create({
      name: "Bipin Gupta",
      email: "admin@rajaboothouse.in",
      password: adminPasswordHash,
      phone: "+91-9999999999",
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      addresses: [
        {
          label: "Shop",
          fullName: "Raja Boot House",
          phone: "+91-9999999999",
          line1: "Main Footwear Market, Raja Chouraha",
          city: "Gorakhpur",
          state: "Uttar Pradesh",
          pin: "273001",
          isDefault: true,
        },
      ],
    });

    const mockCustomer1 = await User.create({
      name: "Aarav Sharma",
      email: "aarav@example.com",
      password: customerPasswordHash,
      phone: "+91 98200 12345",
      role: "customer",
      isActive: true,
      isEmailVerified: true,
      addresses: [
        {
          label: "Home",
          fullName: "Aarav Sharma",
          phone: "+91 98200 12345",
          line1: "12 Marine Drive, Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          pin: "400020",
          isDefault: true,
        },
      ],
    });

    console.log(`Seeded Users: ${adminUser.email}, ${mockCustomer1.email}`);

    // 3. Seed Categories
    console.log("Seeding Categories...");
    const categoryData = [
      { name: "Men", slug: "men", description: "Men's footwear collection including formal, casual, and daily wear." },
      { name: "Women", slug: "women", description: "Women's footwear collection including heels, flats, and sandals." },
      { name: "Kids", slug: "kids", description: "Children's shoes, sandals, and school footwear." },
      { name: "Bridal", slug: "bridal", description: "Exclusive wedding collection for brides and grooms." },
      { name: "Sports", slug: "sports", description: "Athletic and running shoes for all." },
    ];

    const categoryMap: Record<string, any> = {};
    for (const cat of categoryData) {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created;
    }
    console.log(`Seeded ${Object.keys(categoryMap).length} categories.`);

    // 4. Seed Products
    console.log("Seeding Products...");
    const brands = ["Raja Classics", "Lakhani", "Paragon", "Touch", "Goldstar"];
    const images = [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop"
    ];

    const seededProducts = [];
    
    for (const cat of categoryData) {
      for (let i = 1; i <= 5; i++) {
        const brand = brands[(i - 1) % brands.length];
        const img = images[i - 1];
        const price = 500 + (i * 200) + (Math.floor(Math.random() * 5) * 100);
        const salePrice = Math.round(price * 0.8); // 20% discount
        
        let gender = "Unisex";
        if (cat.name === "Men") gender = "Men";
        else if (cat.name === "Women") gender = "Women";
        else if (cat.name === "Kids") gender = "Children";
        
        let occasion = ["Daily"];
        if (cat.name === "Bridal") occasion = ["Wedding", "Party"];
        else if (cat.name === "Sports") occasion = ["Sports"];

        const created = await Product.create({
          name: `${brand} Premium ${cat.name} Style ${i}`,
          slug: `${brand.toLowerCase().replace(" ", "-")}-${cat.slug}-style-${i}`,
          description: `High-quality ${cat.name} footwear by ${brand}. Perfect for daily use and special occasions. Features a comfortable sole and durable materials.`,
          brand: brand,
          category: categoryMap[cat.slug]._id,
          subcategory: "Classics",
          gender: gender,
          occasion: occasion,
          images: [{ url: img, public_id: `unsplash-img-${i}` }],
          variants: [
            { size: 7, color: "Black", colorHex: "#000000", stock: 15, sku: `SKU-${cat.slug}-${i}-7-BK` },
            { size: 8, color: "Brown", colorHex: "#5C4033", stock: 20, sku: `SKU-${cat.slug}-${i}-8-BR` },
            { size: 9, color: "White", colorHex: "#FFFFFF", stock: 10, sku: `SKU-${cat.slug}-${i}-9-WH` },
          ],
          price: price,
          salePrice: salePrice,
          isFeatured: i === 1,
          isNewArrival: i === 2,
          isActive: true,
          tags: [cat.slug, brand.toLowerCase(), "footwear"],
          metaTitle: `${brand} ${cat.name} Style ${i} - Raja Boot House`,
          metaDescription: `Buy ${brand} ${cat.name} Style ${i} at the best price.`
        });
        
        seededProducts.push(created);
      }
    }
    console.log(`Seeded ${seededProducts.length} products.`);

    // 5. Seed Banners
    console.log("Seeding Banners...");
    await Banner.create([
      {
        title: "The Heritage Edit",
        subtitle: "Exclusive wedding, groom, and bridal collections.",
        imageUrl: "/assets/hero-boots.jpg",
        linkUrl: "/shop?category=bridal",
        order: 1,
        isActive: true,
      },
      {
        title: "Free Shipping Over ₹2000",
        subtitle: "Premium athletic and casual styles.",
        imageUrl: "/assets/product-4.jpg",
        linkUrl: "/shop?category=sports",
        order: 2,
        isActive: true,
      },
    ]);
    console.log("Seeded homepage banners.");

    console.log("\nDatabase Seeding Completed Successfully!");
  } catch (err: any) {
    console.error("Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
