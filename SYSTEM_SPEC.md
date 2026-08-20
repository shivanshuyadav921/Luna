# Luna System Minute Specifications

This document contains granular technical specifications for every module, database schema constraint, security verification rule, and state transition in Luna.

---

## 1. Database Schema Specifications & Constraints

### 1.1 `public.user_profiles`
- **PK**: `id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- **Fields**: `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, `is_suspended BOOLEAN DEFAULT FALSE`
- **RLS**: `SELECT` & `UPDATE` restricted to `auth.uid() = id`.

### 1.2 `public.cats`
- **PK**: `id UUID DEFAULT gen_random_uuid()`
- **FK**: `owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- **Fields**: `name TEXT NOT NULL`, `age_years INT`, `breed TEXT`, `gender TEXT`, `country_code VARCHAR(3)`, `bio TEXT`, `mood TEXT`, `avatar_url TEXT`, `streak_count INT`, `last_posted_at TIMESTAMPTZ`
- **Indexes**: `idx_cats_owner_id`, `idx_cats_created_at`
- **RLS**: `SELECT` public; `INSERT`/`UPDATE`/`DELETE` restricted to `owner_id = auth.uid()`.

### 1.3 `public.posts`
- **PK**: `id UUID DEFAULT gen_random_uuid()`
- **FK**: `cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE`
- **Fields**: `image_url TEXT NOT NULL`, `caption TEXT`, `mood TEXT`, `tags TEXT[]`, `likes_count INT DEFAULT 0`, `comments_count INT DEFAULT 0`
- **Indexes**: `idx_posts_cat_id`, `idx_posts_created_at`

### 1.4 `public.connection_requests` & `public.connections`
- **Unique Constraint**: `UNIQUE(sender_cat_id, receiver_cat_id)`
- **Statuses**: `'pending'`, `'accepted'`, `'declined'`
- **Connection Creation Trigger**: Accepting a connection request automatically inserts a `connections` record and initializes a `conversations` record.

### 1.5 `public.identity_reveal_requests` & `permissions`
- **Statuses**: `'pending'`, `'accepted'`, `'declined'`
- **Permissions Schema**:
  - `first_name TEXT`
  - `country TEXT`
  - `age_range TEXT`
  - `social_handle TEXT`
  - `bio_note TEXT`
- **Mutual Reveal Condition**: Partner permissions are returned by `actions/identity.ts` ONLY when an accepted reveal request exists for that specific `conversation_id`.

---

## 2. Granular Module Specifications

### 2.1 EXIF Metadata Stripping Engine (`lib/security/image.ts`)
- **Input**: `File` object from `<input type="file">`
- **Canvas Operations**:
  1. `FileReader` loads image data into `HTMLImageElement`.
  2. Dynamic aspect-ratio scaling bounds max width/height to 1600px.
  3. `CanvasRenderingContext2D.drawImage()` renders raw pixel buffer.
  4. `HTMLCanvasElement.toBlob('image/jpeg', 0.88)` produces a fresh JPEG binary blob stripped of EXIF, IPTC, and XMP headers.

### 2.2 Anonymous Realtime Chat Engine (`components/messaging/ChatWindow.tsx`)
- **Subscription**: Supabase Realtime channel listening on `postgres_changes` for `INSERT` events in `messages` where `conversation_id = :id`.
- **State Handlers**: Deduplicates incoming messages by `id` to merge server pushes seamlessly with optimistic UI state.

### 2.3 User Block & Isolation Subsystem (`actions/safety.ts`)
- **Table**: `public.blocks (blocker_user_id, blocked_user_id)`
- **SQL Function**: `public.is_blocked(user_a, user_b)` returns `BOOLEAN`.
- **Isolation Effect**: Content, connection requests, and direct messages between blocked accounts are excluded server-side and by RLS policies.

---

## 3. Environment Variables & Production Audit Checklist

| Variable Name | Required Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Browser & Server) | API entrypoint URL for Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Browser & Server) | Anon key for client & RLS authenticated calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Server ONLY (Forbidden in browser) | Service role key for admin verification |

### Final Verification Commands
```bash
npx tsc --noEmit   # Type check (Must pass with 0 errors)
npm run lint       # ESLint check (Must pass cleanly)
npm run build      # Vercel production bundle build (Must pass cleanly)
```
