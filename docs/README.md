 🌸 Bouquet Tracker & Field Operations (B-Tracker) - Documentation Root & Agent Guide

> **MANDATORY FOR AI CODING AGENTS (Cursor, Claude Code, GitHub Copilot, Windsurf, etc.):**
> Read this document in its entirety before inspecting code, proposing architecture, modifying files, or creating pull requests.

---

## 1. Project Purpose & Summary
B-Tracker is an internal web application designed for a flower decoration and florist business. It bridges the gap between field operational staff (**EMPLOYEE**) and the business manager/owner (**OWNER**):
1. **Field Staff:** Log bouquet installations in real-time with photo evidence, placement location, installation date, and flower item count (*pcs*). They also track and check off daily assigned tasks.
2. **Owner:** Maintain daily operational checklists, inspect submitted bouquets filtered by calendar month, export structured monthly PDF reports (strictly formatted: 3 bouquet posts per A4 sheet), and bulk-delete archived monthly photos to keep cloud storage consumption permanently minimal.

---

## 2. Directory & Source of Truth (SoT) Map
All foundational design and technical decisions live in `./docs/core/`. **Do NOT guess, reinvent, or contradict these files.**

| Document | Purpose & Scope | Agent Reading Priority |
| :--- | :--- | :---: |
| [`core/Architecture.md`](./core/Architecture.md) | High-level system architecture, client/server workflows, image processing pipeline, PDF generation engine. | **Critical (P0)** |
| [`core/Tech-Stack.md`](./core/Tech-Stack.md) | Canonical tech stack (framework, database, styling, libraries, runtime). No external dependencies beyond this list. | **Critical (P0)** |
| [`core/Environment.md`](./core/Environment.md) | Environment variables, local setup, secrets handling, production keys. | **High (P1)** |
| [`core/Config.md`](./core/Config.md) | App-wide constant configurations, file upload thresholds, compression specs, PDF layout dimensions. | **High (P1)** |
| [`core/Database.md`](./core/Database.md) | Canonical relational schema, PostgreSQL DDL, indices, foreign keys, Row Level Security (RLS) policies. | **Critical (P0)** |
| [`core/Requirement.md`](./core/Requirement.md) | Product scope, functional requirements, persona definitions, edge cases, failure states. | **High (P1)** |
| [`core/Feature.md`](./core/Feature.md) | Granular breakdown per module (Auth, Bouquet, Tasks, PDF Export, Bulk Storage Cleanup). | **High (P1)** |
| [`core/API-Contract.md`](./core/API-Contract.md) | Next.js Server Actions & API routes definitions, payload schemas, response formats, HTTP status codes. | **Critical (P0)** |
| [`core/Design.md`](./core/Design.md) | UI/UX specifications, responsive mobile/desktop layout guidelines, design tokens, PDF visual layout standard. | **Medium (P2)** |
| [`core/Phase.md`](./core/Phase.md) | Development roadmap, MVP checklist, v2 backlog, operational milestone sign-offs. | **Medium (P2)** |

---

## 3. Strict Development Rules for AI Agents
1. **Zero Registration Surface:** There is **NO public self-registration**. All employee accounts are provisioned exclusively by the Owner in the admin console.
2. **Mandatory Client-Side Image Compression:** Never upload raw 5MB-10MB mobile camera photos directly to cloud storage. Always compress images in the browser (max 1280px dimension, WebP/JPEG ~200KB-400KB) before transmitting.
3. **Strict PDF Layout Contract:** The monthly bouquet export PDF **must strictly render exactly 3 bouquet records per A4 page**, including photo preview, installation date, location name, flower piece count, and installer name.
4. **Storage Cleanliness:** Provide safe monthly bulk photo deletion capabilities so storage remains within free tiers indefinitely.
5. **Deterministic File Boundaries:** Keep logic modular. Server Actions handle data mutations and authorization; client components handle interactive state and camera/compression triggers.