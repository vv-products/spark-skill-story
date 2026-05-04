ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_config jsonb,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS age integer;