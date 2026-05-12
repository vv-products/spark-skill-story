
-- ===== Mission content tables =====

CREATE TABLE public.mission_crosswords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mission_crossword_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crossword_id uuid NOT NULL REFERENCES public.mission_crosswords(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  label text NOT NULL,
  rows int NOT NULL DEFAULT 5,
  cols int NOT NULL DEFAULT 6,
  xp_reward int NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(crossword_id, difficulty)
);

CREATE TABLE public.mission_crossword_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.mission_crossword_variants(id) ON DELETE CASCADE,
  number int NOT NULL,
  direction text NOT NULL CHECK (direction IN ('A','D')),
  row int NOT NULL,
  col int NOT NULL,
  answer text NOT NULL,
  clue text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_xword_words_variant ON public.mission_crossword_words(variant_id);

ALTER TABLE public.mission_crosswords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_crossword_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_crossword_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read crosswords" ON public.mission_crosswords FOR SELECT USING (true);
CREATE POLICY "Editors manage crosswords" ON public.mission_crosswords FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Read variants" ON public.mission_crossword_variants FOR SELECT USING (true);
CREATE POLICY "Editors manage variants" ON public.mission_crossword_variants FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Read words" ON public.mission_crossword_words FOR SELECT USING (true);
CREATE POLICY "Editors manage words" ON public.mission_crossword_words FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_xword_updated BEFORE UPDATE ON public.mission_crosswords FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_xword_var_updated BEFORE UPDATE ON public.mission_crossword_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quizzes
CREATE TABLE public.mission_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  pace text NOT NULL CHECK (pace IN ('self-paced','quick')),
  base_xp int NOT NULL DEFAULT 25,
  per_right_xp int NOT NULL DEFAULT 5,
  time_limit_sec int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mission_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.mission_quizzes(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  prompt text NOT NULL,
  explain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mission_quiz_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.mission_quiz_questions(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_q_quiz ON public.mission_quiz_questions(quiz_id);
CREATE INDEX idx_quiz_choice_q ON public.mission_quiz_choices(question_id);

ALTER TABLE public.mission_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_quiz_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read quizzes" ON public.mission_quizzes FOR SELECT USING (true);
CREATE POLICY "Editors manage quizzes" ON public.mission_quizzes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Read quiz questions" ON public.mission_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Editors manage quiz questions" ON public.mission_quiz_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Read quiz choices" ON public.mission_quiz_choices FOR SELECT USING (true);
CREATE POLICY "Editors manage quiz choices" ON public.mission_quiz_choices FOR ALL TO authenticated
  USING (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_quiz_updated BEFORE UPDATE ON public.mission_quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quiz_q_updated BEFORE UPDATE ON public.mission_quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== XP breakdown function =====

CREATE OR REPLACE FUNCTION public.get_user_xp_breakdown(_user_id uuid)
RETURNS TABLE(source text, events bigint, total_xp bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT x.source, COUNT(*)::bigint AS events, COALESCE(SUM(x.amount),0)::bigint AS total_xp
  FROM public.xp_events x
  WHERE x.user_id = _user_id
  GROUP BY x.source
  ORDER BY total_xp DESC;
$$;

-- ===== Seed Emotions content =====

WITH cw AS (
  INSERT INTO public.mission_crosswords(slug, title) VALUES ('emotions','Emotions Crossword') RETURNING id
), v_easy AS (
  INSERT INTO public.mission_crossword_variants(crossword_id, difficulty, label, rows, cols, xp_reward)
  SELECT id,'easy','Easy',3,5,25 FROM cw RETURNING id
), v_med AS (
  INSERT INTO public.mission_crossword_variants(crossword_id, difficulty, label, rows, cols, xp_reward)
  SELECT id,'medium','Medium',5,6,50 FROM cw RETURNING id
), v_hard AS (
  INSERT INTO public.mission_crossword_variants(crossword_id, difficulty, label, rows, cols, xp_reward)
  SELECT id,'hard','Hard',5,6,100 FROM cw RETURNING id
)
INSERT INTO public.mission_crossword_words(variant_id, number, direction, row, col, answer, clue, position)
SELECT id,1,'A',0,0,'SAD','Unhappy (3)',0 FROM v_easy UNION ALL
SELECT id,2,'A',2,0,'YAY','A cheer when you''re happy (3)',1 FROM v_easy UNION ALL
SELECT id,1,'D',0,0,'SHY','Quiet — doesn''t say much (3)',2 FROM v_easy UNION ALL
SELECT id,1,'A',0,0,'HAPPY','Feeling great with a big smile (5)',0 FROM v_med UNION ALL
SELECT id,3,'A',1,0,'BORED','Feeling uninterested or tired of something (5)',1 FROM v_med UNION ALL
SELECT id,4,'A',4,2,'DULL','Boring; not exciting (4)',2 FROM v_med UNION ALL
SELECT id,2,'D',0,2,'PROUD','Pleased with what you did (5)',3 FROM v_med UNION ALL
SELECT id,1,'A',0,0,'HAPPY','Feeling great with a big smile (5)',0 FROM v_hard UNION ALL
SELECT id,3,'A',1,0,'BORED','Feeling uninterested or tired of something (5)',1 FROM v_hard UNION ALL
SELECT id,4,'A',2,1,'HOPE','A feeling that good things will happen (4)',2 FROM v_hard UNION ALL
SELECT id,5,'A',3,2,'UGLY','Not nice to look at (4)',3 FROM v_hard UNION ALL
SELECT id,6,'A',4,2,'DULL','Boring; not exciting (4)',4 FROM v_hard UNION ALL
SELECT id,2,'D',0,2,'PROUD','Pleased with what you did (5)',5 FROM v_hard;

-- Quizzes seed
WITH q1 AS (
  INSERT INTO public.mission_quizzes(slug, title, pace, base_xp, per_right_xp, time_limit_sec)
  VALUES ('emotions-quiz','Emotions Quiz','self-paced',25,5,NULL) RETURNING id
), q2 AS (
  INSERT INTO public.mission_quizzes(slug, title, pace, base_xp, per_right_xp, time_limit_sec)
  VALUES ('emotions-quickfire','Emotions Quick-Fire','quick',50,8,8) RETURNING id
), sp_q AS (
  INSERT INTO public.mission_quiz_questions(quiz_id, position, prompt, explain)
  SELECT id, ord, prompt, explain FROM q1, (VALUES
    (0,'You finally finish a really hard puzzle. What do you feel?', 'Proud — that warm ''I did it!'' feeling after working hard.'),
    (1,'Your tummy gets jumpy before standing up to speak in class. That''s…', 'Nervous feelings often show up as jumpy or fluttery in your body.'),
    (2,'Your friend gets the toy you wanted. The squeezy feeling inside is…', 'Jealousy — wanting what someone else has.'),
    (3,'You drop something fragile and feel your face go hot. That''s likely…', NULL),
    (4,'When someone shares with you and you feel warm inside, that''s…', NULL),
    (5,'A best way to calm a big angry feeling is…', 'Slow breathing helps your body settle when feelings get big.'),
    (6,'Feeling small and unsure about trying something new is…', NULL),
    (7,'Your friend looks sad. The kindest first step is…', NULL),
    (8,'Butterflies + smile before your birthday party = ', NULL),
    (9,'When emotions feel too big, who can help?', 'Talking to a trusted adult helps make big feelings smaller.')
  ) AS t(ord, prompt, explain)
  RETURNING id, position
), qf_q AS (
  INSERT INTO public.mission_quiz_questions(quiz_id, position, prompt, explain)
  SELECT id, ord, prompt, NULL FROM q2, (VALUES
    (0,'😊 = ?'),(1,'😢 = ?'),(2,'😠 = ?'),(3,'😨 = ?'),
    (4,'Opposite of HAPPY?'),(5,'Opposite of CALM?'),
    (6,'🥳 most fits…'),(7,'Heart races, palms sweat. You feel…'),
    (8,'You did your best. You feel…'),(9,'Big yawn, heavy eyes = ?')
  ) AS t(ord, prompt)
  RETURNING id, position
)
INSERT INTO public.mission_quiz_choices(question_id, position, label, is_correct)
-- Self-paced choices
SELECT id,0,'Bored',false FROM sp_q WHERE position=0 UNION ALL
SELECT id,1,'Proud',true FROM sp_q WHERE position=0 UNION ALL
SELECT id,2,'Scared',false FROM sp_q WHERE position=0 UNION ALL
SELECT id,3,'Jealous',false FROM sp_q WHERE position=0 UNION ALL
SELECT id,0,'Anger',false FROM sp_q WHERE position=1 UNION ALL
SELECT id,1,'Hunger',false FROM sp_q WHERE position=1 UNION ALL
SELECT id,2,'Nervous',true FROM sp_q WHERE position=1 UNION ALL
SELECT id,3,'Sleepy',false FROM sp_q WHERE position=1 UNION ALL
SELECT id,0,'Jealous',true FROM sp_q WHERE position=2 UNION ALL
SELECT id,1,'Proud',false FROM sp_q WHERE position=2 UNION ALL
SELECT id,2,'Calm',false FROM sp_q WHERE position=2 UNION ALL
SELECT id,3,'Surprised',false FROM sp_q WHERE position=2 UNION ALL
SELECT id,0,'Joy',false FROM sp_q WHERE position=3 UNION ALL
SELECT id,1,'Embarrassed',true FROM sp_q WHERE position=3 UNION ALL
SELECT id,2,'Sleepy',false FROM sp_q WHERE position=3 UNION ALL
SELECT id,3,'Brave',false FROM sp_q WHERE position=3 UNION ALL
SELECT id,0,'Grateful',true FROM sp_q WHERE position=4 UNION ALL
SELECT id,1,'Bored',false FROM sp_q WHERE position=4 UNION ALL
SELECT id,2,'Angry',false FROM sp_q WHERE position=4 UNION ALL
SELECT id,3,'Scared',false FROM sp_q WHERE position=4 UNION ALL
SELECT id,0,'Yell at someone',false FROM sp_q WHERE position=5 UNION ALL
SELECT id,1,'Throw a toy',false FROM sp_q WHERE position=5 UNION ALL
SELECT id,2,'Take 3 slow breaths',true FROM sp_q WHERE position=5 UNION ALL
SELECT id,3,'Hide forever',false FROM sp_q WHERE position=5 UNION ALL
SELECT id,0,'Confident',false FROM sp_q WHERE position=6 UNION ALL
SELECT id,1,'Shy',true FROM sp_q WHERE position=6 UNION ALL
SELECT id,2,'Angry',false FROM sp_q WHERE position=6 UNION ALL
SELECT id,3,'Sleepy',false FROM sp_q WHERE position=6 UNION ALL
SELECT id,0,'Tell them to cheer up',false FROM sp_q WHERE position=7 UNION ALL
SELECT id,1,'Ignore them',false FROM sp_q WHERE position=7 UNION ALL
SELECT id,2,'Ask ''Are you okay?''',true FROM sp_q WHERE position=7 UNION ALL
SELECT id,3,'Take their toy',false FROM sp_q WHERE position=7 UNION ALL
SELECT id,0,'Excited',true FROM sp_q WHERE position=8 UNION ALL
SELECT id,1,'Bored',false FROM sp_q WHERE position=8 UNION ALL
SELECT id,2,'Sad',false FROM sp_q WHERE position=8 UNION ALL
SELECT id,3,'Angry',false FROM sp_q WHERE position=8 UNION ALL
SELECT id,0,'Nobody',false FROM sp_q WHERE position=9 UNION ALL
SELECT id,1,'A trusted grown-up',true FROM sp_q WHERE position=9 UNION ALL
SELECT id,2,'My pillow only',false FROM sp_q WHERE position=9 UNION ALL
SELECT id,3,'I should hide them',false FROM sp_q WHERE position=9 UNION ALL
-- Quick-fire choices
SELECT id,0,'Happy',true FROM qf_q WHERE position=0 UNION ALL
SELECT id,1,'Sad',false FROM qf_q WHERE position=0 UNION ALL
SELECT id,2,'Angry',false FROM qf_q WHERE position=0 UNION ALL
SELECT id,3,'Tired',false FROM qf_q WHERE position=0 UNION ALL
SELECT id,0,'Excited',false FROM qf_q WHERE position=1 UNION ALL
SELECT id,1,'Sad',true FROM qf_q WHERE position=1 UNION ALL
SELECT id,2,'Brave',false FROM qf_q WHERE position=1 UNION ALL
SELECT id,3,'Calm',false FROM qf_q WHERE position=1 UNION ALL
SELECT id,0,'Sleepy',false FROM qf_q WHERE position=2 UNION ALL
SELECT id,1,'Proud',false FROM qf_q WHERE position=2 UNION ALL
SELECT id,2,'Angry',true FROM qf_q WHERE position=2 UNION ALL
SELECT id,3,'Shy',false FROM qf_q WHERE position=2 UNION ALL
SELECT id,0,'Scared',true FROM qf_q WHERE position=3 UNION ALL
SELECT id,1,'Bored',false FROM qf_q WHERE position=3 UNION ALL
SELECT id,2,'Happy',false FROM qf_q WHERE position=3 UNION ALL
SELECT id,3,'Cool',false FROM qf_q WHERE position=3 UNION ALL
SELECT id,0,'Glad',false FROM qf_q WHERE position=4 UNION ALL
SELECT id,1,'Sad',true FROM qf_q WHERE position=4 UNION ALL
SELECT id,2,'Joyful',false FROM qf_q WHERE position=4 UNION ALL
SELECT id,3,'Cheery',false FROM qf_q WHERE position=4 UNION ALL
SELECT id,0,'Quiet',false FROM qf_q WHERE position=5 UNION ALL
SELECT id,1,'Still',false FROM qf_q WHERE position=5 UNION ALL
SELECT id,2,'Frantic',true FROM qf_q WHERE position=5 UNION ALL
SELECT id,3,'Peaceful',false FROM qf_q WHERE position=5 UNION ALL
SELECT id,0,'Bored',false FROM qf_q WHERE position=6 UNION ALL
SELECT id,1,'Excited',true FROM qf_q WHERE position=6 UNION ALL
SELECT id,2,'Lonely',false FROM qf_q WHERE position=6 UNION ALL
SELECT id,3,'Sleepy',false FROM qf_q WHERE position=6 UNION ALL
SELECT id,0,'Calm',false FROM qf_q WHERE position=7 UNION ALL
SELECT id,1,'Sleepy',false FROM qf_q WHERE position=7 UNION ALL
SELECT id,2,'Nervous',true FROM qf_q WHERE position=7 UNION ALL
SELECT id,3,'Bored',false FROM qf_q WHERE position=7 UNION ALL
SELECT id,0,'Proud',true FROM qf_q WHERE position=8 UNION ALL
SELECT id,1,'Jealous',false FROM qf_q WHERE position=8 UNION ALL
SELECT id,2,'Angry',false FROM qf_q WHERE position=8 UNION ALL
SELECT id,3,'Tired',false FROM qf_q WHERE position=8 UNION ALL
SELECT id,0,'Excited',false FROM qf_q WHERE position=9 UNION ALL
SELECT id,1,'Sleepy',true FROM qf_q WHERE position=9 UNION ALL
SELECT id,2,'Shy',false FROM qf_q WHERE position=9 UNION ALL
SELECT id,3,'Brave',false FROM qf_q WHERE position=9;
