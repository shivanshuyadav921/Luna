# Luna System Architecture

Luna is a production-grade, privacy-first anonymous social network where user interactions are anchored strictly around cat identities. This document details the high-level system architecture, technical design decisions, and privacy boundaries.

---

## 1. High-Level System Architecture

```text
[ User Client (Browser / Mobile) ]
           │
           │ HTTPS / WSS (Supabase Realtime)
           ▼
[ Next.js 14+ Application on Vercel ]
   ├── App Router (Server Components & Route Handlers)
   ├── Client Components (Framer Motion, Canvas EXIF Cleaner)
   └── Server Actions (Auth, Cats, Posts, Messages, Safety)
           │
           │ @supabase/ssr (Session Cookies & JWT)
           ▼
[ Supabase Infrastructure ]
   ├── Auth Engine (Email/Password, JWT handling)
   ├── PostgreSQL Engine (Tables, Triggers, RLS Policies)
   └── Storage Engine (`cat-photos`, `cat-avatars` buckets)
```

---

## 2. The Identity Dual-Model

Luna maintains two distinct identity layers:

```text
┌─────────────────────────────────────────────────────────────┐
│                 1. PRIVATE HUMAN IDENTITY                   │
│   auth.users / user_profiles                                │
│   - email, auth user_id, session tokens, block records     │
│   - NEVER exposed in public API responses or client state   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (1:N Ownership)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  2. PUBLIC CAT IDENTITY                     │
│   public.cats                                               │
│   - cat name, age, breed, country, bio, mood, avatar, streak│
│   - Primary public identifier for posts, likes, messages     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow & Security Boundaries

### A. Data Fetching & Row Level Security (RLS)
- Every PostgreSQL table enforces RLS.
- Public tables (`cats`, `posts`, `post_likes`, `post_comments`) allow public SELECT queries, but return only cat metadata—never the human owner's email or identity.
- Private tables (`conversations`, `messages`, `identity_reveal_permissions`) allow SELECT/INSERT ONLY for authenticated participants of the associated connection.

### B. EXIF & Privacy Pipeline
```text
User Selects Image File
       │
       ▼
Client Canvas Processing (`stripExifAndProcessImage`)
       ├── Re-draws image onto HTML Canvas context
       ├── Erases EXIF headers, camera specs, timestamp & GPS data
       └── Re-exports clean JPEG blob
       │
       ▼
Supabase Storage Upload (`cat-photos` / `cat-avatars`)
```

---

## 4. Controlled Mutual Identity Reveal Flow

Identity reveal requires two-sided explicit consent:

```text
User A (Cat A)                             User B (Cat B)
   │                                          │
   ├─ Request Reveal + Select Shared Fields ─►│ (Status: Pending)
   │                                          │
   │◄─ Accept Reveal + Select Shared Fields ──┤
   │                                          │
   ▼                                          ▼
[ Status: MUTUALLY_REVEALED ]         [ Status: MUTUALLY_REVEALED ]
(Only User A's consented fields       (Only User B's consented fields
 displayed to User B)                  displayed to User A)
```

---

## 5. Deployment Architecture (Vercel Serverless)

- **Stateless Serverless Execution**: Server Actions and API Route Handlers execute within Vercel's Edge/Serverless functions.
- **Session Management**: Auth tokens are stored in secure HTTP-only cookies via `@supabase/ssr` middleware.
- **Persistent Media**: Images are stored in Supabase Storage buckets, ensuring Vercel deployment has no dependency on local persistent disk storage.
