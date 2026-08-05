# Give Liam editor access

Goal: `liam@gmail.com` can sign in at `/studio` and edit content.

## What I found

An account with display name **Liam** was created a moment ago (05:19 today) and currently has **no role**, so the Studio shows him the "You don't have editor access yet" screen. Only one account (Admin) has roles today.

Note: account email addresses aren't readable from here, so I'm matching on that just-created "Liam" profile. If that's not the right person, tell me and I'll adjust.

## Change

- Add an **editor** role row for the Liam account (`5526f80c-…`) in the roles table. Nothing else changes — no admin rights, no schema changes.

After that, he signs in at `/studio` (existing password) and gets full editor access; if he's already signed in, the "Refresh access" button on the no-access screen picks it up.

## Technical note

Single data insert into `public.user_roles` with `role = 'editor'`, guarded against duplicates by the existing unique constraint on (user_id, role).
