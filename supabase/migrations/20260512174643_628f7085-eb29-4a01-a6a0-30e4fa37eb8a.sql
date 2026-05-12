DROP FUNCTION IF EXISTS public.get_leaderboard(integer);
DROP FUNCTION IF EXISTS public.get_friend_leaderboard(integer);

CREATE FUNCTION public.get_leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text, age integer, bio text, total_xp bigint, level integer, stars bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id, p.display_name, p.avatar_config, a.image_url, p.age, p.bio,
    COALESCE(SUM(x.amount), 0)::bigint AS total_xp,
    (FLOOR(COALESCE(SUM(x.amount), 0) / 100.0) + 1)::int AS level,
    COUNT(x.id)::bigint AS stars
  FROM public.profiles p
  LEFT JOIN public.avatars a ON a.id = p.avatar_id
  LEFT JOIN public.xp_events x ON x.user_id = p.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role IN ('admin'::app_role, 'editor'::app_role)
  )
  GROUP BY p.id, a.image_url
  ORDER BY level DESC, stars DESC, total_xp DESC, p.display_name ASC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$function$;

CREATE FUNCTION public.get_friend_leaderboard(_limit integer DEFAULT 50)
 RETURNS TABLE(user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text, age integer, bio text, total_xp bigint, level integer, stars bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    COALESCE(SUM(x.amount), 0)::bigint AS total_xp,
    (FLOOR(COALESCE(SUM(x.amount), 0) / 100.0) + 1)::int AS level,
    COUNT(x.id)::bigint AS stars
  FROM public.profiles p
  JOIN friend_ids fi ON fi.id = p.id
  LEFT JOIN public.avatars a ON a.id = p.avatar_id
  LEFT JOIN public.xp_events x ON x.user_id = p.id
  GROUP BY p.id, a.image_url
  ORDER BY level DESC, stars DESC, total_xp DESC, p.display_name ASC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$function$;