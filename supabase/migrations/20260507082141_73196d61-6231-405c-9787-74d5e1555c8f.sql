
CREATE TABLE public.welcome_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  headline TEXT NOT NULL,
  subtitle TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Start →',
  cta_destination TEXT NOT NULL DEFAULT '/',
  active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.welcome_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read welcome cards"
  ON public.welcome_cards FOR SELECT
  USING (true);

CREATE POLICY "Editors manage welcome cards"
  ON public.welcome_cards FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER welcome_cards_set_updated_at
  BEFORE UPDATE ON public.welcome_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('welcome-cards', 'welcome-cards', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read welcome-cards"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'welcome-cards');

CREATE POLICY "Editors upload welcome-cards"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'welcome-cards' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Editors update welcome-cards"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'welcome-cards' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Editors delete welcome-cards"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'welcome-cards' AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
