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
 * Permanently and physically deletes a photo from both Supabase Cloud Storage
 * and local filesystem storage to ensure storage space is fully reclaimed.
 */
export async function deleteBouquetPhoto(
  storagePath: string,
  imageUrl?: string
): Promise<boolean> {
  let deletedFromCloud = false;
  let deletedLocally = false;

  // 1. Delete from Supabase Cloud Storage (if configured)
  if (supabaseAdmin) {
    try {
      const candidates = new Set<string>();
      if (storagePath) {
        candidates.add(storagePath);
        candidates.add(storagePath.replace(/^bouquet-photos\//, ""));
        candidates.add(storagePath.replace(/^\//, ""));
      }

      if (imageUrl && imageUrl.includes(bucketName)) {
        const parts = imageUrl.split(`${bucketName}/`);
        if (parts[1]) {
          candidates.add(parts[1]);
        }
      }

      const pathsToRemove = Array.from(candidates);
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .remove(pathsToRemove);

      if (!error && data && data.length > 0) {
        console.log(`[Storage] Deleted from Supabase:`, pathsToRemove);
        deletedFromCloud = true;
      } else if (error) {
        console.warn(`[Storage] Supabase removal warning:`, error.message);
      }
    } catch (cloudErr) {
      console.warn(`[Storage] Supabase delete exception:`, cloudErr);
    }
  }

  // 2. ALWAYS physically delete from local filesystem
  const localCandidates = new Set<string>();

  if (storagePath) {
    localCandidates.add(path.join(process.cwd(), "public", "uploads", storagePath));
    localCandidates.add(
      path.join(process.cwd(), "public", "uploads", storagePath.replace(/^uploads\//, ""))
    );
    localCandidates.add(path.join(process.cwd(), "public", storagePath));
    localCandidates.add(path.join(process.cwd(), "public", storagePath.replace(/^\//, "")));
  }

  if (imageUrl) {
    if (imageUrl.startsWith("/uploads/")) {
      localCandidates.add(path.join(process.cwd(), "public", imageUrl.replace(/^\//, "")));
    } else if (imageUrl.startsWith("uploads/")) {
      localCandidates.add(path.join(process.cwd(), "public", imageUrl));
    }
  }

  for (const candidatePath of localCandidates) {
    try {
      await fs.access(candidatePath);
      await fs.unlink(candidatePath);
      console.log(`[Storage] Physically removed file from disk: ${candidatePath}`);
      deletedLocally = true;
    } catch {
      // File doesn't exist at this candidate path, continue checking others
    }
  }

  return deletedFromCloud || deletedLocally;
}
