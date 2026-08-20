-- Development Seed Data for Luna
-- DO NOT APPLY TO PRODUCTION AUTOMATICALLY

-- Note: Seed data creates public cat profiles and posts for UI showcase & local testing.
-- In production, user profiles & cats are dynamically created via Auth Signup.

-- Mock seed user IDs (UUID format)
DO $$
DECLARE
  u1 UUID := '11111111-1111-1111-1111-111111111111';
  u2 UUID := '22222222-2222-2222-2222-222222222222';
  u3 UUID := '33333333-3333-3333-3333-333333333333';
  c1 UUID := 'a1111111-1111-1111-1111-111111111111';
  c2 UUID := 'a2222222-2222-2222-2222-222222222222';
  c3 UUID := 'a3333333-3333-3333-3333-333333333333';
  c4 UUID := 'a4444444-4444-4444-4444-444444444444';
  c5 UUID := 'a5555555-5555-5555-5555-555555555555';
BEGIN
  -- Insert mock cats for showcase
  INSERT INTO public.cats (id, owner_id, name, age_years, breed, gender, country_code, bio, mood, streak_count, avatar_url)
  VALUES
    (c1, u1, 'Luna', 2, 'British Shorthair', 'Female', 'IND', 'Currently judging everyone from the sunbeam. 👑', '😴 Sleepy', 28, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600'),
    (c2, u2, 'Mochi', 1, 'Ragdoll', 'Male', 'JPN', 'Professional treat enthusiast and box explorer. 📦', '😸 Playful', 14, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600'),
    (c3, u2, 'Milo', 3, 'Scottish Fold', 'Male', 'USA', 'Master of nap positions and bird watching.', '🧐 Curious', 42, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=600'),
    (c4, u3, 'Nala', 4, 'Bengal', 'Female', 'GBR', 'Queen of midnight zoomies and high shelves.', '⚡ Energetic', 9, 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600'),
    (c5, u3, 'Simba', 2, 'Orange Tabby', 'Male', 'CAN', 'Only 1 brain cell, but maximum love to give. 🧡', '🥰 Loving', 21, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=600')
  ON CONFLICT (id) DO NOTHING;

  -- Insert mock posts
  INSERT INTO public.posts (cat_id, image_url, caption, mood, tags, likes_count, comments_count)
  VALUES
    (c1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800', 'She slept for six hours and is now tired from sleeping.', '😴 Sleepy', ARRAY['napping', 'lazyday', 'catlife'], 248, 12),
    (c2, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800', 'If I fits, I sits. The box belonged to a toaster.', '😸 Playful', ARRAY['boxes', 'mochi', 'cute'], 189, 8),
    (c3, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800', 'Watching the bird show outside the window. 10/10 rating.', '🧐 Curious', ARRAY['birds', 'windowview'], 312, 19),
    (c4, 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800', 'Conquered the refrigerator at 3 AM.', '⚡ Energetic', ARRAY['zoomies', 'highplaces'], 145, 6),
    (c5, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800', 'Thinking about food. Just food. Nothing else.', '🥰 Loving', ARRAY['orangecat', 'tabby'], 402, 34)
  ON CONFLICT DO NOTHING;
END $$;
