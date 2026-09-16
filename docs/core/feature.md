# Feature Breakdown & Acceptance Criteria

## Feature 1: Manual Employee Provisioning (Owner)
* **Description:** Owner creates staff accounts from the Admin settings.
* **Acceptance Criteria:**
  - Owner enters: Full Name, Email, Password.
  - Role defaults to `EMPLOYEE`.
  - Account is immediately usable for login.
  - Public registration route `/register` must return 404.

## Feature 2: Bouquet Submission with Client-Side Compression
* **Description:** Staff submits installation proof from the field.
* **Acceptance Criteria:**
  - Mandatory fields: Photo, Date, Location, Flower count (*pcs*).
  - Browser automatically downscales photo to maximum 1280px dimension at 80% quality.
  - Upload shows progress spinner.
  - Displays instant success confirmation upon completion.

## Feature 3: Daily Task Checklist
* **Description:** Operational task board.
* **Acceptance Criteria:**
  - Owner creates task with: Title, Description (optional), Assignee, Due Date.
  - Employee dashboard displays list for `today`.
  - Toggling checkbox immediately updates status (`PENDING` <-> `COMPLETED`) via optimistic UI update.

## Feature 4: Monthly Bouquet Gallery & Filter
* **Description:** Owner visual dashboard to inspect proof.
* **Acceptance Criteria:**
  - Dropdown to select Month and Year.
  - Displays responsive card grid with image thumbnail, date, venue name, flower count, and employee name.
  - Clicking thumbnail opens modal with full-size image.

## Feature 5: Structured PDF Export (Consolidated Monthly Report)
* **Description:** One-click consolidated PDF generation for documentation and client submission. The export compiles all bouquet installations and photos for the entire selected month into a single downloadable PDF file (bukan export per lembar atau per item).
* **Acceptance Criteria:**
  - Single action button "Export PDF (Bulan Ini)" downloads the entire month's collection of bouquet installations in one unified PDF document.
  - Strict pagination inside document: Exactly 3 bouquet items per A4 sheet with 4:3 photo containers.
  - Each item block displays: photo image, date, location name, flower piece count, and staff name.
  - Header displays report title, month period, total items count, total flowers pcs, and export timestamp.
  - Footer displays page numbering: `Halaman X dari Y`.

## Feature 6: Bulk Monthly Photo Cleanup
* **Description:** Safeguard cloud storage limits by purging old assets.
* **Acceptance Criteria:**
  - Owner selects month and clicks "Hapus Semua Foto Bulan Ini".
  - Double confirmation modal requires typing the word `HAPUS`.
  - Deletes physical image files from Supabase Storage.
  - Database records are updated to retain metadata history while nullifying image URL.