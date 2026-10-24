// Adds the women's catalog in supabase/seed to the Supabase project in .env.
// Run after supabase/setup.sql: `npm run seed`. Safe to run again (it upserts).
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const seedDir = new URL("../supabase/seed/", import.meta.url).pathname;
const bucket = "product-images";
const contentTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

const imageDir = join(seedDir, "images");
for (const file of readdirSync(imageDir)) {
  const { error } = await db.storage.from(bucket).upload(file, readFileSync(join(imageDir, file)), {
    contentType: contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${file}: ${error.message}`);
}

const storage = `${url}/storage/v1/object/public/${bucket}`;
const products = JSON.parse(readFileSync(join(seedDir, "products.json"), "utf8").replaceAll("{{STORAGE}}", storage));
const brands = JSON.parse(readFileSync(join(seedDir, "brands.json"), "utf8"));

const brandResult = await db.from("brands").upsert(brands, { onConflict: "slug" });
if (brandResult.error) throw new Error(`Brands: ${brandResult.error.message}`);

const productResult = await db.from("products").upsert(products, { onConflict: "id" });
if (productResult.error) throw new Error(`Products: ${productResult.error.message}`);

console.log(`Seeded ${products.length} products, ${brands.length} brands and ${readdirSync(imageDir).length} images.`);
