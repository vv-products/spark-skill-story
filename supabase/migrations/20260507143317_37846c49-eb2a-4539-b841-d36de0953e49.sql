
-- Avatars catalog
CREATE TABLE public.avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read avatars" ON public.avatars
  FOR SELECT USING (true);
CREATE POLICY "Editors manage avatars" ON public.avatars
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER avatars_set_updated_at BEFORE UPDATE ON public.avatars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles: chosen avatar
ALTER TABLE public.profiles ADD COLUMN avatar_id uuid REFERENCES public.avatars(id) ON DELETE SET NULL;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read avatars bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Editors upload avatars bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Editors update avatars bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Editors delete avatars bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
