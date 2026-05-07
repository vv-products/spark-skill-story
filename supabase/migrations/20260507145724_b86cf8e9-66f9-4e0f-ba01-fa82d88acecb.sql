DROP FUNCTION IF EXISTS public.get_leaderboard(integer);
CREATE FUNCTION public.get_leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text, age integer, bio text, total_xp bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id, p.display_name, p.avatar_config, a.image_url, p.age, p.bio,
    COALESCE(SUM(x.amount), 0)::bigint
  FROM public.profiles p
  LEFT JOIN public.avatars a ON a.id = p.avatar_id
  LEFT JOIN public.xp_events x ON x.user_id = p.id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role IN ('admin'::app_role, 'editor'::app_role)
  )
  GROUP BY p.id, a.image_url
  ORDER BY 7 DESC, p.display_name ASC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$function$;