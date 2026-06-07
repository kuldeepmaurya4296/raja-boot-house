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
        {
          label: "Office",
          fullName: "Aarav Sharma",
          phone: "+91 98200 12345",
          line1: "Bandra Kurla Complex, Tower C",
          city: "Mumbai",
          state: "Maharashtra",
          pin: "400051",
          isDefault: false,
        },
      ],
    });

    const mockCustomer2 = await User.create({
      name: "Priya Mehta",
      email: "priya@example.com",
      password: customerPasswordHash,
      phone: "+91 90000 11111",
      role: "customer",
      isActive: true,
      isEmailVerified: true,
      addresses: [],
    });

    console.log(`Seeded Users: ${adminUser.email}, ${mockCustomer1.email}, ${mockCustomer2.email}`);

    // 3. Seed Categories
    console.log("Seeding Categories...");
    const categoryData = [
      { name: "Shoes", slug: "shoes", description: "Daily slippers, casual sandals, sports shoes, and formal styles." },
      { name: "Chappal / Slippers", slug: "chappal", description: "Contoured flip flops, comfort house slippers, and flats." },
      { name: "Sandals", slug: "sandals", description: "Open and closed-toe daily strap sandals." },
      { name: "Bridal / Wedding", slug: "bridal", description: "Exclusive wedding heels and groom sherwani jootis." },
      { name: "Function Wear", slug: "function", description: "Ethnic formal mojaris, block heels, and party wear." },
      { name: "Kids Footwear", slug: "kids", description: "Velcro play shoes, school shoes, and active sandals." },
    ];

    const categoryMap: Record<string, any> = {};
    for (const cat of categoryData) {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created;
    }
    console.log(`Seeded ${Object.keys(categoryMap).length} categories.`);

    // 4. Seed Products
    console.log("Seeding Products...");
    const productsData = [
      {
        name: "Lakhani Classic Running Shoe",
        slug: "lakhani-classic-running-shoe",
        description: "High-comfort athletic running shoe by Lakhani, featuring a breathable mesh upper and shock-absorbent sole.",
        brand: "Lakhani",
        category: categoryMap["shoes"]._id,
        subcategory: "Sports Shoes",
        gender: "Men",
        occasion: ["Daily", "Sports"],
        images: [{ url: "/assets/product-4.jpg", public_id: "lakhani-running-shoe" }],
        variants: [
          { size: 7, color: "Blue", colorHex: "#0000FF", stock: 10, sku: "LAK-RUN-7-BL" },
          { size: 8, color: "Blue", colorHex: "#0000FF", stock: 15, sku: "LAK-RUN-8-BL" },
          { size: 9, color: "Blue", colorHex: "#0000FF", stock: 12, sku: "LAK-RUN-9-BL" },
          { size: 10, color: "Blue", colorHex: "#0000FF", stock: 8, sku: "LAK-RUN-10-BL" },
        ],
        price: 1299,
        salePrice: 899,
        isFeatured: true,
        isNewArrival: false,
        isActive: true,
        tags: ["lakhani", "running", "sports", "shoes"],
        metaTitle: "Lakhani Classic Running Shoe - Raja Boot House",
        metaDescription: "Buy Lakhani Classic Running Shoe at best price from Raja Boot House Gorakhpur.",
      },
      {
        name: "Touch Party Heels (Black)",
        slug: "touch-party-heels-black",
        description: "Stunning block-heel party footwear from Touch. Provides perfect fusion of high fashion and comfort for wedding functions.",
        brand: "Touch",
        category: categoryMap["function"]._id,
        subcategory: "Heels",
        gender: "Women",
        occasion: ["Party", "Function"],
        images: [{ url: "/assets/product-2.jpg", public_id: "touch-party-heels" }],
        variants: [
          { size: 5, color: "Black", colorHex: "#000000", stock: 8, sku: "TOU-HEEL-5-BK" },
          { size: 6, color: "Black", colorHex: "#000000", stock: 12, sku: "TOU-HEEL-6-BK" },
          { size: 7, color: "Black", colorHex: "#000000", stock: 10, sku: "TOU-HEEL-7-BK" },
        ],
        price: 1899,
        salePrice: 1299,
        isFeatured: true,
        isNewArrival: true,
        isActive: true,
        tags: ["touch", "heels", "party", "women"],
      },
      {
        name: "Paragon Daily Chappal",
        slug: "paragon-daily-chappal",
        description: "Waterproof synthetic rubber daily slippers from Paragon. Extremely durable and soft footbed for indoor and outdoor walking.",
        brand: "Paragon",
        category: categoryMap["chappal"]._id,
        subcategory: "Slippers",
        gender: "Men",
        occasion: ["Daily"],
        images: [{ url: "/assets/product-5.jpg", public_id: "paragon-daily-chappal" }],
        variants: [
          { size: 7, color: "Brown", colorHex: "#5C4033", stock: 20, sku: "PAR-CHAP-7-BR" },
          { size: 8, color: "Brown", colorHex: "#5C4033", stock: 25, sku: "PAR-CHAP-8-BR" },
          { size: 9, color: "Brown", colorHex: "#5C4033", stock: 30, sku: "PAR-CHAP-9-BR" },
          { size: 10, color: "Brown", colorHex: "#5C4033", stock: 15, sku: "PAR-CHAP-10-BR" },
        ],
        price: 399,
        salePrice: 299,
        isFeatured: false,
        isNewArrival: false,
        isActive: true,
        tags: ["paragon", "chappal", "slippers", "daily"],
      },
      {
        name: "Goldstar School Shoe",
        slug: "goldstar-school-shoe",
        description: "Tough black leather school uniform shoes from Goldstar. Built for daily physical activities and long-term durability.",
        brand: "Goldstar",
        category: categoryMap["kids"]._id,
        subcategory: "School Shoes",
        gender: "Children",
        occasion: ["Daily"],
        images: [{ url: "/assets/product-6.jpg", public_id: "goldstar-school-shoe" }],
        variants: [
          { size: 2, color: "Black", colorHex: "#000000", stock: 15, sku: "GOL-SCH-2-BK" },
          { size: 3, color: "Black", colorHex: "#000000", stock: 20, sku: "GOL-SCH-3-BK" },
          { size: 4, color: "Black", colorHex: "#000000", stock: 15, sku: "GOL-SCH-4-BK" },
        ],
        price: 799,
        salePrice: 599,
        isFeatured: false,
        isNewArrival: true,
        isActive: true,
        tags: ["goldstar", "school", "kids", "shoes"],
      },
      {
        name: "Embroidered Dulha Joota",
        slug: "embroidered-dulha-joota",
        description: "Exclusive traditional wedding sherwani mojaris by Raja Exclusive collection. Heavily embroidered with golden zari threads.",
        brand: "Raja Exclusive",
        category: categoryMap["bridal"]._id,
        subcategory: "Groom Joota",
        gender: "Men",
        occasion: ["Wedding", "Bridal"],
        images: [{ url: "/assets/product-1.jpg", public_id: "dulha-joota" }],
        variants: [
          { size: 8, color: "Gold", colorHex: "#FFD700", stock: 5, sku: "RAJ-JOOT-8-GD" },
          { size: 9, color: "Gold", colorHex: "#FFD700", stock: 8, sku: "RAJ-JOOT-9-GD" },
          { size: 10, color: "Gold", colorHex: "#FFD700", stock: 4, sku: "RAJ-JOOT-10-GD" },
        ],
        price: 3499,
        salePrice: 2799,
        isFeatured: true,
        isNewArrival: true,
        isActive: true,
        tags: ["dulha", "wedding", "groom", "mojari", "joota"],
      },
    ];

    const seededProducts = [];
    for (const prod of productsData) {
      const created = await Product.create(prod);
      seededProducts.push(created);
    }
    console.log(`Seeded ${seededProducts.length} products.`);

    // 5. Seed Banners
    console.log("Seeding Banners...");
    await Banner.create([
      {
        title: "The Heritage Edit",
        subtitle: "Exclusive wedding, groom, and bridal collections by Raja Boot House Gorakhpur.",
        imageUrl: "/assets/hero-banner-1.jpg",
        linkUrl: "/shop?category=bridal",
        order: 1,
        isActive: true,
      },
      {
        title: "Free Shipping Over ₹2000",
        subtitle: "Premium brands Lakhani, Touch, Paragon, and Goldstar at direct wholesale prices.",
        imageUrl: "/assets/hero-banner-2.jpg",
        linkUrl: "/shop",
        order: 2,
        isActive: true,
      },
    ]);
    console.log("Seeded homepage banners.");

    // 6. Seed Coupons
    console.log("Seeding Coupons...");
    await Coupon.create([
      {
        code: "WELCOME10",
        type: "Percentage",
        value: 10,
        minCartValue: 500,
        validFrom: new Date(),
        validTill: new Date("2026-12-31"),
        isActive: true,
        usageLimit: 500,
        usedCount: 12,
      },
      {
        code: "SHAADI500",
        type: "Flat",
        value: 500,
        minCartValue: 2500,
        validFrom: new Date(),
        validTill: new Date("2026-12-31"),
        isActive: true,
        usageLimit: 200,
        usedCount: 3,
      },
      {
        code: "FREESHIP",
        type: "Free Shipping",
        value: 0,
        minCartValue: 799,
        validFrom: new Date(),
        validTill: new Date("2027-03-31"),
        isActive: true,
        usageLimit: 1000,
        usedCount: 45,
      },
    ]);
    console.log("Seeded discount coupons.");

    // 7. Seed Settings
    console.log("Seeding Settings...");
    await Settings.create([
      {
        key: "store_details",
        value: {
          name: "Raja Boot House",
          established: "2025",
          owners: "Prince Gupta & Bipin Gupta",
          address: "Main Footwear Market, Gorakhpur, UP, India",
          phone: "+91-XXXXXXXXXX",
          email: "support@rajaboothouse.in",
        },
      },
      {
        key: "shipping_rules",
        value: {
          freeShippingThreshold: 2000,
          flatRate: 80,
        },
      },
    ]);
    console.log("Seeded store configuration settings.");

    // 8. Seed Reviews
    console.log("Seeding Reviews...");
    const reviewData = [
      {
        productId: seededProducts[4]._id, // Dulha Joota
        userId: mockCustomer1._id,
        rating: 5,
        comment: "Wore this Lakhani jutti for my wedding ceremony and received so many compliments. It matched my sherwani perfectly and was very comfortable.",
        isApproved: true,
        helpfulVotes: 8,
      },
      {
        productId: seededProducts[0]._id, // Lakhani Classic Running Shoe
        userId: mockCustomer2._id,
        rating: 4,
        comment: "Excellent daily footwear. Good ventilation and fits true to size.",
        isApproved: true,
        helpfulVotes: 3,
      },
    ];

    for (const rev of reviewData) {
      await Review.create(rev);
    }
    console.log("Seeded reviews.");

    // 9. Seed Orders
    console.log("Seeding Orders...");
    await Order.create({
      orderId: "RBH-20250607-0042",
      userId: mockCustomer1._id,
      items: [
        {
          productId: seededProducts[4]._id,
          name: seededProducts[4].name,
          image: seededProducts[4].images[0].url,
          size: 9,
          color: "Gold",
          price: seededProducts[4].salePrice,
          qty: 1,
        },
      ],
      shippingAddress: {
        fullName: mockCustomer1.name,
        phone: mockCustomer1.phone || "+91-XXXXXXXXXX",
        line1: mockCustomer1.addresses[0].line1,
        city: mockCustomer1.addresses[0].city,
        state: mockCustomer1.addresses[0].state,
        pin: mockCustomer1.addresses[0].pin,
        country: "India",
      },
      pricing: {
        subtotal: 2799,
        shipping: 0,
        couponDiscount: 0,
        total: 2799,
      },
      payment: {
        method: "Card",
        razorpayOrderId: "order_mock12345",
        razorpayPaymentId: "pay_mock12345",
        status: "PAID",
      },
      status: "CONFIRMED",
      statusHistory: [
        { status: "PLACED", timestamp: new Date(Date.now() - 3600000), note: "Order placed by customer." },
        { status: "CONFIRMED", timestamp: new Date(), note: "Payment verified, order confirmed." },
      ],
    });
    console.log("Seeded mock orders.");

    console.log("\nDatabase Seeding Completed Successfully!");
  } catch (err: any) {
    console.error("Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
