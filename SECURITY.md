# Luna Security & Privacy Architecture

## 1. Identity Isolation Model

Luna maintains a strict technical barrier between **Human Identity** (Private) and **Cat Identity** (Public).

- **Human Identity**: Email addresses, `auth.users` IDs, IP addresses, and security metadata are protected by Supabase Row Level Security (RLS) policies. No public endpoint or query returns human profile data.
- **Cat Identity**: All public posts, comments, likes, and messaging transactions reference public `cats(id)` records.

## 2. Controlled Mutual Identity Reveal Protocol

Identity reveal is strictly enforced server-side:

1. One-sided reveal requests state `status = 'pending'` and reveal zero identity details.
2. Status transitions to `accepted` (`MUTUALLY_REVEALED`) ONLY when both users in a conversation affirmatively consent.
3. Once mutually accepted, each user sees ONLY the specific fields (`first_name`, `country`, `social_handle`, `bio_note`) that the other user explicitly checked.

## 3. EXIF & Location Scrubbing

Photos uploaded to Luna pass through client-side HTML Canvas image processing (`stripExifAndProcessImage`), which strips camera headers, EXIF tags, device serial numbers, and precise GPS geolocation coordinates before uploading blobs to Supabase Storage.

## 4. User Isolation & Blocking

Blocking a user automatically:
- Filters out posts and comments from the blocked user.
- Prevents sending connection requests.
- Halts any ongoing messaging or identity reveal requests.
- Suppresses block status feedback to avoid harassment or leakage.
