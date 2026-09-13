# Requirements & Scope Specification

## 1. Problem Statement
Florist and venue decoration businesses struggle with disorganized photo proof sent through instant messaging apps. Proof lacks standardized metadata (exact installation date, venue/room name, and piece count), leading to client disputes and time-consuming end-of-month manual reporting. Furthermore, staff lack a synchronized daily task checklist.

## 2. User Roles & Capabilities
1. **Field Employee:**
   * Log into mobile web interface.
   * View assigned daily tasks and toggle completion status.
   * Submit bouquet installation record: Camera capture / photo picker, install date, venue location text, and flower piece count.
   * View personal submission history.
2. **Owner / Manager:**
   * Manage employees: Register new accounts manually (email, name, temporary password).
   * Manage tasks: Create daily tasks, assign to specific staff, and view real-time completion state.
   * Bouquet Gallery: Filter all installations by Month & Year (e.g. September 2026).
   * Export PDF: One-click export of monthly bouquets structured strictly with 3 records per A4 page.
   * Storage Clean-up: Bulk-delete photos from prior months after PDF export.

## 3. Scope Boundaries (MVP)
* **In-Scope:** Single-tenant setup, mobile-first responsive layout, client compression, manual location text input, 3-items-per-sheet PDF generation, bulk monthly delete.
* **Out-of-Scope:** GPS geofencing, multi-tenant billing, customer self-service portal, real-time web-socket chat, payment processing.