# Luna 🐱 - Anonymous Cat Social Network

> **"People meet through their cats, not through their identities."**

Luna is a production-ready, privacy-first anonymous social platform built with Next.js, Supabase, TypeScript, and Tailwind CSS. Users create public profiles for their cats, share daily cat photos, interact anonymously, and build trust over time. Human identities remain strictly hidden unless both participants explicitly consent to a **Controlled Mutual Identity Reveal**.

---

## 🌟 Key Features

1. **Cat Identity First**: Users present themselves via their cat profiles (Name, Age, Breed, Country, Bio, Mood, Streak). Human name, email, and location are private.
2. **2-Way Controlled Mutual Identity Reveal**: Identity reveal requires explicit consent from both users. Each person independently selects which fields to disclose (First name, Country, Social handle, etc.).
3. **EXIF Metadata Stripping**: Uploaded cat photos are automatically scrubbed of all camera specs, timestamps, and GPS coordinates before being saved to storage.
4. **Anonymous Chat & Realtime Messaging**: End-to-end cat-to-cat messaging powered by Supabase Realtime.
5. **Safety, Block & Report**: Server-side user blocking and content reporting prevent harassment and isolate bad actors.
6. **Vercel Serverless Architecture**: Fully stateless backend designed for production deployment on Vercel and Supabase.

---

## 🏗️ Technology Stack

- **Frontend Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Auth**: Supabase PostgreSQL (with Row Level Security & Migrations) & Supabase Auth
- **Storage**: Supabase Storage (`cat-photos`, `cat-avatars` buckets)
- **Deployment**: Vercel

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/luna.git
cd luna
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migration
Apply the SQL migration file in `supabase/migrations/001_initial_schema.sql` to your Supabase project via the Supabase CLI or SQL Editor in the Dashboard.

Optionally seed development data:
```sql
-- Run supabase/seed.sql in Supabase SQL Editor
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Vercel Production Deployment

1. **Push Repository**: Push the project code to your GitHub account.
2. **Create Supabase Project**: Initialize a new project on Supabase and run `supabase/migrations/001_initial_schema.sql`.
3. **Import to Vercel**:
   - Connect your GitHub repository to Vercel.
   - Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
   - Click **Deploy**.
4. **Verify Live App**: Test signup, cat profile creation, EXIF photo upload, connection requests, anonymous chat, and 2-way identity reveal.

---

## 🛡️ Security & Privacy Highlights

See [`SECURITY.md`](file:///c:/Users/shiva/OneDrive/Documents/Luna/SECURITY.md) for full architectural documentation on:
- Row Level Security (RLS) policies enforcing identity boundaries.
- EXIF metadata removal pipeline.
- 2-sided identity consent protocol verification.
