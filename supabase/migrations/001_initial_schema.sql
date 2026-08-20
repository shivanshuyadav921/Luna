-- Luna Database Schema & Row Level Security Migration
-- Phase 2: Schema + RLS Policies + Storage Config + Functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_suspended BOOLEAN DEFAULT FALSE NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. CATS (Public Identity)
CREATE TABLE IF NOT EXISTS public.cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_years INT DEFAULT 0,
  breed TEXT,
  gender TEXT,
  country_code VARCHAR(3),
  bio TEXT,
  mood TEXT DEFAULT '😸 Happy',
  avatar_url TEXT,
  streak_count INT DEFAULT 0 NOT NULL,
  last_posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cats_owner_id ON public.cats(owner_id);
CREATE INDEX IF NOT EXISTS idx_cats_created_at ON public.cats(created_at DESC);

ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;

-- 3. POSTS (Daily Cat Posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0 NOT NULL,
  comments_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_cat_id ON public.posts(cat_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 5. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 6. CONNECTION REQUESTS
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  receiver_cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(sender_cat_id, receiver_cat_id)
);

CREATE INDEX IF NOT EXISTS idx_conn_req_receiver ON public.connection_requests(receiver_cat_id, status);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- 7. CONNECTIONS
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_a_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  cat_b_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(cat_a_id, cat_b_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_cat_a ON public.connections(cat_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_cat_b ON public.connections(cat_b_id);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 8. CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID UNIQUE REFERENCES public.connections(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 9. CONTROLLED MUTUAL IDENTITY REVEAL
CREATE TABLE IF NOT EXISTS public.identity_reveal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  requester_cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  receiver_cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  responded_at TIMESTAMPTZ
);

ALTER TABLE public.identity_reveal_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.identity_reveal_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  country TEXT,
  age_range TEXT,
  social_handle TEXT,
  bio_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.identity_reveal_permissions ENABLE ROW LEVEL SECURITY;

-- 10. BLOCKS & REPORTS
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(blocker_user_id, blocked_user_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Helper: Check if user_a blocks user_b or vice-versa
CREATE OR REPLACE FUNCTION public.is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_user_id = user_a AND blocked_user_id = user_b)
       OR (blocker_user_id = user_b AND blocked_user_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically update likes & comments count on posts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'post_likes') THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE' AND TG_TABLE_NAME = 'post_likes') THEN
    UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'post_comments') THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE' AND TG_TABLE_NAME = 'post_comments') THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE OR REPLACE TRIGGER trg_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Trigger: Auto-create user profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
--------------------------------------------------------------------------------

-- User Profiles: Only user can view/update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Cats: Public read, owner insert/update/delete
CREATE POLICY "Public can view cats"
  ON public.cats FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own cats"
  ON public.cats FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own cats"
  ON public.cats FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own cats"
  ON public.cats FOR DELETE
  USING (auth.uid() = owner_id);

-- Posts: Public read, owner insert/update/delete via cat ownership
CREATE POLICY "Public can view posts"
  ON public.posts FOR SELECT
  USING (TRUE);

CREATE POLICY "Cat owners can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE id = cat_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Cat owners can delete their posts"
  ON public.posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE id = cat_id AND owner_id = auth.uid()
    )
  );

-- Likes & Comments
CREATE POLICY "Public can view likes" ON public.post_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view comments" ON public.post_comments FOR SELECT USING (TRUE);
CREATE POLICY "Cat owners can insert comments" ON public.post_comments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.cats WHERE id = cat_id AND owner_id = auth.uid()));

-- Connection Requests & Connections
CREATE POLICY "Cat owners can view connection requests" ON public.connection_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = sender_cat_id OR id = receiver_cat_id) AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Cat owners can insert connection requests" ON public.connection_requests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cats WHERE id = sender_cat_id AND owner_id = auth.uid())
  );

CREATE POLICY "Cat owners can update connection requests" ON public.connection_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = sender_cat_id OR id = receiver_cat_id) AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Cat owners can view connections" ON public.connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = cat_a_id OR id = cat_b_id) AND owner_id = auth.uid()
    )
  );

-- Conversations & Messages
CREATE POLICY "Connection participants can view conversation" ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections conn
      JOIN public.cats c1 ON conn.cat_a_id = c1.id
      JOIN public.cats c2 ON conn.cat_b_id = c2.id
      WHERE conn.id = connection_id AND (c1.owner_id = auth.uid() OR c2.owner_id = auth.uid())
    )
  );

CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations conv
      JOIN public.connections conn ON conv.connection_id = conn.id
      JOIN public.cats c1 ON conn.cat_a_id = c1.id
      JOIN public.cats c2 ON conn.cat_b_id = c2.id
      WHERE conv.id = conversation_id AND (c1.owner_id = auth.uid() OR c2.owner_id = auth.uid())
    )
  );

CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cats WHERE id = sender_cat_id AND owner_id = auth.uid())
  );

-- Identity Reveal Requests & Permissions
CREATE POLICY "Participants can view reveal requests" ON public.identity_reveal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = requester_cat_id OR id = receiver_cat_id) AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Participants can insert reveal request" ON public.identity_reveal_requests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cats WHERE id = requester_cat_id AND owner_id = auth.uid())
  );

CREATE POLICY "Participants can update reveal request" ON public.identity_reveal_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = requester_cat_id OR id = receiver_cat_id) AND owner_id = auth.uid()
    )
  );

-- Reveal Permissions: User can view permissions if BOTH users accepted reveal in conversation
CREATE POLICY "User can manage their own reveal permissions" ON public.identity_reveal_permissions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Participants can view partner permissions if reveal accepted" ON public.identity_reveal_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.identity_reveal_requests
      WHERE conversation_id = identity_reveal_permissions.conversation_id
        AND status = 'accepted'
    )
  );

-- Blocks & Reports
CREATE POLICY "Users can manage own blocks" ON public.blocks FOR ALL USING (auth.uid() = blocker_user_id);
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- STORAGE BUCKETS CONFIGURATION (SQL helper)
--------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-photos', 'cat-photos', true), ('cat-avatars', 'cat-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public bucket access for cat-photos" ON storage.objects FOR SELECT USING (bucket_id = 'cat-photos');
CREATE POLICY "Authenticated users upload cat-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cat-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public bucket access for cat-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'cat-avatars');
CREATE POLICY "Authenticated users upload cat-avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cat-avatars' AND auth.role() = 'authenticated');
