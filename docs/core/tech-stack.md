# Canonical Tech Stack

This document locks the technical stack. Agents must not suggest or use alternative libraries unless agreed upon in open questions.

## 1. Frontend & Core Framework
* **Framework:** Next.js 16+ (App Router, Server Actions, React Server Components).
* **Language:** TypeScript 5+ (Strict Mode enabled).
* **Styling:** Tailwind CSS 4+.
* **Component Primitives:** Radix UI / Shadcn UI (accessible, unstyled accessible primitives).
* **Icons:** Lucide React.
* **Client-Side Compression:** `browser-image-compression` or HTML5 Canvas Native API.

## 2. Backend, Database & Storage
* **Backend Runtime:** Next.js Server Actions & API Route Handlers on Node.js.
* **Database:** PostgreSQL via Supabase.
* **ORM / Database Client:** Prisma ORM 7+ with `@prisma/adapter-pg`.
* **Authentication:** Better Auth (Email + Password strategy with Prisma adapter).
* **File Storage:** Supabase Storage (Bucket: `bouquet-photos`, persistent CDN URLs).

## 3. PDF Generation & Utilities
* **PDF Engine:** `@react-pdf/renderer` (Declarative React components generating precise A4 print layouts server-side).
* **Validation:** Zod (runtime validation for all form submissions and server action inputs).
* **Date Utilities:** `date-fns` (lightweight date formatting and month-range calculations).

## 4. Hosting & Infrastructure
* **Hosting Platform:** Vercel (Edge Middleware + Serverless Functions).
* **Database & Storage Host:** Supabase Cloud (PostgreSQL DB + Supabase Storage Bucket `bouquet-photos`).