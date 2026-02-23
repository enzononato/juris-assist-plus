
-- ========================================
-- ENUMS
-- ========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'responsavel_juridico_interno', 'dp', 'rh', 'vendas', 'logistica', 'frota', 'advogado_externo');
CREATE TYPE public.case_status AS ENUM ('novo', 'em_andamento', 'audiencia_marcada', 'sentenca', 'recurso', 'encerrado');
CREATE TYPE public.priority_level AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE public.task_status AS ENUM ('aberta', 'em_andamento', 'aguardando', 'concluida');
CREATE TYPE public.hearing_status AS ENUM ('agendada', 'realizada', 'adiada', 'cancelada');
CREATE TYPE public.deadline_status AS ENUM ('pendente', 'cumprido', 'vencido');
CREATE TYPE public.alert_severity AS ENUM ('info', 'atencao', 'urgente');
CREATE TYPE public.alert_type AS ENUM ('prazo', 'audiencia', 'tarefa', 'prova', 'publicacao');
CREATE TYPE public.confidentiality_level AS ENUM ('normal', 'restrito', 'ultra_restrito');
CREATE TYPE public.responsible_sector AS ENUM ('dp', 'rh', 'frota', 'vendas', 'logistica', 'ti');
CREATE TYPE public.timeline_event_type AS ENUM (
  'processo_criado', 'status_alterado', 'prazo_criado', 'prazo_cumprido',
  'audiencia_agendada', 'audiencia_realizada', 'prova_anexada', 'tarefa_criada',
  'tarefa_concluida', 'comentario', 'checklist_aplicado', 'responsavel_alterado',
  'campo_editado'
);
CREATE TYPE public.evidence_category AS ENUM (
  'ponto_eletronico', 'escalas', 'treinamento', 'conversas_oficiais', 'cftv_camera',
  'documentos_assinados', 'emails', 'atestados_justificativas', 'epi_advertencias',
  'catraca_controle_acesso', 'logs_servidor', 'logs_sistemas', 'outros'
);
CREATE TYPE public.evidence_origin AS ENUM ('email', 'whatsapp_corporativo', 'drive', 'sistema_ponto', 'sistema_catraca', 'servidor', 'outro');
CREATE TYPE public.evidence_request_status AS ENUM ('aberta', 'parcialmente_atendida', 'atendida', 'atrasada');
CREATE TYPE public.evidence_item_status AS ENUM ('pendente', 'recebido', 'validado', 'recusado');
CREATE TYPE public.checklist_type AS ENUM ('pre_audiencia', 'pos_audiencia', 'provas_por_tema');

-- ========================================
-- PROFILES & USER ROLES
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Helper: check if user has access to all companies (company_id IS NULL)
CREATE OR REPLACE FUNCTION public.user_has_all_company_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id AND company_id IS NULL
  )
$$;

