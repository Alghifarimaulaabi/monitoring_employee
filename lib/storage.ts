import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://owytzpffatngdufnpuhg.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "bouquet-photos";

// Initialize Supabase admin client if key is provided
const supabaseAdmin = supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

export interface UploadResult {
  imageUrl: string;
  storagePath: string;
}

/**
 * Uploads a bouquet photo to Supabase Storage.
 * If Supabase key is not configured, gracefully falls back to local storage in dev
 * or base64 Data URL in serverless production to avoid EROFS read-only filesystem errors.
 * @param buffer - Binary buffer of the compressed image
 * @param storagePath - Target storage path e.g. "2026-09/550e8400-e29b-41d4-a716-446655440000.webp"
 * @param contentType - MIME type e.g. "image/webp"
 */
export async function uploadBouquetPhoto(
  buffer: Buffer,
  storagePath: string,
  contentType: string = "image/webp"
): Promise<UploadResult> {
  // 1. Try cloud Supabase Storage if client is configured
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!error) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        return {
          imageUrl: publicUrlData.publicUrl,
          storagePath,
        };
      }
      console.warn("[Storage] Supabase upload error, attempting fallback:", error.message);
    } catch (err) {
      console.warn("[Storage] Supabase upload exception, attempting fallback:", err);
    }
  }

  // 2. Check if we are running in a read-only serverless environment (e.g. Vercel / AWS Lambda)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === "production"
  );

  // In serverless, writing to /var/task throws EROFS. Use a resilient base64 Data URL fallback.
  if (isServerless) {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    console.log(`[Storage] Saved as Data URL (serverless fallback) for ${storagePath}`);
    return {
      imageUrl: dataUrl,
      storagePath,
    };
  }

  // 3. Local filesystem storage under /public/uploads/ (Local development)
  try {
    const localDest = path.join(process.cwd(), "public", "uploads", storagePath);
    await fs.mkdir(path.dirname(localDest), { recursive: true });
    await fs.writeFile(localDest, buffer);

    const localUrl = `/uploads/${storagePath.replace(/\\/g, "/")}`;
    console.log(`[Storage] Saved locally to ${localUrl}`);

    return {
      imageUrl: localUrl,
      storagePath,
    };
  } catch (fsErr: unknown) {
    // If local write fails with EROFS, fallback to Data URL
    const isErofs =
      fsErr instanceof Error &&
      ((fsErr as { code?: string }).code === "EROFS" || fsErr.message.includes("read-only"));

    if (isErofs) {
      const base64 = buffer.toString("base64");
      return {
        imageUrl: `data:${contentType};base64,${base64}`,
        storagePath,
      };
    }
    throw fsErr;
  }
}

/**
 * Permanently and physically deletes a batch of photos in ONE single Supabase Storage request,
 * and parallel local disk removals.
 */
export async function deleteBouquetPhotosBatch(
  items: Array<{ storagePath: string; imageUrl?: string }>
): Promise<{ deletedCount: number }> {
  if (!items || items.length === 0) {
    return { deletedCount: 0 };
  }

  // 1. Collect all candidates for Supabase Storage and local disk
  const cloudCandidates = new Set<string>();
  const localCandidates = new Set<string>();

  for (const item of items) {
    const { storagePath, imageUrl } = item;
    if (storagePath) {
      cloudCandidates.add(storagePath);
      cloudCandidates.add(storagePath.replace(/^bouquet-photos\//, ""));
      cloudCandidates.add(storagePath.replace(/^\//, ""));

      localCandidates.add(path.join(process.cwd(), "public", "uploads", storagePath));
      localCandidates.add(
        path.join(process.cwd(), "public", "uploads", storagePath.replace(/^uploads\//, ""))
      );
      localCandidates.add(path.join(process.cwd(), "public", storagePath));
      localCandidates.add(path.join(process.cwd(), "public", storagePath.replace(/^\//, "")));
    }

    if (imageUrl) {
      if (imageUrl.includes(bucketName)) {
        const parts = imageUrl.split(`${bucketName}/`);
        if (parts[1]) {
          cloudCandidates.add(parts[1]);
        }
      }
      if (imageUrl.startsWith("/uploads/")) {
        localCandidates.add(path.join(process.cwd(), "public", imageUrl.replace(/^\//, "")));
      } else if (imageUrl.startsWith("uploads/")) {
        localCandidates.add(path.join(process.cwd(), "public", imageUrl));
      }
    }
  }

  // 2. Batch delete from Supabase Cloud Storage in a single HTTP request
  if (supabaseAdmin && cloudCandidates.size > 0) {
    try {
      const pathsToRemove = Array.from(cloudCandidates);
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .remove(pathsToRemove);

      if (!error && data && data.length > 0) {
        console.log(`[Storage] Batch deleted ${data.length} files from Supabase.`);
      } else if (error) {
        console.warn(`[Storage] Supabase batch removal warning:`, error.message);
      }
    } catch (cloudErr) {
      console.warn(`[Storage] Supabase batch delete exception:`, cloudErr);
    }
  }

  // 3. Parallel local disk deletion
  await Promise.allSettled(
    Array.from(localCandidates).map(async (candidatePath) => {
      try {
        await fs.access(candidatePath);
        await fs.unlink(candidatePath);
        console.log(`[Storage] Physically removed file from disk: ${candidatePath}`);
      } catch {
        // File doesn't exist at this candidate path, continue checking others
      }
    })
  );

  return { deletedCount: items.length };
}

/**
 * Permanently and physically deletes a single photo.
 */
export async function deleteBouquetPhoto(
  storagePath: string,
  imageUrl?: string
): Promise<boolean> {
  const res = await deleteBouquetPhotosBatch([{ storagePath, imageUrl }]);
  return res.deletedCount > 0;
}

