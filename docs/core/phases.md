# Development Phases & Roadmap

## Phase 1: Environment & Authentication Setup (Milestone 1)
- [x] Initialize Next.js 16 project with TypeScript & Tailwind CSS v4.
- [x] Set up Supabase project (PostgreSQL + Better Auth + Supabase Storage).
- [x] Execute database schema (`users`, `sessions`, `accounts`, `verifications`, `bouquet_posts`, `tasks`) via Prisma.
- [x] Implement login page and session middleware for role guards (`/employee/*` vs `/owner/*`).
- [x] Implement manual employee creation in owner admin panel.


## Phase 2: Bouquet Submission & Client Compression (Milestone 2)
- [x] Build employee upload form (Camera capture, Date, Location, Flower count).
- [x] Integrate client-side canvas compression (`browser-image-compression` / HTML5 Canvas).
- [x] Implement Next.js Server Action to pipe files into Supabase Storage.
- [x] Add toast feedback and basic submission history list.

## Phase 3: Daily Task Management (Milestone 3)
- [x] Build Owner Task management view (create task, assign to employee, set date).
- [x] Build Employee daily checklist view (filter tasks for `today`, checkbox status toggle).
- [x] Optimistic UI state updates for checklist clicks.

## Phase 4: Bouquet Gallery, Monthly Filter & PDF Export (Milestone 4)
- [x] Build Owner bouquet visual gallery with Month/Year dropdown filter and full-resolution lightbox modal.
- [x] Implement `@react-pdf/renderer` route handler (`/api/reports/bouquet-pdf`) generating consolidated 1-month PDF report formatted strictly with 3 items per A4 sheet.
- [x] Test PDF layout rendering with varied text lengths, metrics summary, and photo aspect ratios.

## Phase 5: Storage Purge Feature & Production Hardening (Milestone 5)
- [x] Implement monthly bulk photo deletion dialog with `HAPUS` text confirmation.
- [x] Verify storage deletion (Supabase/local fallback) and DB record archiving (`isArchived = true`, `imageUrl = ''`).
- [x] Final end-to-end testing across real mobile browsers and desktop monitors.