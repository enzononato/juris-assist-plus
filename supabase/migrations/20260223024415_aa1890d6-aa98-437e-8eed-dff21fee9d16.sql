
-- =============================================
-- MULTI-TENANT RLS ISOLATION
-- =============================================

-- 1. Helper: can user access a given company?
CREATE OR REPLACE FUNCTION public.can_access_company(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- user has all-company access (company_id IS NULL in profile)
    public.user_has_all_company_access(_user_id)
    OR
    -- user's company matches
    _company_id IS NULL
    OR
    public.get_user_company_id(_user_id) = _company_id
$$;

-- 2. Helper: can user access a case by case_id?
CREATE OR REPLACE FUNCTION public.can_access_case(_user_id uuid, _case_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.user_has_all_company_access(_user_id)
    OR
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = _case_id
        AND (c.company_id IS NULL OR c.company_id = public.get_user_company_id(_user_id))
    )
$$;

-- =============================================
-- TABLE: cases (has company_id directly)
-- =============================================
DROP POLICY IF EXISTS "Cases readable" ON public.cases;
DROP POLICY IF EXISTS "Cases insertable" ON public.cases;
DROP POLICY IF EXISTS "Cases updatable" ON public.cases;
DROP POLICY IF EXISTS "Cases deletable" ON public.cases;

CREATE POLICY "Cases readable" ON public.cases FOR SELECT
  USING (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Cases insertable" ON public.cases FOR INSERT
  WITH CHECK (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Cases updatable" ON public.cases FOR UPDATE
  USING (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Cases deletable" ON public.cases FOR DELETE
  USING (public.can_access_company(auth.uid(), company_id));

-- =============================================
-- TABLE: alerts (via case_id -> cases.company_id)
-- =============================================
DROP POLICY IF EXISTS "Alerts readable" ON public.alerts;
DROP POLICY IF EXISTS "Alerts readable " ON public.alerts;
DROP POLICY IF EXISTS "Alerts insertable" ON public.alerts;
DROP POLICY IF EXISTS "Alerts insertable " ON public.alerts;
DROP POLICY IF EXISTS "Alerts updatable" ON public.alerts;
DROP POLICY IF EXISTS "Alerts updatable " ON public.alerts;

CREATE POLICY "Alerts readable" ON public.alerts FOR SELECT
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Alerts insertable" ON public.alerts FOR INSERT
  WITH CHECK (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Alerts updatable" ON public.alerts FOR UPDATE
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: case_checklists
-- =============================================
DROP POLICY IF EXISTS "Case checklists readable" ON public.case_checklists;
DROP POLICY IF EXISTS "Case checklists readable " ON public.case_checklists;
DROP POLICY IF EXISTS "Case checklists insertable" ON public.case_checklists;
DROP POLICY IF EXISTS "Case checklists insertable " ON public.case_checklists;
DROP POLICY IF EXISTS "Case checklists updatable" ON public.case_checklists;
DROP POLICY IF EXISTS "Case checklists updatable " ON public.case_checklists;

CREATE POLICY "Case checklists readable" ON public.case_checklists FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Case checklists insertable" ON public.case_checklists FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Case checklists updatable" ON public.case_checklists FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: case_fees
-- =============================================
DROP POLICY IF EXISTS "case_fees readable" ON public.case_fees;
DROP POLICY IF EXISTS "case_fees readable " ON public.case_fees;
DROP POLICY IF EXISTS "case_fees insertable" ON public.case_fees;
DROP POLICY IF EXISTS "case_fees insertable " ON public.case_fees;
DROP POLICY IF EXISTS "case_fees updatable" ON public.case_fees;
DROP POLICY IF EXISTS "case_fees updatable " ON public.case_fees;
DROP POLICY IF EXISTS "case_fees deletable" ON public.case_fees;
DROP POLICY IF EXISTS "case_fees deletable " ON public.case_fees;

CREATE POLICY "case_fees readable" ON public.case_fees FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "case_fees insertable" ON public.case_fees FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "case_fees updatable" ON public.case_fees FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "case_fees deletable" ON public.case_fees FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: case_movements
-- =============================================
DROP POLICY IF EXISTS "Case movements readable" ON public.case_movements;
DROP POLICY IF EXISTS "Case movements readable " ON public.case_movements;
DROP POLICY IF EXISTS "Case movements insertable" ON public.case_movements;
DROP POLICY IF EXISTS "Case movements insertable " ON public.case_movements;

CREATE POLICY "Case movements readable" ON public.case_movements FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Case movements insertable" ON public.case_movements FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: case_sync_log
-- =============================================
DROP POLICY IF EXISTS "Sync log readable" ON public.case_sync_log;
DROP POLICY IF EXISTS "Sync log readable " ON public.case_sync_log;
DROP POLICY IF EXISTS "Sync log insertable" ON public.case_sync_log;
DROP POLICY IF EXISTS "Sync log insertable " ON public.case_sync_log;
DROP POLICY IF EXISTS "Sync log updatable" ON public.case_sync_log;
DROP POLICY IF EXISTS "Sync log updatable " ON public.case_sync_log;

CREATE POLICY "Sync log readable" ON public.case_sync_log FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Sync log insertable" ON public.case_sync_log FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Sync log updatable" ON public.case_sync_log FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: deadlines
-- =============================================
DROP POLICY IF EXISTS "Deadlines readable" ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines readable " ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines insertable" ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines insertable " ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines updatable" ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines updatable " ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines deletable" ON public.deadlines;
DROP POLICY IF EXISTS "Deadlines deletable " ON public.deadlines;

CREATE POLICY "Deadlines readable" ON public.deadlines FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Deadlines insertable" ON public.deadlines FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Deadlines updatable" ON public.deadlines FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Deadlines deletable" ON public.deadlines FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: deadline_suspensions
-- =============================================
DROP POLICY IF EXISTS "Suspensions viewable by authenticated users" ON public.deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions viewable by authenticated users " ON public.deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions can be managed by authenticated users" ON public.deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions can be managed by authenticated users " ON public.deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions can be updated by authenticated users" ON public.deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions can be updated by authenticated users " ON public.deadline_suspensions;

CREATE POLICY "Suspensions readable" ON public.deadline_suspensions FOR SELECT
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Suspensions insertable" ON public.deadline_suspensions FOR INSERT
  WITH CHECK (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Suspensions updatable" ON public.deadline_suspensions FOR UPDATE
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: evidence_items
-- =============================================
DROP POLICY IF EXISTS "Evidence items readable" ON public.evidence_items;
DROP POLICY IF EXISTS "Evidence items readable " ON public.evidence_items;
DROP POLICY IF EXISTS "Evidence items insertable" ON public.evidence_items;
DROP POLICY IF EXISTS "Evidence items insertable " ON public.evidence_items;
DROP POLICY IF EXISTS "Evidence items updatable" ON public.evidence_items;
DROP POLICY IF EXISTS "Evidence items updatable " ON public.evidence_items;

CREATE POLICY "Evidence items readable" ON public.evidence_items FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Evidence items insertable" ON public.evidence_items FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Evidence items updatable" ON public.evidence_items FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: evidence_requests
-- =============================================
DROP POLICY IF EXISTS "Evidence requests readable" ON public.evidence_requests;
DROP POLICY IF EXISTS "Evidence requests readable " ON public.evidence_requests;
DROP POLICY IF EXISTS "Evidence requests insertable" ON public.evidence_requests;
DROP POLICY IF EXISTS "Evidence requests insertable " ON public.evidence_requests;
DROP POLICY IF EXISTS "Evidence requests updatable" ON public.evidence_requests;
DROP POLICY IF EXISTS "Evidence requests updatable " ON public.evidence_requests;

CREATE POLICY "Evidence requests readable" ON public.evidence_requests FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Evidence requests insertable" ON public.evidence_requests FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Evidence requests updatable" ON public.evidence_requests FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: financial_entries
-- =============================================
DROP POLICY IF EXISTS "financial_entries readable" ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries readable " ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries insertable" ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries insertable " ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries updatable" ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries updatable " ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries deletable" ON public.financial_entries;
DROP POLICY IF EXISTS "financial_entries deletable " ON public.financial_entries;

CREATE POLICY "financial_entries readable" ON public.financial_entries FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "financial_entries insertable" ON public.financial_entries FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "financial_entries updatable" ON public.financial_entries FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "financial_entries deletable" ON public.financial_entries FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: generated_documents
-- =============================================
DROP POLICY IF EXISTS "generated_documents readable" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents readable " ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents insertable" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents insertable " ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents updatable" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents updatable " ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents deletable" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents deletable " ON public.generated_documents;

CREATE POLICY "generated_documents readable" ON public.generated_documents FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "generated_documents insertable" ON public.generated_documents FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "generated_documents updatable" ON public.generated_documents FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "generated_documents deletable" ON public.generated_documents FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: hearings
-- =============================================
DROP POLICY IF EXISTS "Hearings readable" ON public.hearings;
DROP POLICY IF EXISTS "Hearings readable " ON public.hearings;
DROP POLICY IF EXISTS "Hearings insertable" ON public.hearings;
DROP POLICY IF EXISTS "Hearings insertable " ON public.hearings;
DROP POLICY IF EXISTS "Hearings updatable" ON public.hearings;
DROP POLICY IF EXISTS "Hearings updatable " ON public.hearings;
DROP POLICY IF EXISTS "Hearings deletable" ON public.hearings;
DROP POLICY IF EXISTS "Hearings deletable " ON public.hearings;

CREATE POLICY "Hearings readable" ON public.hearings FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Hearings insertable" ON public.hearings FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Hearings updatable" ON public.hearings FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Hearings deletable" ON public.hearings FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: tasks (case_id is nullable)
-- =============================================
DROP POLICY IF EXISTS "Tasks readable" ON public.tasks;
DROP POLICY IF EXISTS "Tasks readable " ON public.tasks;
DROP POLICY IF EXISTS "Tasks insertable" ON public.tasks;
DROP POLICY IF EXISTS "Tasks insertable " ON public.tasks;
DROP POLICY IF EXISTS "Tasks updatable" ON public.tasks;
DROP POLICY IF EXISTS "Tasks updatable " ON public.tasks;
DROP POLICY IF EXISTS "Tasks deletable" ON public.tasks;
DROP POLICY IF EXISTS "Tasks deletable " ON public.tasks;

CREATE POLICY "Tasks readable" ON public.tasks FOR SELECT
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Tasks insertable" ON public.tasks FOR INSERT
  WITH CHECK (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Tasks updatable" ON public.tasks FOR UPDATE
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Tasks deletable" ON public.tasks FOR DELETE
  USING (case_id IS NULL OR public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: timeline_events
-- =============================================
DROP POLICY IF EXISTS "Timeline readable" ON public.timeline_events;
DROP POLICY IF EXISTS "Timeline readable " ON public.timeline_events;
DROP POLICY IF EXISTS "Timeline insertable" ON public.timeline_events;
DROP POLICY IF EXISTS "Timeline insertable " ON public.timeline_events;

CREATE POLICY "Timeline readable" ON public.timeline_events FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "Timeline insertable" ON public.timeline_events FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: timesheets
-- =============================================
DROP POLICY IF EXISTS "timesheets readable" ON public.timesheets;
DROP POLICY IF EXISTS "timesheets readable " ON public.timesheets;
DROP POLICY IF EXISTS "timesheets insertable" ON public.timesheets;
DROP POLICY IF EXISTS "timesheets insertable " ON public.timesheets;
DROP POLICY IF EXISTS "timesheets updatable" ON public.timesheets;
DROP POLICY IF EXISTS "timesheets updatable " ON public.timesheets;
DROP POLICY IF EXISTS "timesheets deletable" ON public.timesheets;
DROP POLICY IF EXISTS "timesheets deletable " ON public.timesheets;

CREATE POLICY "timesheets readable" ON public.timesheets FOR SELECT
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "timesheets insertable" ON public.timesheets FOR INSERT
  WITH CHECK (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "timesheets updatable" ON public.timesheets FOR UPDATE
  USING (public.can_access_case(auth.uid(), case_id));
CREATE POLICY "timesheets deletable" ON public.timesheets FOR DELETE
  USING (public.can_access_case(auth.uid(), case_id));

-- =============================================
-- TABLE: employees (has company_id directly)
-- =============================================
DROP POLICY IF EXISTS "Employees readable" ON public.employees;
DROP POLICY IF EXISTS "Employees readable " ON public.employees;
DROP POLICY IF EXISTS "Employees insertable" ON public.employees;
DROP POLICY IF EXISTS "Employees insertable " ON public.employees;
DROP POLICY IF EXISTS "Employees updatable" ON public.employees;
DROP POLICY IF EXISTS "Employees updatable " ON public.employees;

CREATE POLICY "Employees readable" ON public.employees FOR SELECT
  USING (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Employees insertable" ON public.employees FOR INSERT
  WITH CHECK (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Employees updatable" ON public.employees FOR UPDATE
  USING (public.can_access_company(auth.uid(), company_id));

-- =============================================
-- TABLE: responsaveis (has company_id directly)
-- =============================================
DROP POLICY IF EXISTS "Responsaveis readable" ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis readable " ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis insertable" ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis insertable " ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis updatable" ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis updatable " ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis deletable" ON public.responsaveis;
DROP POLICY IF EXISTS "Responsaveis deletable " ON public.responsaveis;

CREATE POLICY "Responsaveis readable" ON public.responsaveis FOR SELECT
  USING (company_id_all = true OR public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Responsaveis insertable" ON public.responsaveis FOR INSERT
  WITH CHECK (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Responsaveis updatable" ON public.responsaveis FOR UPDATE
  USING (public.can_access_company(auth.uid(), company_id));
CREATE POLICY "Responsaveis deletable" ON public.responsaveis FOR DELETE
  USING (public.can_access_company(auth.uid(), company_id));

-- =============================================
-- TABLE: companies (readable by own company or all-access)
-- =============================================
DROP POLICY IF EXISTS "Companies readable" ON public.companies;
DROP POLICY IF EXISTS "Companies readable " ON public.companies;
DROP POLICY IF EXISTS "Companies insertable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies insertable by authenticated " ON public.companies;
DROP POLICY IF EXISTS "Companies updatable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies updatable by authenticated " ON public.companies;

CREATE POLICY "Companies readable" ON public.companies FOR SELECT
  USING (public.can_access_company(auth.uid(), id));
CREATE POLICY "Companies insertable" ON public.companies FOR INSERT
  WITH CHECK (public.user_has_all_company_access(auth.uid()));
CREATE POLICY "Companies updatable" ON public.companies FOR UPDATE
  USING (public.can_access_company(auth.uid(), id));

-- =============================================
-- TABLE: document_versions (via generated_documents -> cases)
-- =============================================
DROP POLICY IF EXISTS "document_versions readable" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions readable " ON public.document_versions;
DROP POLICY IF EXISTS "document_versions insertable" ON public.document_versions;
DROP POLICY IF EXISTS "document_versions insertable " ON public.document_versions;

CREATE POLICY "document_versions readable" ON public.document_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.generated_documents gd
    WHERE gd.id = document_id AND public.can_access_case(auth.uid(), gd.case_id)
  ));
CREATE POLICY "document_versions insertable" ON public.document_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.generated_documents gd
    WHERE gd.id = document_id AND public.can_access_case(auth.uid(), gd.case_id)
  ));

-- =============================================
-- TABLE: download_logs (via evidence_items -> cases)
-- =============================================
DROP POLICY IF EXISTS "Download logs readable" ON public.download_logs;
DROP POLICY IF EXISTS "Download logs readable " ON public.download_logs;
DROP POLICY IF EXISTS "Download logs insertable" ON public.download_logs;
DROP POLICY IF EXISTS "Download logs insertable " ON public.download_logs;

CREATE POLICY "Download logs readable" ON public.download_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.evidence_items ei
    WHERE ei.id = evidence_item_id AND public.can_access_case(auth.uid(), ei.case_id)
  ));
CREATE POLICY "Download logs insertable" ON public.download_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.evidence_items ei
    WHERE ei.id = evidence_item_id AND public.can_access_case(auth.uid(), ei.case_id)
  ));

-- =============================================
-- GLOBAL TABLES: holidays, checklist_templates, document_templates
-- Keep accessible to all authenticated users (no tenant filter needed)
-- =============================================
-- These are already fine with USING (true) as they are global/shared data
