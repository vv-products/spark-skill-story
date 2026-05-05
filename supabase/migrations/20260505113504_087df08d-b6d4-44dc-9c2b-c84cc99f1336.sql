
ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS age_groups text[] NOT NULL DEFAULT ARRAY['Explorer','Builder','Leader']::text[];
