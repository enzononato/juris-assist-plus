
-- Enum para tipo de honorário
CREATE TYPE public.fee_type AS ENUM ('fixo', 'exito', 'provisorio', 'ad_hoc');

-- Enum para tipo de lançamento financeiro
CREATE TYPE public.financial_entry_type AS ENUM ('receita', 'despesa');

-- Enum para status de lançamento financeiro
CREATE TYPE public.financial_entry_status AS ENUM ('pendente', 'pago', 'cancelado');

-- Tabela de honorários por processo
CREATE TABLE public.case_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  fee_type public.fee_type NOT NULL DEFAULT 'fixo',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC,
  installments INTEGER DEFAULT 1,
  paid_installments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_fees readable" ON public.case_fees FOR SELECT USING (true);
CREATE POLICY "case_fees insertable" ON public.case_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "case_fees updatable" ON public.case_fees FOR UPDATE USING (true);
CREATE POLICY "case_fees deletable" ON public.case_fees FOR DELETE USING (true);

CREATE INDEX idx_case_fees_case_id ON public.case_fees(case_id);

CREATE TRIGGER update_case_fees_updated_at
  BEFORE UPDATE ON public.case_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de timesheet (registro de horas)
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  description TEXT NOT NULL,
  hours NUMERIC NOT NULL DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timesheets readable" ON public.timesheets FOR SELECT USING (true);
CREATE POLICY "timesheets insertable" ON public.timesheets FOR INSERT WITH CHECK (true);
CREATE POLICY "timesheets updatable" ON public.timesheets FOR UPDATE USING (true);
CREATE POLICY "timesheets deletable" ON public.timesheets FOR DELETE USING (true);

CREATE INDEX idx_timesheets_case_id ON public.timesheets(case_id);
CREATE INDEX idx_timesheets_work_date ON public.timesheets(work_date DESC);

-- Tabela de lançamentos financeiros (contas a pagar/receber)
CREATE TABLE public.financial_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  entry_type public.financial_entry_type NOT NULL,
  status public.financial_entry_status NOT NULL DEFAULT 'pendente',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "financial_entries readable" ON public.financial_entries FOR SELECT USING (true);
CREATE POLICY "financial_entries insertable" ON public.financial_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "financial_entries updatable" ON public.financial_entries FOR UPDATE USING (true);
CREATE POLICY "financial_entries deletable" ON public.financial_entries FOR DELETE USING (true);

CREATE INDEX idx_financial_entries_case_id ON public.financial_entries(case_id);
CREATE INDEX idx_financial_entries_due_date ON public.financial_entries(due_date);

CREATE TRIGGER update_financial_entries_updated_at
  BEFORE UPDATE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
