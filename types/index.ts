export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  is_suspended: boolean;
}

export interface Cat {
  id: string;
  owner_id: string;
  name: string;
  age_years: number;
  breed?: string | null;
  gender?: string | null;
  country_code?: string | null;
  bio?: string | null;
  mood?: string | null;
  avatar_url?: string | null;
  streak_count: number;
  last_posted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  cat_id: string;
  image_url: string;
  caption?: string | null;
  mood?: string | null;
  tags?: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  cat?: Cat;
  user_has_liked?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  cat_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  cat_id: string;
  content: string;
  created_at: string;
  cat?: Cat;
}

export interface ConnectionRequest {
  id: string;
  sender_cat_id: string;
  receiver_cat_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  sender_cat?: Cat;
  receiver_cat?: Cat;
}

export interface Connection {
  id: string;
  cat_a_id: string;
  cat_b_id: string;
  created_at: string;
  cat_a?: Cat;
  cat_b?: Cat;
}

export interface Conversation {
  id: string;
  connection_id: string;
  last_message_at: string;
  created_at: string;
  connection?: Connection;
  other_cat?: Cat;
  latest_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_cat_id: string;
  content: string;
  created_at: string;
  sender_cat?: Cat;
}

export interface IdentityRevealRequest {
  id: string;
  conversation_id: string;
  requester_cat_id: string;
  receiver_cat_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at?: string | null;
}

export interface IdentityRevealPermission {
  id: string;
  conversation_id: string;
  user_id: string;
  first_name?: string | null;
  country?: string | null;
  age_range?: string | null;
  social_handle?: string | null;
  bio_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string | null;
  reported_post_id?: string | null;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_cat_id?: string | null;
  type: string;
  entity_id?: string | null;
  is_read: boolean;
  created_at: string;
  actor_cat?: Cat;
}
