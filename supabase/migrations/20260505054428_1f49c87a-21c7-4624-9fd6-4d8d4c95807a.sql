CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit int DEFAULT 20)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_config jsonb,
  age int,
  bio text,
  total_xp bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    p.display_name,
    p.avatar_config,
    p.age,
    p.bio,
    COALESCE(SUM(x.amount), 0)::bigint AS total_xp
  FROM public.profiles p
  LEFT JOIN public.xp_events x ON x.user_id = p.id
  GROUP BY p.id
  ORDER BY total_xp DESC, p.display_name ASC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO authenticated, anon;