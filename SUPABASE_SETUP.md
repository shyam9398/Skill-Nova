# SkillNova: Supabase Infrastructure & Deployment Guide

This document outlines the step-by-step setup required to connect SkillNova to a production Supabase instance with Row Level Security (RLS), private storage buckets, and secure server-side AI functions.

---

## 1. Create a Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and select your organization.
3. Name your project (e.g., `skillnova-lms`) and set a strong database password.
4. Choose the hosting region closest to your student cohort (e.g., `ap-south-1` for India).

---

## 2. Execute Database Schema & Migrations

1. In your Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Open [`supabase/schema.sql`](file:///c:/Users/burla/Desktop/skill%20nova/supabase/schema.sql) in this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. This will create:
   - All 26 relational tables (`profiles`, `user_roles`, `students`, `courses`, `modules`, `topics`, `learning_resources`, `discussion_posts`, `mentor_requests`, etc.)
   - Foreign key constraints, UUID primary keys, and performance indexes.
   - Row Level Security (RLS) policies ensuring students only access their own enrolled courses, private mentor requests, and public discussions.

---

## 3. Storage Buckets Configuration

Navigate to **Storage** in the Supabase Dashboard:

1. **`course-materials`** (Private Bucket):
   - For PDFs, presentations (PPTX), and lecture supplementary documents.
   - Add RLS policy: Read access restricted to enrolled students and staff; write access restricted to staff (`is_sub_admin_or_admin`).
2. **`course-roadmaps`** (Public Bucket):
   - For floating interactive roadmap images (PNG, WebP, SVG).
   - Public read access enabled for smooth CDN caching.
3. **`ai-docs`** (Private Bucket):
   - For administrative uploads processed by the AI Content Generator.

---

## 4. Secure Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the public keys from **Project Settings > API**:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

### Security Rule
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in frontend code or in `.env` files.
- The browser only requires `VITE_SUPABASE_ANON_KEY`, which is safeguarded by Row Level Security.

---

## 5. Secure Edge Functions (Gemini AI Processing)

Deploy the serverless AI Content Generator function using Supabase CLI:

```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your local project
supabase link --project-ref your-project-ref

# 3. Set the Gemini API secret securely on the server
supabase secrets set GEMINI_API_KEY="your-google-gemini-api-key"

# 4. Deploy the edge function
supabase functions deploy generate-learning-content
```

---

## 6. Creating the First Super Administrator Account

Because public registration is disabled:

1. In Supabase Dashboard, go to **Authentication > Users** and click **Add User**.
2. Enter email: `admin@skillnova.edu` and set a secure password.
3. Copy the generated User UUID.
4. Run this query in the SQL Editor to grant Super Admin privileges:

```sql
-- Insert profile
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES ('<USER-UUID>', 'admin@skillnova.edu', 'Dr. Evelyn Reed', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
ON CONFLICT (id) DO NOTHING;

-- Grant Admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER-UUID>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 7. Verifying Session Persistence & Token Refresh

SkillNova includes automated token refresh and local session caching via `supabase.auth.onAuthStateChange`. Refreshing pages or navigating between courses maintains authenticated state continuously.
