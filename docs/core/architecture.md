# System Architecture

## 1. High-Level Architecture Overview
B-Tracker is built as a single, unified full-stack application using **Next.js (App Router)** hosted on Vercel, paired with **Supabase** for PostgreSQL database, authentication, and binary object storage.

```

|                                CLIENT +-------------------------------------------------------------------------------+DEVICES                                 |
|                                                                               |
|   [ Mobile Browser (Field Employee) ]          [ Desktop/Tablet Browser (Owner) ]
|         - Native Camera / Gallery                     - Task Management       |
|         - Client-side Canvas Compression              - Monthly Filter        |
|         - Daily Task Checklist                        - PDF Export & Purge    |
+-------------------------------------------------------------------------------+
                                      |
                                      | HTTPS (JSON / Multipart Form Data)
                                      v
+-------------------------------------------------------------------------------+
|                       NEXT.JS APP ROUTER (Vercel Serverless)                  |
|                                                                               |
|  - Middleware: Session Auth & Role-Based Route Guards (Owner vs Employee)    |
|  - Server Actions & Route Handlers: API contracts & business logic            |
|  - PDF Generation Engine: Server-side rendering (React-PDF / Puppeteer-lite)  |
+-------------------------------------------------------------------------------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
+-------------------------------------+   +-------------------------------------+
|         SUPABASE POSTGRESQL         |   |       SUPABASE STORAGE BUCKET       |
|  - Auth Schema (users, sessions)    |   |  - Bucket: `bouquet-photos`         |
|  - App Schema (posts, tasks)        |   |  - Public read via signed/CDN URLs  |
|  - Row Level Security (RLS)         |   |  - Auto-deletion on monthly purge   |
+-------------------------------------+   +-------------------------------------+
```

---

## 2. Core Operational Pipelines

### A. Bouquet Submission Pipeline (Mobile Staff)
1. Karyawan captures or selects an image via `<input type="file" accept="image/*" capture="environment">`.
2. **Browser Compression Worker:** An HTML5 Canvas / `browser-image-compression` routine downscales the image to a maximum bounding box of 1280x1280px at 0.8 quality, reducing file size to ~250KB.
3. Client dispatches a `multipart/form-data` payload containing compressed image + metadata (`install_date`, `location_name`, `flower_count`) to Next.js Server Action.
4. Server verifies the session (`auth.uid()`), checks role permissions, streams the image into Supabase Storage (`bouquet-photos/YYYY-MM/UUID.webp`), and writes record to PostgreSQL `bouquet_posts`.
5. UI displays an immediate confirmation toast and clears the form.

### B. PDF Export Pipeline (Owner Desktop)
1. Owner selects target `Month` and `Year` (e.g., September 2026) and clicks **"Export PDF"**.
2. Client issues a request to `/api/reports/bouquet-pdf?month=09&year=2026`.
3. Server queries all bouquet posts for that period with author names, ordered chronologically.
4. Server parses posts in batches of 3 items per page.
5. Node.js renders the document using `@react-pdf/renderer` into a binary stream and returns `Content-Type: application/pdf; Content-Disposition: attachment; filename="bouquet-report-09-2026.pdf"`.

### C. Monthly Bulk Cleanup Pipeline (Storage Conservation)
1. Owner triggers "Hapus Foto Bulan Ini" for a specific month.
2. Modal prompts confirmation keyword: `HAPUS`.
3. Server Action verifies caller is `OWNER`.
4. Storage worker queries all storage paths within `bouquet-photos/YYYY-MM/*` and executes bulk delete via Supabase Storage API.
5. Associated database records are either deleted or updated with `image_url = NULL` and status flag `archived`.