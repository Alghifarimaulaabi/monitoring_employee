# Database Schema & DDL Specification

The database runs on PostgreSQL (Supabase). Standard foreign keys, constraints, and Row Level Security (RLS) are enforced.

## 1. SQL Schema Definition (DDL)

```sql
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE');
CREATE TYPE task_status AS ENUM ('PENDING', 'COMPLETED');

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BOUQUET POSTS TABLE
CREATE TABLE public.bouquet_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    install_date DATE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    flower_count INTEGER NOT NULL CHECK (flower_count > 0),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASKS TABLE (Daily Operational Checklist)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    due_date DATE NOT NULL,
    status task_status NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INDICES FOR FAST FILTERING
CREATE INDEX idx_bouquet_posts_date ON public.bouquet_posts (install_date);
CREATE INDEX idx_bouquet_posts_user ON public.bouquet_posts (user_id);
CREATE INDEX idx_tasks_assigned_due ON public.tasks (assigned_to, due_date);
CREATE INDEX idx_tasks_status ON public.tasks (status);
```

## 2. Row Level Security (RLS) Policies

### `profiles`
* `SELECT`: Authenticated users can read all active profiles (needed to assign tasks and view author names).
* `INSERT`: Only `OWNER` can insert new profiles.
* `UPDATE`: Only `OWNER` can edit profile roles or deactivate accounts.

### `bouquet_posts`
* `SELECT`: All authenticated users can read bouquet posts.
* `INSERT`: Only `EMPLOYEE` and `OWNER` can create posts. `user_id` must match `auth.uid()`.
* `DELETE`: Only `OWNER` can delete posts (singular or bulk purge).

### `tasks`
* `SELECT`: `OWNER` can read all tasks. `EMPLOYEE` can only read tasks where `assigned_to = auth.uid()`.
* `INSERT/UPDATE (Details)`: Only `OWNER` can create or edit task details.
* `UPDATE (Status)`: Assigned `EMPLOYEE` can update `status` and `completed_at` for their own tasks.
* `DELETE`: Only `OWNER` can delete tasks.