import { connectToDatabase } from "../src/lib/db";
import Product from "../src/lib/models/Product";

async function main() {
  await connectToDatabase();
  console.log("Checking products...");
  const products = await Product.find({}).limit(5).select("_id name").lean();
  console.log("Some products:", products);
  const p = await Product.findById("6a268711318311a5e3771f8f").lean();
  console.log("Found product 6a268711318311a5e3771f8f:", p);
  process.exit(0);
}

main();