-- ========================================
-- CORE TABLES
-- ========================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  branch TEXT,
  employee_id UUID REFERENCES public.employees(id),
  employee_name TEXT,
  theme TEXT,
  status case_status NOT NULL DEFAULT 'novo',
  court TEXT,
  responsible TEXT,
  lawyer TEXT,
  confidentiality confidentiality_level NOT NULL DEFAULT 'normal',
  filed_at TIMESTAMPTZ,
  next_hearing TIMESTAMPTZ,
  next_deadline TIMESTAMPTZ,
  amount NUMERIC,
  responsible_sector responsible_sector,
  reopened BOOLEAN DEFAULT false,
  reopened_at TIMESTAMPTZ,
  reopened_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  assignees TEXT[] DEFAULT '{}',
  due_at TIMESTAMPTZ,
  priority priority_level NOT NULL DEFAULT 'media',
  status task_status NOT NULL DEFAULT 'aberta',
  show_in_calendar BOOLEAN DEFAULT true,
  all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME,
  type TEXT,
  court TEXT,
  status hearing_status NOT NULL DEFAULT 'agendada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status deadline_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  case_number TEXT,
  employee_name TEXT,
  event_date TIMESTAMPTZ,
  severity alert_severity NOT NULL DEFAULT 'info',
  treated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  type timeline_event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.evidence_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  theme TEXT,
  description TEXT,
  assigned_areas TEXT[] DEFAULT '{}',
  assigned_users TEXT[] DEFAULT '{}',
  status evidence_request_status NOT NULL DEFAULT 'aberta',
  sla_hours INT DEFAULT 72,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.evidence_requests(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  category evidence_category NOT NULL DEFAULT 'outros',
  origin evidence_origin NOT NULL DEFAULT 'outro',
  fact_date DATE,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status evidence_item_status NOT NULL DEFAULT 'pendente',
  file_size TEXT,
  sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_item_id UUID REFERENCES public.evidence_items(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  watermarked BOOLEAN DEFAULT false
);

CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type checklist_type NOT NULL,
  theme TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.case_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.checklist_templates(id),
  template_name TEXT,
  type checklist_type NOT NULL,
  hearing_id UUID REFERENCES public.hearings(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company_id_all BOOLEAN DEFAULT false,
  alerts_audiencias BOOLEAN DEFAULT false,
  alerts_prazos BOOLEAN DEFAULT false,
  alerts_tarefas BOOLEAN DEFAULT false,
  alerts_whatsapp BOOLEAN DEFAULT false,
  alerts_email BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================
-- UPDATED_AT TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hearings_updated_at BEFORE UPDATE ON public.hearings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON public.deadlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_case_checklists_updated_at BEFORE UPDATE ON public.case_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- RLS POLICIES
-- ========================================
-- Note: RLS is auto-enabled by the rls_auto_enable trigger.
-- For now, we use permissive policies for authenticated users.
-- When Supabase Auth is fully integrated, we'll tighten these with company-based filtering.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- User roles: readable by authenticated
CREATE POLICY "Roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Companies: readable by all authenticated
CREATE POLICY "Companies readable" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Companies insertable by authenticated" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Companies updatable by authenticated" ON public.companies FOR UPDATE TO authenticated USING (true);

-- Employees: readable by all authenticated
CREATE POLICY "Employees readable" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees insertable" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Employees updatable" ON public.employees FOR UPDATE TO authenticated USING (true);

-- Cases: full CRUD for authenticated (will tighten later with company filtering)
CREATE POLICY "Cases readable" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cases insertable" ON public.cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Cases updatable" ON public.cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Cases deletable" ON public.cases FOR DELETE TO authenticated USING (true);

-- Tasks
CREATE POLICY "Tasks readable" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks insertable" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks updatable" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tasks deletable" ON public.tasks FOR DELETE TO authenticated USING (true);

-- Hearings
CREATE POLICY "Hearings readable" ON public.hearings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hearings insertable" ON public.hearings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Hearings updatable" ON public.hearings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Hearings deletable" ON public.hearings FOR DELETE TO authenticated USING (true);

-- Deadlines
CREATE POLICY "Deadlines readable" ON public.deadlines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deadlines insertable" ON public.deadlines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Deadlines updatable" ON public.deadlines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Deadlines deletable" ON public.deadlines FOR DELETE TO authenticated USING (true);

-- Alerts
CREATE POLICY "Alerts readable" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alerts insertable" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Alerts updatable" ON public.alerts FOR UPDATE TO authenticated USING (true);

-- Timeline events
CREATE POLICY "Timeline readable" ON public.timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Timeline insertable" ON public.timeline_events FOR INSERT TO authenticated WITH CHECK (true);

-- Evidence requests
CREATE POLICY "Evidence requests readable" ON public.evidence_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Evidence requests insertable" ON public.evidence_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Evidence requests updatable" ON public.evidence_requests FOR UPDATE TO authenticated USING (true);

-- Evidence items
CREATE POLICY "Evidence items readable" ON public.evidence_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Evidence items insertable" ON public.evidence_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Evidence items updatable" ON public.evidence_items FOR UPDATE TO authenticated USING (true);

-- Download logs
CREATE POLICY "Download logs readable" ON public.download_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Download logs insertable" ON public.download_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Checklist templates
CREATE POLICY "Checklist templates readable" ON public.checklist_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Checklist templates insertable" ON public.checklist_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Checklist templates updatable" ON public.checklist_templates FOR UPDATE TO authenticated USING (true);

-- Case checklists
CREATE POLICY "Case checklists readable" ON public.case_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Case checklists insertable" ON public.case_checklists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Case checklists updatable" ON public.case_checklists FOR UPDATE TO authenticated USING (true);

-- Responsaveis
CREATE POLICY "Responsaveis readable" ON public.responsaveis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Responsaveis insertable" ON public.responsaveis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Responsaveis updatable" ON public.responsaveis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Responsaveis deletable" ON public.responsaveis FOR DELETE TO authenticated USING (true);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_cases_company_id ON public.cases(company_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_at ON public.tasks(due_at);
CREATE INDEX idx_hearings_case_id ON public.hearings(case_id);
CREATE INDEX idx_hearings_date ON public.hearings(date);
CREATE INDEX idx_deadlines_case_id ON public.deadlines(case_id);
CREATE INDEX idx_deadlines_due_at ON public.deadlines(due_at);
CREATE INDEX idx_alerts_case_id ON public.alerts(case_id);
CREATE INDEX idx_timeline_events_case_id ON public.timeline_events(case_id);
CREATE INDEX idx_evidence_requests_case_id ON public.evidence_requests(case_id);
CREATE INDEX idx_evidence_items_case_id ON public.evidence_items(case_id);
CREATE INDEX idx_evidence_items_request_id ON public.evidence_items(request_id);
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
