# API & Server Actions Contract

This project uses Next.js Server Actions for mutations and standard Route Handlers for file streaming.

## 1. Server Actions

### `createUserAction(formData: CreateUserDTO): Promise<ActionResult>`
* **Caller:** Owner only.
* **Input Schema:**
  ```typescript
  z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['EMPLOYEE', 'OWNER'])
  })
  ```
* **Response:** `{ success: boolean, userId?: string, error?: string }`

### `createBouquetPostAction(formData: FormData): Promise<ActionResult>`
* **Caller:** Authenticated Employee / Owner.
* **Input (FormData):**
  - `file`: File (Compressed binary image)
  - `install_date`: String (YYYY-MM-DD)
  - `location_name`: String (min 3 chars)
  - `flower_count`: Number (integer > 0)
* **Response:** `{ success: boolean, postId?: string, error?: string }`

### `toggleTaskStatusAction(taskId: string, isCompleted: boolean): Promise<ActionResult>`
* **Caller:** Assigned Employee or Owner.
* **Input:** `taskId: string`, `isCompleted: boolean`.
* **Response:** `{ success: boolean, status: 'PENDING' | 'COMPLETED', error?: string }`

### `deleteMonthlyPhotosAction(month: number, year: number, confirmToken: string): Promise<ActionResult>`
* **Caller:** Owner only.
* **Input:** `month: 1-12`, `year: number`, `confirmToken: 'HAPUS'`.
* **Behavior:** Bulk deletes storage objects under `bouquet-photos/{year}-{month}/*` and updates database records.
* **Response:** `{ success: boolean, deletedCount: number, error?: string }`

---

## 2. Route Handlers

### `GET /api/reports/bouquet-pdf`
* **Query Params:** `?month=9&year=2026`
* **Headers:** Cookie session (Owner only).
* **Response:**
  - `200 OK`: Binary stream (`Content-Type: application/pdf`).
  - `400 Bad Request`: Missing or invalid query parameters.
  - `403 Forbidden`: Caller is not an Owner.
  - `404 Not Found`: No bouquet records found for the selected period.