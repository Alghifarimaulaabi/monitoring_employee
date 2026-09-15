import type { NextConfig } from "next";
import fs from "node:fs";
import { execSync } from "node:child_process";

// Ensure Prisma client is generated if missing (e.g. during standalone next build on Vercel)
if (!fs.existsSync("./app/generated/prisma/client.ts")) {
  console.log("[next.config.ts] Prisma client missing. Running prisma generate...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (e) {
    console.error("[next.config.ts] Failed to run prisma generate:", e);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
