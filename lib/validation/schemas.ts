import { z } from 'zod';

export const authSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .max(72, 'Password must be 72 characters or fewer.'),
});

export const catProfileSchema = z.object({
  name: z.string().min(1, 'Cat name is required.').max(50, 'Cat name too long.'),
  ageYears: z.coerce.number().min(0, 'Age cannot be negative.').max(35, 'Cat age seems unrealistically high.'),
  breed: z.string().max(50, 'Breed description too long.').optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  countryCode: z.string().max(3, 'Country code must be 3 letters (e.g. IND, JPN, USA).').optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio must be 300 characters or fewer.').optional().or(z.literal('')),
  mood: z.string().max(50).optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
});

export const postSchema = z.object({
  catId: z.string().uuid('Invalid cat selection.'),
  imageUrl: z.string().url('Image URL is required.'),
  caption: z.string().max(500, 'Caption must be 500 characters or fewer.').optional().or(z.literal('')),
  mood: z.string().max(50).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  postId: z.string().uuid('Invalid post selection.'),
  catId: z.string().uuid('Invalid cat selection.'),
  content: z.string().min(1, 'Comment cannot be empty.').max(300, 'Comment must be 300 characters or fewer.'),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation.'),
  senderCatId: z.string().uuid('Invalid sender cat.'),
  content: z.string().min(1, 'Message cannot be empty.').max(1000, 'Message cannot exceed 1000 characters.'),
});

export const identityRevealPermissionSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation.'),
  firstName: z.string().max(50, 'First name too long.').optional(),
  country: z.string().max(50, 'Country too long.').optional(),
  ageRange: z.string().max(30, 'Age range too long.').optional(),
  socialHandle: z.string().max(100, 'Social handle too long.').optional(),
  bioNote: z.string().max(250, 'Bio note too long.').optional(),
});

export const reportSchema = z.object({
  category: z.enum([
    'harassment',
    'stalking',
    'threats',
    'sexual_content',
    'hate',
    'spam',
    'impersonation',
    'inappropriate_content',
    'other',
  ]),
  description: z.string().min(5, 'Please provide details for your report.').max(1000),
  reportedUserId: z.string().uuid().optional(),
  reportedPostId: z.string().uuid().optional(),
});
