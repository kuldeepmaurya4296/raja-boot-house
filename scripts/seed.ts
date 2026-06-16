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
import Brand from "../src/lib/models/Brand";
import NewsletterSubscriber from "../src/lib/models/NewsletterSubscriber";
import Collection from "../src/lib/models/Collection";

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
    await Brand.deleteMany({});
    await Collection.deleteMany({});
    await NewsletterSubscriber.deleteMany({});
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

    const vendor1 = await User.create({
      name: "Lakhani Footwear",
      email: "vendor@lakhani.com",
      password: customerPasswordHash,
      phone: "+91 88888 88888",
      role: "vendor",
      isActive: true,
      isEmailVerified: true,
      addresses: [],
    });

    console.log(`Seeded Users: ${adminUser.email}, ${mockCustomer1.email}, ${vendor1.email}`);

    // 3. Seed Brands
    console.log("Seeding Brands...");
    const sampleBrands = [
      { name: "Lakhani", order: 1, isActive: true },
      { name: "Touch Footwear", order: 2, isActive: true },
      { name: "Paragon", order: 3, isActive: true },
      { name: "Goldstar Shoes", order: 4, isActive: true },
      { name: "Raja Exclusive", order: 5, isActive: true },
      { name: "Touch Heels", order: 6, isActive: true },
      { name: "Lakhani Canvas", order: 7, isActive: true },
      { name: "Paragon Comfort", order: 8, isActive: true },
    ];
    const createdBrands = await Brand.create(sampleBrands);
    const brandMap: Record<string, any> = {};
    createdBrands.forEach((b: any) => {
      brandMap[b.name] = b;
    });
    console.log(`Seeded ${createdBrands.length} brands.`);

    // 4. Seed Categories
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

    // 5. Seed Products
    console.log("Seeding Products...");
    const brandsList = ["Lakhani", "Paragon", "Touch Footwear", "Goldstar Shoes", "Raja Exclusive"];
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
        const brandName = brandsList[(i - 1) % brandsList.length];
        const brandObj = brandMap[brandName] || brandMap["Raja Exclusive"];
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

        const productImages = [{ url: img, public_id: `unsplash-img-${i}` }];

        const created = await Product.create({
          name: `${brandName} Premium ${cat.name} Style ${i}`,
          slug: `${brandName.toLowerCase().replace(" ", "-")}-${cat.slug}-style-${i}`,
          description: `<p>High-quality <strong>${cat.name} footwear</strong> by ${brandName}.</p><p>Perfect for daily use and special occasions. Features a comfortable sole and durable materials.</p><ul><li>Premium styling</li><li>Flexible sole construction</li><li>Hand-finished detailing</li></ul>`,
          brand: brandObj._id,
          vendorId: brandName === "Lakhani" ? vendor1._id : undefined,
          category: categoryMap[cat.slug]._id,
          subcategory: "Classics",
          gender: gender,
          occasion: occasion,
          images: productImages,
          variants: [
            { size: 7, color: "Black", colorHex: "#000000", stock: 15, sku: `SKU-${cat.slug}-${i}-7-BK`, images: productImages },
            { size: 8, color: "Brown", colorHex: "#5C4033", stock: 20, sku: `SKU-${cat.slug}-${i}-8-BR`, images: productImages },
            { size: 9, color: "White", colorHex: "#FFFFFF", stock: 10, sku: `SKU-${cat.slug}-${i}-9-WH`, images: productImages },
          ],
          price: price,
          salePrice: salePrice,
          isFeatured: i === 1,
          isNewArrival: i === 2,
          isActive: true,
          tags: [cat.slug, brandName.toLowerCase(), "footwear"],
          metaTitle: `${brandName} ${cat.name} Style ${i} - Raja Boot House`,
          metaDescription: `Buy ${brandName} ${cat.name} Style ${i} at the best price.`
        });
        
        seededProducts.push(created);
      }
    }
    console.log(`Seeded ${seededProducts.length} products.`);

    // 6. Seed Collections
    console.log("Seeding Collections...");
    const newArrivalProducts = seededProducts.filter((p) => p.isNewArrival).map((p) => p._id);
    const featuredProducts = seededProducts.filter((p) => p.isFeatured).map((p) => p._id);

    const sampleCollections = [
      {
        name: "Trending Styles",
        slug: "trending-styles",
        description: "Explore the most popular designs and customer favorites this season.",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
        isFeatured: true,
        isActive: true,
        products: featuredProducts,
      },
      {
        name: "Fresh Drops",
        slug: "fresh-drops",
        description: "Check out the latest hand-finished footwear, fresh from our design bench.",
        imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop",
        isFeatured: false,
        isActive: true,
        products: newArrivalProducts,
      }
    ];

    await Collection.create(sampleCollections);
    console.log("Seeded sample marketing collections.");

    // 7. Seed Banners
    console.log("Seeding Banners...");
    await Banner.create([
      {
        title: "Crafted for Character",
        subtitle: "Hand-finished leather boots stitched using 50 years of family bootmaking tradition. Structured to age beautifully with you.",
        imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop",
        order: 1,
        isActive: true,
        tagline: "Artisan Leather · Since 1972",
        badgeTitle: "Oxford Welted Boot",
        badgePrice: "From ₹2,499",
      },
      {
        title: "Royal Wedding Heritage",
        subtitle: "Hand-embroidered groom sherwani mojaris and custom bridal footwear tailored for ultimate comfort on your special night.",
        imageUrl: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop?category=bridal",
        order: 2,
        isActive: true,
        tagline: "Traditional Sherwani Jootis",
        badgeTitle: "Golden Zardozi Mojari",
        badgePrice: "From ₹1,899",
      },
      {
        title: "Modern Comfort in Motion",
        subtitle: "Lightweight, shock-absorbing athletic running shoes and everyday casual wear guaranteed by India's top national brands.",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop?category=sports",
        order: 3,
        isActive: true,
        tagline: "Official Retail Partner",
        badgeTitle: "Lakhani Classic Runner",
        badgePrice: "From ₹899",
      },
      {
        title: "The Statement Heels Collection",
        subtitle: "Elevate your look with handcrafted block heels, festive ethnic flats, and daily sandals built with ergonomic arch support.",
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop?category=women",
        order: 4,
        isActive: true,
        tagline: "Atelier Women's Collection",
        badgeTitle: "Cognac Block Strap Heel",
        badgePrice: "From ₹1,499",
      },
    ]);
    console.log("Seeded homepage banners.");

    // 8. Seed Newsletter Subscribers
    console.log("Seeding Subscribers...");
    await NewsletterSubscriber.create([
      { name: "Rahul Maurya", email: "rahul.maurya@example.com", phone: "9876543210", message: "Looking for premium shoes." },
      { name: "Siddharth Singh", email: "siddharth@example.com", phone: "9123456789", message: "Interested in regional wedding footwear." }
    ]);
    console.log("Seeded sample newsletter subscribers.");

    // 9. Seed Default Trust Badges in Settings
    console.log("Seeding Default Trust Badges in Settings...");
    await Settings.create({
      key: "trust_badges",
      value: [
        { icon: "Award", title: "Official Retailer", subtitle: "Lakhani, Touch, Paragon, Goldstar" },
        { icon: "ShieldCheck", title: "Gupta Brothers Craft", subtitle: "Since 1972 quality assurance" },
        { icon: "Truck", title: "Free Shipping", subtitle: "Orders above ₹2000" },
        { icon: "RotateCcw", title: "Simple Exchanges", subtitle: "Within 30 days hassle-free" },
      ]
    });
    console.log("Seeded default trust badges settings.");

    console.log("\nDatabase Seeding Completed Successfully!");
  } catch (err: any) {
    console.error("Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
