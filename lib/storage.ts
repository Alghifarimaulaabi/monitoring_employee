import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://owytzpffatngdufnpuhg.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_BOUQUET || "bouquet-photos";

// Initialize Supabase admin client if key is provided
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

export interface UploadResult {
  imageUrl: string;
  storagePath: string;
}

/**
 * Uploads a bouquet photo to Supabase Storage (or local storage fallback if service key not configured).
 * @param buffer - Binary buffer of the compressed image
 * @param storagePath - Target storage path e.g. "2026-09/550e8400-e29b-41d4-a716-446655440000.webp"
 * @param contentType - MIME type e.g. "image/webp"
 */
export async function uploadBouquetPhoto(
  buffer: Buffer,
  storagePath: string,
  contentType: string = "image/webp"
): Promise<UploadResult> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("[Storage] Supabase upload failed:", error);
      throw new Error(`Gagal mengunggah foto ke cloud storage: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      imageUrl: publicUrlData.publicUrl,
      storagePath,
    };
  }

  // Fallback: Local filesystem storage under /public/uploads/
  const localDest = path.join(process.cwd(), "public", "uploads", storagePath);
  await fs.mkdir(path.dirname(localDest), { recursive: true });
  await fs.writeFile(localDest, buffer);

  const localUrl = `/uploads/${storagePath.replace(/\\/g, "/")}`;
  console.log(`[Storage] Saved locally to ${localUrl}`);

  return {
    imageUrl: localUrl,
    storagePath,
  };
}

/**
 * Deletes a photo from storage.
 */
export async function deleteBouquetPhoto(storagePath: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([storagePath]);
    return !error;
  }

  try {
    const localDest = path.join(process.cwd(), "public", "uploads", storagePath);
    await fs.unlink(localDest);
    return true;
  } catch {
    return false;
  }
}
