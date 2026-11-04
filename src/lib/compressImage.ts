import sharp from "sharp";

// Every photo is served straight from Supabase Storage, so its size is what each
// visitor downloads. Shrink to the largest size the site shows and save as WebP.
export async function compressImage(input: Buffer, maxSide = 1200) {
  return sharp(input)
    .rotate()
    .resize({ width: maxSide, height: Math.round(maxSide * 1.25), fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, effort: 5 })
    .toBuffer();
}

// File names are unique, so browsers and the CDN can keep them for a year.
export const IMAGE_CACHE_SECONDS = "31536000";
