# Environment Variables & Configuration

## 1. Environment Variables Template (`.env.example`)

```env
# Next.js Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Public Keys (Safe for client-side)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Private Keys (SERVER-SIDE ONLY - NEVER EXPOSE TO CLIENT)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Storage Config
NEXT_PUBLIC_STORAGE_BUCKET_BOUQUET="bouquet-photos"

# App Defaults
MAX_IMAGE_FILE_SIZE_MB="10"
MAX_COMPRESSED_WIDTH="1280"
```

## 2. Environment Security Rules
1. Variables prefixed with `NEXT_PUBLIC_` are bundled into client JavaScript. Never place `SUPABASE_SERVICE_ROLE_KEY` or admin tokens in public variables.
2. Server Actions handling storage deletion, user creation, and role promotion must use the Supabase Service Role client to bypass RLS policies safely after verifying session roles.
3. In local development, copy `.env.example` to `.env.local`. Do NOT commit `.env.local` to Git.