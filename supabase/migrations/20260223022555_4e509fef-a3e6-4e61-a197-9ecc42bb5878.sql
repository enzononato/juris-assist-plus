
-- Table for holidays (national + by court/TRT)
CREATE TABLE public.holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'nacional', -- nacional, estadual, municipal, trt
  court TEXT, -- optional: specific court/TRT (e.g. "TRT-2", "Vara do Trabalho de São Paulo")
  recurring BOOLEAN NOT NULL DEFAULT false, -- if true, repeats every year (month+day)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holidays are viewable by authenticated users"
  ON public.holidays FOR SELECT USING (true);

CREATE POLICY "Holidays can be managed by authenticated users"
  ON public.holidays FOR INSERT WITH CHECK (true);

CREATE POLICY "Holidays can be updated by authenticated users"
  ON public.holidays FOR UPDATE USING (true);

CREATE POLICY "Holidays can be deleted by authenticated users"
  ON public.holidays FOR DELETE USING (true);

-- Table for deadline suspensions
CREATE TABLE public.deadline_suspensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deadline_id UUID REFERENCES public.deadlines(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  suspended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resumed_at TIMESTAMPTZ,
  remaining_days INTEGER, -- days remaining when suspended
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deadline_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suspensions viewable by authenticated users"
  ON public.deadline_suspensions FOR SELECT USING (true);

CREATE POLICY "Suspensions can be managed by authenticated users"
  ON public.deadline_suspensions FOR INSERT WITH CHECK (true);

CREATE POLICY "Suspensions can be updated by authenticated users"
  ON public.deadline_suspensions FOR UPDATE USING (true);

-- Add fields to deadlines table
ALTER TABLE public.deadlines
  ADD COLUMN IF NOT EXISTS deadline_type TEXT DEFAULT 'judicial',
  ADD COLUMN IF NOT EXISTS business_days_count INTEGER,
  ADD COLUMN IF NOT EXISTS court TEXT,
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS alert_15d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_7d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_3d BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_today BOOLEAN DEFAULT false;

-- Seed national holidays 2025-2026
INSERT INTO public.holidays (name, date, scope, recurring) VALUES
  ('Confraternização Universal', '2025-01-01', 'nacional', true),
  ('Carnaval', '2025-03-03', 'nacional', false),
  ('Carnaval', '2025-03-04', 'nacional', false),
  ('Sexta-feira Santa', '2025-04-18', 'nacional', false),
  ('Tiradentes', '2025-04-21', 'nacional', true),
  ('Dia do Trabalho', '2025-05-01', 'nacional', true),
  ('Corpus Christi', '2025-06-19', 'nacional', false),
  ('Independência do Brasil', '2025-09-07', 'nacional', true),
  ('Nossa Senhora Aparecida', '2025-10-12', 'nacional', true),
  ('Finados', '2025-11-02', 'nacional', true),
  ('Proclamação da República', '2025-11-15', 'nacional', true),
  ('Dia da Consciência Negra', '2025-11-20', 'nacional', true),
  ('Natal', '2025-12-25', 'nacional', true),
  ('Recesso Forense Início', '2025-12-20', 'nacional', false),
  ('Carnaval', '2026-02-16', 'nacional', false),
  ('Carnaval', '2026-02-17', 'nacional', false),
  ('Sexta-feira Santa', '2026-04-03', 'nacional', false),
  ('Corpus Christi', '2026-06-04', 'nacional', false),
  ('Recesso Forense Início', '2026-12-20', 'nacional', false);
