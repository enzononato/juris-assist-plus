
-- Tabela de andamentos processuais capturados do DataJud
CREATE TABLE public.case_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'datajud',
  external_id TEXT,
  court TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_case_movements_case_id ON public.case_movements(case_id);
CREATE INDEX idx_case_movements_date ON public.case_movements(movement_date DESC);
CREATE UNIQUE INDEX idx_case_movements_external ON public.case_movements(case_id, external_id) WHERE external_id IS NOT NULL;

-- RLS
ALTER TABLE public.case_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case movements readable" ON public.case_movements FOR SELECT USING (true);
CREATE POLICY "Case movements insertable" ON public.case_movements FOR INSERT WITH CHECK (true);

-- Tabela de controle de última consulta por processo
CREATE TABLE public.case_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE UNIQUE,
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_status TEXT,
  movements_count INTEGER DEFAULT 0
);

ALTER TABLE public.case_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync log readable" ON public.case_sync_log FOR SELECT USING (true);
CREATE POLICY "Sync log insertable" ON public.case_sync_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Sync log updatable" ON public.case_sync_log FOR UPDATE USING (true);
