export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  width: number;
  height: number;
}

export const COMPRESSION_CONFIG = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  outputFormat: "image/webp" as const,
  maxRawInputBytes: 10 * 1024 * 1024, // 10 MB
};

/**
 * Compresses an image file in the browser using HTML5 Canvas API.
 * Ensures the maximum dimension is 1280px and outputs WebP at 80% quality (~200KB-400KB).
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File yang dipilih bukan berkas gambar yang valid.");
  }

  if (file.size > COMPRESSION_CONFIG.maxRawInputBytes) {
    throw new Error(
      `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimum adalah 10 MB.`
    );
  }

  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      const { maxWidth, maxHeight, quality, outputFormat } = COMPRESSION_CONFIG;

      // Scale down proportionally if larger than maximum bounding box
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
          targetWidth = maxWidth;
        } else {
          targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
          targetHeight = maxHeight;
        }
      }

      // Create canvas and draw
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Gagal menginisiasi canvas 2D context untuk kompresi gambar."));
        return;
      }

      // Enable high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Attempt webp export, fallback to jpeg if unsupported
      const exportFormat = outputFormat;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gagal mengompresi gambar ke format WebP."));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const ext = blob.type === "image/webp" ? "webp" : "jpg";
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: blob.type,
            lastModified: Date.now(),
          });

          const compressedSize = compressedFile.size;
          const reduction = Math.max(
            0,
            Math.round(((originalSize - compressedSize) / originalSize) * 100)
          );

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            reductionPercent: reduction,
            width: targetWidth,
            height: targetHeight,
          });
        },
        exportFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal memuat gambar untuk proses kompresi."));
    };

    img.src = objectUrl;
  });
}

/**
 * Formats bytes to human-readable string (e.g. "2.4 MB", "350 KB").
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
