import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const iconsDir = path.resolve(process.cwd(), "public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Standard SVG Icon (Full bleed with rounded squircle)
const standardSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="60%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
    <linearGradient id="petalGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
    <linearGradient id="petalGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fecdd3" />
      <stop offset="100%" stop-color="#fda4af" />
    </linearGradient>
    <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="wrapGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#881337" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Card with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Ring Glow -->
  <rect x="8" y="8" width="496" height="496" rx="104" stroke="white" stroke-width="4" stroke-opacity="0.25" />

  <!-- Bouquet Wrapper / Cone -->
  <g filter="url(#shadow)">
    <!-- Leaves / Foliage -->
    <path d="M190 230 C 140 180, 150 120, 210 150 C 230 190, 200 230, 190 230 Z" fill="url(#stemGrad)" />
    <path d="M322 230 C 372 180, 362 120, 302 150 C 282 190, 312 230, 322 230 Z" fill="url(#stemGrad)" />

    <!-- Flowers -->
    <!-- Flower Left -->
    <circle cx="210" cy="190" r="42" fill="url(#petalGrad2)" />
    <circle cx="210" cy="190" r="28" fill="url(#petalGrad1)" />
    <circle cx="210" cy="190" r="14" fill="#fb7185" />

    <!-- Flower Right -->
    <circle cx="302" cy="190" r="42" fill="url(#petalGrad2)" />
    <circle cx="302" cy="190" r="28" fill="url(#petalGrad1)" />
    <circle cx="302" cy="190" r="14" fill="#fb7185" />

    <!-- Flower Center (Main Rose) -->
    <circle cx="256" cy="150" r="54" fill="#ffffff" />
    <circle cx="256" cy="150" r="40" fill="url(#petalGrad2)" />
    <circle cx="256" cy="150" r="26" fill="url(#petalGrad1)" />
    <circle cx="256" cy="150" r="12" fill="#e11d48" />

    <!-- Floral Accent Mini Petals -->
    <circle cx="256" cy="98" r="12" fill="#ffe4e6" />
    <circle cx="168" cy="170" r="10" fill="#ffe4e6" />
    <circle cx="344" cy="170" r="10" fill="#ffe4e6" />

    <!-- Bouquet Paper Wrapper -->
    <polygon points="170,220 342,220 286,390 226,390" fill="url(#wrapGrad)" stroke="#f43f5e" stroke-width="4" stroke-linejoin="round" />
    <!-- Wrapper Fold Line -->
    <path d="M170 220 L 275 390" stroke="#fecdd3" stroke-width="3" />
    <path d="M342 220 L 237 390" stroke="#fda4af" stroke-width="3" />

    <!-- Bouquet Ribbon & Bow -->
    <ellipse cx="256" cy="300" rx="36" ry="14" fill="#e11d48" />
    <polygon points="256,302 230,350 256,338 282,350" fill="#be123c" />
    <circle cx="256" cy="300" r="8" fill="#ffffff" />
  </g>

  <!-- App Name Text at Bottom -->
  <text x="256" y="445" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="34" letter-spacing="4">B-TRACKER</text>
</svg>
`;

// Maskable SVG Icon (Needs safe area margin: icon in center 65-70% zone, background extends to full edges)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="60%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
    <linearGradient id="petalGrad1M" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
    <linearGradient id="petalGrad2M" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fecdd3" />
      <stop offset="100%" stop-color="#fda4af" />
    </linearGradient>
    <linearGradient id="stemGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="wrapGradM" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>
  </defs>

  <!-- Full bleed Background for maskable (no rx, fills completely) -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Scaled content in the safe area (around 70% scale centered) -->
  <g transform="translate(64, 48) scale(0.75)">
    <!-- Foliage -->
    <path d="M190 230 C 140 180, 150 120, 210 150 C 230 190, 200 230, 190 230 Z" fill="url(#stemGradM)" />
    <path d="M322 230 C 372 180, 362 120, 302 150 C 282 190, 312 230, 322 230 Z" fill="url(#stemGradM)" />

    <!-- Flowers -->
    <circle cx="210" cy="190" r="42" fill="url(#petalGrad2M)" />
    <circle cx="210" cy="190" r="28" fill="url(#petalGrad1M)" />
    <circle cx="210" cy="190" r="14" fill="#fb7185" />

    <circle cx="302" cy="190" r="42" fill="url(#petalGrad2M)" />
    <circle cx="302" cy="190" r="28" fill="url(#petalGrad1M)" />
    <circle cx="302" cy="190" r="14" fill="#fb7185" />

    <circle cx="256" cy="150" r="54" fill="#ffffff" />
    <circle cx="256" cy="150" r="40" fill="url(#petalGrad2M)" />
    <circle cx="256" cy="150" r="26" fill="url(#petalGrad1M)" />
    <circle cx="256" cy="150" r="12" fill="#e11d48" />

    <circle cx="256" cy="98" r="12" fill="#ffe4e6" />
    <circle cx="168" cy="170" r="10" fill="#ffe4e6" />
    <circle cx="344" cy="170" r="10" fill="#ffe4e6" />

    <!-- Bouquet Paper Wrapper -->
    <polygon points="170,220 342,220 286,390 226,390" fill="url(#wrapGradM)" stroke="#f43f5e" stroke-width="4" stroke-linejoin="round" />
    <path d="M170 220 L 275 390" stroke="#fecdd3" stroke-width="3" />
    <path d="M342 220 L 237 390" stroke="#fda4af" stroke-width="3" />

    <!-- Bouquet Ribbon -->
    <ellipse cx="256" cy="300" rx="36" ry="14" fill="#e11d48" />
    <polygon points="256,302 230,350 256,338 282,350" fill="#be123c" />
    <circle cx="256" cy="300" r="8" fill="#ffffff" />

    <text x="256" y="445" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="34" letter-spacing="4">B-TRACKER</text>
  </g>
</svg>
`;

async function run() {
  console.log("Generating PWA icons...");

  // Write SVG files
  fs.writeFileSync(path.join(iconsDir, "icon.svg"), standardSvg);
  fs.writeFileSync(path.join(iconsDir, "icon-maskable.svg"), maskableSvg);

  const standardBuf = Buffer.from(standardSvg);
  const maskableBuf = Buffer.from(maskableSvg);

  // 192x192 PNG
  await sharp(standardBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));
  console.log("✔ Created icon-192x192.png");

  // 512x512 PNG
  await sharp(standardBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));
  console.log("✔ Created icon-512x512.png");

  // 512x512 Maskable PNG
  await sharp(maskableBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512x512.png"));
  console.log("✔ Created icon-maskable-512x512.png");

  // 180x180 Apple Touch Icon
  await sharp(standardBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("✔ Created apple-touch-icon.png");

  console.log("All PWA icons generated successfully!");
}

run().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
