
CREATE TABLE public.friend_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.friend_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read codes"
  ON public.friend_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert their own code"
  ON public.friend_codes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own code"
  ON public.friend_codes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER friend_codes_set_updated_at
  BEFORE UPDATE ON public.friend_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.friendship_status AS ENUM ('pending','accepted','declined');

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_distinct CHECK (requester_id <> addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX friendships_unique_pair
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX friendships_requester_idx ON public.friendships (requester_id);
CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id);

CREATE POLICY "Read own friendships"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Send friend request"
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Update own friendship"
  ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Delete own friendship"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER friendships_set_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_friend_leaderboard(_limit integer DEFAULT 50)
RETURNS TABLE(user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text, age integer, bio text, total_xp bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  friend_ids AS (
    SELECT (SELECT uid FROM me) AS id
    UNION
    SELECT CASE WHEN f.requester_id = (SELECT uid FROM me) THEN f.addressee_id ELSE f.requester_id END
    FROM public.friendships f, me
    WHERE f.status = 'accepted'
      AND ((SELECT uid FROM me) IN (f.requester_id, f.addressee_id))
  )
  SELECT
    p.id, p.display_name, p.avatar_config, a.image_url, p.age, p.bio,
    COALESCE(SUM(x.amount), 0)::bigint
  FROM public.profiles p
  JOIN friend_ids fi ON fi.id = p.id
  LEFT JOIN public.avatars a ON a.id = p.avatar_id
  LEFT JOIN public.xp_events x ON x.user_id = p.id
  GROUP BY p.id, a.image_url
  ORDER BY 7 DESC, p.display_name ASC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$$;

CREATE OR REPLACE FUNCTION public.lookup_friend_code(_code text)
RETURNS TABLE(user_id uuid, display_name text, avatar_image_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.display_name, a.image_url
  FROM public.friend_codes fc
  JOIN public.profiles p ON p.id = fc.user_id
  LEFT JOIN public.avatars a ON a.id = p.avatar_id
  WHERE upper(fc.code) = upper(_code)
  LIMIT 1;
$$;
