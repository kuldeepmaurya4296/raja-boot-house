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
      {
        name: "Men",
        slug: "men",
        description: "Men's footwear collection including formal, casual, and daily wear.",
      },
      {
        name: "Women",
        slug: "women",
        description: "Women's footwear collection including heels, flats, and sandals.",
      },
      {
        name: "Kids",
        slug: "kids",
        description: "Children's shoes, sandals, and school footwear.",
      },
      {
        name: "Bridal",
        slug: "bridal",
        description: "Exclusive wedding collection for brides and grooms.",
      },
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
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
    ];

    const seededProducts = [];

    for (const cat of categoryData) {
      for (let i = 1; i <= 5; i++) {
        const brandName = brandsList[(i - 1) % brandsList.length];
        const brandObj = brandMap[brandName] || brandMap["Raja Exclusive"];
        const img = images[i - 1];
        const price = 500 + i * 200 + Math.floor(Math.random() * 5) * 100;
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
            {
              size: 7,
              color: "Black",
              colorHex: "#000000",
              stock: 15,
              sku: `SKU-${cat.slug}-${i}-7-BK`,
              images: productImages,
            },
            {
              size: 8,
              color: "Brown",
              colorHex: "#5C4033",
              stock: 20,
              sku: `SKU-${cat.slug}-${i}-8-BR`,
              images: productImages,
            },
            {
              size: 9,
              color: "White",
              colorHex: "#FFFFFF",
              stock: 10,
              sku: `SKU-${cat.slug}-${i}-9-WH`,
              images: productImages,
            },
          ],
          price: price,
          salePrice: salePrice,
          isFeatured: i === 1,
          isNewArrival: i === 2,
          isActive: true,
          tags: [cat.slug, brandName.toLowerCase(), "footwear"],
          metaTitle: `${brandName} ${cat.name} Style ${i} - Raja Boot House`,
          metaDescription: `Buy ${brandName} ${cat.name} Style ${i} at the best price.`,
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
        imageUrl:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
        isFeatured: true,
        isActive: true,
        products: featuredProducts,
      },
      {
        name: "Fresh Drops",
        slug: "fresh-drops",
        description: "Check out the latest hand-finished footwear, fresh from our design bench.",
        imageUrl:
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&auto=format&fit=crop",
        isFeatured: false,
        isActive: true,
        products: newArrivalProducts,
      },
    ];

    await Collection.create(sampleCollections);
    console.log("Seeded sample marketing collections.");

    // 7. Seed Banners
    console.log("Seeding Banners...");
    await Banner.create([
      {
        title: "Crafted for Character",
        subtitle:
          "Hand-finished leather boots stitched using 50 years of family bootmaking tradition. Structured to age beautifully with you.",
        imageUrl:
          "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop",
        order: 1,
        isActive: true,
        tagline: "Artisan Leather",
        badgeTitle: "Oxford Welted Boot",
        badgePrice: "From ₹2,499",
      },
      {
        title: "Royal Wedding Heritage",
        subtitle:
          "Hand-embroidered groom sherwani mojaris and custom bridal footwear tailored for ultimate comfort on your special night.",
        imageUrl:
          "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop?category=bridal",
        order: 2,
        isActive: true,
        tagline: "Traditional Sherwani Jootis",
        badgeTitle: "Golden Zardozi Mojari",
        badgePrice: "From ₹1,899",
      },
      {
        title: "Modern Comfort in Motion",
        subtitle:
          "Lightweight, shock-absorbing athletic running shoes and everyday casual wear guaranteed by India's top national brands.",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        linkUrl: "/shop?category=sports",
        order: 3,
        isActive: true,
        tagline: "Official Retail Partner",
        badgeTitle: "Lakhani Classic Runner",
        badgePrice: "From ₹899",
      },
      {
        title: "The Statement Heels Collection",
        subtitle:
          "Elevate your look with block heels, festive ethnic flats, and daily sandals built with ergonomic arch support.",
        imageUrl:
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
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
      {
        name: "Rahul Maurya",
        email: "rahul.maurya@example.com",
        phone: "9876543210",
        message: "Looking for premium shoes.",
      },
      {
        name: "Siddharth Singh",
        email: "siddharth@example.com",
        phone: "9123456789",
        message: "Interested in regional wedding footwear.",
      },
    ]);
    console.log("Seeded sample newsletter subscribers.");

    // 9. Seed Default Trust Badges in Settings
    console.log("Seeding Default Trust Badges in Settings...");
    await Settings.create({
      key: "trust_badges",
      value: [
        {
          icon: "Award",
          title: "Official Retailer",
          subtitle: "Lakhani, Touch, Paragon, Goldstar",
        },
        {
          icon: "ShieldCheck",
          title: "Gupta Brothers Craft",
          subtitle: "Premium quality assurance",
        },
        { icon: "Truck", title: "Free Shipping", subtitle: "Orders above ₹2000" },
        { icon: "RotateCcw", title: "Simple Exchanges", subtitle: "Within 30 days hassle-free" },
      ],
    });
    console.log("Seeded default trust badges settings.");

    // 10. Seed Default Legal Policies in Settings
    console.log("Seeding Legal Policies in Settings...");
    await Settings.create([
      {
        key: "privacyPolicy",
        value: `<h2>Privacy Policy for Raja Boot House</h2>
<p>Effective Date: June 17, 2026</p>
<p>Welcome to Raja Boot House (accessible from e-commerce portal and physical stores). We value your privacy and are committed to protecting your personal data in compliance with the Information Technology Act, 2000 and consumer protection guidelines. This Privacy Policy details how we collect, use, and secure your information when you buy our footwear or browse our styles.</p>

<h3>1. Information We Collect</h3>
<p>We collect direct details necessary to fulfill your orders and customize your style experience:</p>
<ul>
  <li><strong>Identity & Contact:</strong> Full name, billing and shipping address, email address, and mobile number.</li>
  <li><strong>Transactions & Billing:</strong> Payment details (processed securely via UPI or third-party card processors), order history, and invoices.</li>
  <li><strong>Device & Interaction:</strong> IP address, browser type, site navigation paths, and cart items to improve platform speed and design.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use your personal data to power operations and ensure smooth deliveries:</p>
<ul>
  <li>Processing checkouts, verifying payments (Razorpay), and arranging courier delivery.</li>
  <li>Sending real-time email/SMS updates for order placement, shipment tracking, and returns.</li>
  <li>Providing support, responding to sizing inquiries, and addressing refund requests.</li>
  <li>Delivering personalized recommendations and newsletter announcements if you join the Raja Footwear Club.</li>
</ul>

<h3>3. Data Sharing with Partners</h3>
<p>We do NOT sell or rent your personal information to third parties. We only share transaction-specific data with trusted service partners for operation:</p>
<ul>
  <li><strong>Logistics Partners:</strong> Courier companies (Delhivery, Blue Dart, Speed Post) to deliver packages.</li>
  <li><strong>Payment Gateway:</strong> Razorpay to authorize transactions securely (we do not store credit card CVVs or net banking passwords).</li>
  <li><strong>System Administrators:</strong> Database and server hosting services (MongoDB Atlas, Vercel) to maintain app availability.</li>
</ul>

<h3>4. Data Security</h3>
<p>Our platform uses 256-bit Secure Socket Layer (SSL) encryption to safeguard data transmission. We restrict access to personal customer details to authorized staff who require it for packing and customer support. While we employ industry-standard defenses, please note that no digital transmission is 100% secure.</p>

<h3>5. Cookies Policy</h3>
<p>We use essential cookies to recognize you on return visits, preserve items inside your shopping bag, and optimize dashboard logins. You can choose to disable cookies through your browser settings, though doing so might affect cart functionality.</p>

<h3>6. Your Rights & Contacts</h3>
<p>You have the right to request access, correction, or deletion of your profile data. If you have questions regarding this policy or wish to opt-out of notifications, contact us at <strong>care@rajaboothouse.com</strong>.</p>`,
      },
      {
        key: "termsCondition",
        value: `<h2>Terms & Conditions (Terms of Service)</h2>
<p>Effective Date: June 17, 2026</p>
<p>These Terms & Conditions govern your use of the Raja Boot House e-commerce platform and purchases made on our site. By browsing our catalog, setting up an account, or placing an order, you agree to abide by these terms. Please read them carefully.</p>

<h3>1. Account Registration & Eligibility</h3>
<p>To place checkouts or save addresses, you must create a profile. You are responsible for keeping your login credentials secure. You must provide current, accurate details. If we suspect fraudulent activity or unauthorized logins, we reserve the right to suspend accounts immediately.</p>

<h3>2. Sizing, Pricing & Product Details</h3>
<p>We display high-resolution images of leather shoes, bridal juttis, and athletic footwear. Sizing grids (UK/India standards) are provided as guides; handmade styles may have minor artisan variances. All prices are listed in Indian Rupees (INR) and are inclusive of GST. In the rare case of pricing typographical errors, we reserve the right to cancel orders and process full refunds.</p>

<h3>3. Payments & Gateway Transactions</h3>
<p>We accept secure online transactions via Credit/Debit Cards, UPI, Net Banking (powered by Razorpay), and Cash on Delivery (COD). In case of payment failures where money was deducted, the gateway processes refunds automatically within 3–5 bank working days. For COD orders, we require SMS/phone verification before dispatching packages.</p>

<h3>4. Intellectual Property</h3>
<p>All website designs, custom product photographs, brand logos, code, and banners are the intellectual property of Raja Boot House and its developers. Downloading, replicating, or using site media for commercial purposes without written consent is strictly prohibited.</p>

<h3>5. Limitation of Liability</h3>
<p>Raja Boot House and its founders shall not be liable for any direct, indirect, or incidental damages arising out of your purchase or usage of footwear. Sizing comfort and material wear are subject to standard usage; handmade leather items require proper moisture care.</p>

<h3>6. Jurisdiction & Disputes</h3>
<p>These terms are governed by the laws of India. Any legal actions, claims, or disputes arising out of website usage or purchases shall be subject to the exclusive jurisdiction of the competent courts in Rewa, Madhya Pradesh.</p>`,
      },
      {
        key: "deliveryPolicy",
        value: `<h2>Shipping & Delivery Policy</h2>
<p>Welcome to the Shipping & Delivery guide of Raja Boot House. We work with leading Indian logistics aggregators to ensure your footwear reaches your doorstep safely, clean, and in double-walled boxes.</p>

<h3>1. Delivery Coverage</h3>
<p>We ship nationwide across India, covering over 19,000 pin codes. We currently do not support international shipping. Deliveries cannot be completed to military PO boxes or unauthorized collection spots.</p>

<h3>2. Shipping Costs</h3>
<ul>
  <li><strong>Standard Delivery:</strong> FREE on all orders with a total value of ₹2,000 or above. For orders under ₹2,000, a flat fee of ₹100 is added at checkout.</li>
  <li><strong>Express Shipping:</strong> Available on checkout for a flat charge of ₹150 (regardless of order value).</li>
  <li><strong>Same-day Local Delivery:</strong> Available inside Rewa city limits for ₹350 (orders must be placed before 12:00 PM IST).</li>
</ul>

<h3>3. Processing & Delivery Timelines</h3>
<p>Orders are packed and dispatched from our Rewa warehouse within 24–48 hours of order confirmation (excluding Sundays and national holidays):</p>
<ul>
  <li><strong>Standard Shipping:</strong> Expect delivery in 5–7 business days depending on location.</li>
  <li><strong>Express Shipping:</strong> Expect delivery in 2–3 business days for tier-1 cities.</li>
  <li><strong>Same-day Local (Rewa):</strong> Delivered on the same day before 9:00 PM.</li>
</ul>

<h3>4. Order Tracking</h3>
<p>As soon as your shipment is picked up by our courier partners (Delhivery, Blue Dart, or Speed Post), we will send you an email and SMS containing your tracking number and live tracking link. You can also view shipment stages from your Account Dashboard.</p>

<h3>5. Damage & Refused Deliveries</h3>
<p>Please do not accept any box that is open, heavily crushed, or tampered with. Take a photograph of the package and immediately contact care@rajaboothouse.com so we can file a courier claim and ship a replacement style to you.</p>`,
      },
      {
        key: "refundPolicy",
        value: `<h2>Return, Exchange & Refund Policy</h2>
<p>At Raja Boot House, we take pride in the design and quality of our footwear. If your shoe size does not fit or if you are not fully satisfied with your purchase, we offer a flexible return and exchange window.</p>

<h3>1. 30-Day Policy Window</h3>
<p>We provide a <strong>30-day return or exchange window</strong> starting from the day the package was marked delivered by our courier partner. Return or exchange requests submitted after 30 days will not be accepted.</p>

<h3>2. Conditions for Returns</h3>
<p>To qualify for a refund or size exchange, returned footwear must meet the following guidelines:</p>
<ul>
  <li>Footwear must be completely unworn, clean, and show zero crease marks on the leather or wear on the outsoles. We recommend trying your shoes on carpeted surfaces first.</li>
  <li>Items must be returned inside the original brand box, wrapped in protective paper, and include all tags, shoe trees, and accessories.</li>
  <li>Handmade juttis with delicate embroidery must not have loose threads or moisture damage.</li>
</ul>

<h3>3. How to Initiate a Return</h3>
<ol>
  <li>Log in to your <strong>Account Overview</strong> and click on the "Orders" page.</li>
  <li>Locate the order you wish to return and click "Request Return/Exchange". Select the reason and specify if you want a size exchange or a refund.</li>
  <li>Once approved, our courier will pick up the package from your address within 24–48 hours. Ensure the box is sealed securely in a shipping outer bag.</li>
</ol>

<h3>4. Refund Timelines & Banking Credit</h3>
<p>After the package arrives back at our Rewa warehouse, our quality control team inspects the shoe quality (usually completed within 48 hours). Once approved:</p>
<ul>
  <li><strong>Prepaid Orders:</strong> Refunds are credited back to the original bank account, credit card, or UPI ID used during Razorpay checkout. The funds usually reflect within 5–7 business days depending on your bank.</li>
  <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are sent via bank NEFT transfer or issued as Store Credit Coupons. You will be requested to secure your bank account details on our platform during the return submission.</li>
</ul>

<h3>5. Exceptions & Non-Returnable Items</h3>
<p>Customized bridal juttis made to custom measurements and items purchased from clearance sections labeled "Final Sale" cannot be returned or exchanged unless they arrive with physical manufacturing defects.</p>`,
      },
    ]);
    console.log("Seeded default legal policies settings.");

    console.log("\nDatabase Seeding Completed Successfully!");
  } catch (err: any) {
    console.error("Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
