# Canonical Tech Stack

This document locks the technical stack. Agents must not suggest or use alternative libraries unless agreed upon in open questions.

## 1. Frontend & Core Framework
* **Framework:** Next.js 14+ (App Router, Server Actions, React Server Components).
* **Language:** TypeScript 5+ (Strict Mode enabled).
* **Styling:** Tailwind CSS 3.4+.
* **Component Primitives:** Radix UI / Shadcn UI (accessible, unstyled accessible primitives).
* **Icons:** Lucide React.
* **Client-Side Compression:** `browser-image-compression` or HTML5 Canvas Native API.

## 2. Backend, Database & Storage
* **Backend Runtime:** Next.js Server Actions & API Route Handlers on Node.js.
* **Database:** PostgreSQL via Supabase.
* **ORM / Database Client:** `@supabase/supabase-js` or Prisma ORM (Supabase native client preferred for lightweight serverless footprint).
* **Authentication:** Better Auth (Email + Password strategy with custom User Metadata / Profiles table).
* **File Storage:** Cloudinary Storage (Bucket: `bouquet-photos`, S3-compatible, persistent CDN URLs).

## 3. PDF Generation & Utilities
* **PDF Engine:** `@react-pdf/renderer` (Declarative React components generating precise A4 print layouts server-side).
* **Validation:** Zod (runtime validation for all form submissions and server action inputs).
* **Date Utilities:** `date-fns` (lightweight date formatting and month-range calculations).

## 4. Hosting & Infrastructure
* **Hosting Platform:** Vercel (Edge Middleware + Serverless Functions).
* **Database & Storage Host:** Cloudinary (Free Tier: 500MB DB, 1GB Storage, 2GB Bandwidth).