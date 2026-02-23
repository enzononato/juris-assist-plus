
-- Fix: Drop all RESTRICTIVE policies and recreate as PERMISSIVE (default)
-- CASES
DROP POLICY IF EXISTS "Cases readable" ON cases;
DROP POLICY IF EXISTS "Cases insertable" ON cases;
DROP POLICY IF EXISTS "Cases updatable" ON cases;
DROP POLICY IF EXISTS "Cases deletable" ON cases;
DROP POLICY IF EXISTS "Cases readable " ON cases;
DROP POLICY IF EXISTS "Cases insertable " ON cases;
DROP POLICY IF EXISTS "Cases updatable " ON cases;
DROP POLICY IF EXISTS "Cases deletable " ON cases;
CREATE POLICY "cases_select" ON cases FOR SELECT USING (true);
CREATE POLICY "cases_insert" ON cases FOR INSERT WITH CHECK (true);
CREATE POLICY "cases_update" ON cases FOR UPDATE USING (true);
CREATE POLICY "cases_delete" ON cases FOR DELETE USING (true);

-- TASKS
DROP POLICY IF EXISTS "Tasks readable" ON tasks;
DROP POLICY IF EXISTS "Tasks insertable" ON tasks;
DROP POLICY IF EXISTS "Tasks updatable" ON tasks;
DROP POLICY IF EXISTS "Tasks deletable" ON tasks;
DROP POLICY IF EXISTS "Tasks readable " ON tasks;
DROP POLICY IF EXISTS "Tasks insertable " ON tasks;
DROP POLICY IF EXISTS "Tasks updatable " ON tasks;
DROP POLICY IF EXISTS "Tasks deletable " ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (true);

-- HEARINGS
DROP POLICY IF EXISTS "Hearings readable" ON hearings;
DROP POLICY IF EXISTS "Hearings insertable" ON hearings;
DROP POLICY IF EXISTS "Hearings updatable" ON hearings;
DROP POLICY IF EXISTS "Hearings deletable" ON hearings;
DROP POLICY IF EXISTS "Hearings readable " ON hearings;
DROP POLICY IF EXISTS "Hearings insertable " ON hearings;
DROP POLICY IF EXISTS "Hearings updatable " ON hearings;
DROP POLICY IF EXISTS "Hearings deletable " ON hearings;
CREATE POLICY "hearings_select" ON hearings FOR SELECT USING (true);
CREATE POLICY "hearings_insert" ON hearings FOR INSERT WITH CHECK (true);
CREATE POLICY "hearings_update" ON hearings FOR UPDATE USING (true);
CREATE POLICY "hearings_delete" ON hearings FOR DELETE USING (true);

-- DEADLINES
DROP POLICY IF EXISTS "Deadlines readable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines insertable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines updatable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines deletable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines readable " ON deadlines;
DROP POLICY IF EXISTS "Deadlines insertable " ON deadlines;
DROP POLICY IF EXISTS "Deadlines updatable " ON deadlines;
DROP POLICY IF EXISTS "Deadlines deletable " ON deadlines;
CREATE POLICY "deadlines_select" ON deadlines FOR SELECT USING (true);
CREATE POLICY "deadlines_insert" ON deadlines FOR INSERT WITH CHECK (true);
CREATE POLICY "deadlines_update" ON deadlines FOR UPDATE USING (true);
CREATE POLICY "deadlines_delete" ON deadlines FOR DELETE USING (true);

-- ALERTS
DROP POLICY IF EXISTS "Alerts readable" ON alerts;
DROP POLICY IF EXISTS "Alerts insertable" ON alerts;
DROP POLICY IF EXISTS "Alerts updatable" ON alerts;
DROP POLICY IF EXISTS "Alerts readable " ON alerts;
DROP POLICY IF EXISTS "Alerts insertable " ON alerts;
DROP POLICY IF EXISTS "Alerts updatable " ON alerts;
CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (true);
CREATE POLICY "alerts_insert" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "alerts_update" ON alerts FOR UPDATE USING (true);
CREATE POLICY "alerts_delete" ON alerts FOR DELETE USING (true);

-- COMPANIES
DROP POLICY IF EXISTS "Companies readable" ON companies;
DROP POLICY IF EXISTS "Companies insertable" ON companies;
DROP POLICY IF EXISTS "Companies updatable" ON companies;
DROP POLICY IF EXISTS "Companies readable " ON companies;
DROP POLICY IF EXISTS "Companies insertable " ON companies;
DROP POLICY IF EXISTS "Companies updatable " ON companies;
CREATE POLICY "companies_select" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_update" ON companies FOR UPDATE USING (true);

-- FINANCIAL_ENTRIES
DROP POLICY IF EXISTS "financial_entries readable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries insertable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries updatable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries deletable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries readable " ON financial_entries;
DROP POLICY IF EXISTS "financial_entries insertable " ON financial_entries;
DROP POLICY IF EXISTS "financial_entries updatable " ON financial_entries;
DROP POLICY IF EXISTS "financial_entries deletable " ON financial_entries;
CREATE POLICY "fin_entries_select" ON financial_entries FOR SELECT USING (true);
CREATE POLICY "fin_entries_insert" ON financial_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "fin_entries_update" ON financial_entries FOR UPDATE USING (true);
CREATE POLICY "fin_entries_delete" ON financial_entries FOR DELETE USING (true);

-- CASE_FEES
DROP POLICY IF EXISTS "case_fees readable" ON case_fees;
DROP POLICY IF EXISTS "case_fees insertable" ON case_fees;
DROP POLICY IF EXISTS "case_fees updatable" ON case_fees;
DROP POLICY IF EXISTS "case_fees deletable" ON case_fees;
DROP POLICY IF EXISTS "case_fees readable " ON case_fees;
DROP POLICY IF EXISTS "case_fees insertable " ON case_fees;
DROP POLICY IF EXISTS "case_fees updatable " ON case_fees;
DROP POLICY IF EXISTS "case_fees deletable " ON case_fees;
CREATE POLICY "case_fees_select" ON case_fees FOR SELECT USING (true);
CREATE POLICY "case_fees_insert" ON case_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "case_fees_update" ON case_fees FOR UPDATE USING (true);
CREATE POLICY "case_fees_delete" ON case_fees FOR DELETE USING (true);

-- TIMESHEETS
DROP POLICY IF EXISTS "timesheets readable" ON timesheets;
DROP POLICY IF EXISTS "timesheets insertable" ON timesheets;
DROP POLICY IF EXISTS "timesheets updatable" ON timesheets;
DROP POLICY IF EXISTS "timesheets deletable" ON timesheets;
DROP POLICY IF EXISTS "timesheets readable " ON timesheets;
DROP POLICY IF EXISTS "timesheets insertable " ON timesheets;
DROP POLICY IF EXISTS "timesheets updatable " ON timesheets;
DROP POLICY IF EXISTS "timesheets deletable " ON timesheets;
CREATE POLICY "timesheets_select" ON timesheets FOR SELECT USING (true);
CREATE POLICY "timesheets_insert" ON timesheets FOR INSERT WITH CHECK (true);
CREATE POLICY "timesheets_update" ON timesheets FOR UPDATE USING (true);
CREATE POLICY "timesheets_delete" ON timesheets FOR DELETE USING (true);

-- TIMELINE_EVENTS
DROP POLICY IF EXISTS "Timeline readable" ON timeline_events;
DROP POLICY IF EXISTS "Timeline insertable" ON timeline_events;
DROP POLICY IF EXISTS "Timeline readable " ON timeline_events;
DROP POLICY IF EXISTS "Timeline insertable " ON timeline_events;
CREATE POLICY "timeline_select" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "timeline_insert" ON timeline_events FOR INSERT WITH CHECK (true);

-- CASE_MOVEMENTS
DROP POLICY IF EXISTS "Case movements readable" ON case_movements;
DROP POLICY IF EXISTS "Case movements insertable" ON case_movements;
DROP POLICY IF EXISTS "Case movements readable " ON case_movements;
DROP POLICY IF EXISTS "Case movements insertable " ON case_movements;
CREATE POLICY "movements_select" ON case_movements FOR SELECT USING (true);
CREATE POLICY "movements_insert" ON case_movements FOR INSERT WITH CHECK (true);

-- CASE_SYNC_LOG
DROP POLICY IF EXISTS "Sync log readable" ON case_sync_log;
DROP POLICY IF EXISTS "Sync log insertable" ON case_sync_log;
DROP POLICY IF EXISTS "Sync log updatable" ON case_sync_log;
DROP POLICY IF EXISTS "Sync log readable " ON case_sync_log;
DROP POLICY IF EXISTS "Sync log insertable " ON case_sync_log;
DROP POLICY IF EXISTS "Sync log updatable " ON case_sync_log;
CREATE POLICY "sync_log_select" ON case_sync_log FOR SELECT USING (true);
CREATE POLICY "sync_log_insert" ON case_sync_log FOR INSERT WITH CHECK (true);
CREATE POLICY "sync_log_update" ON case_sync_log FOR UPDATE USING (true);

-- PROFILES
DROP POLICY IF EXISTS "Profiles are readable by authenticated" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are readable by authenticated " ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile " ON profiles;
DROP POLICY IF EXISTS "Users can update own profile " ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);

-- USER_ROLES
DROP POLICY IF EXISTS "Roles readable by authenticated" ON user_roles;
DROP POLICY IF EXISTS "Roles readable by authenticated " ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (true);

-- EVIDENCE
DROP POLICY IF EXISTS "Evidence items readable" ON evidence_items;
DROP POLICY IF EXISTS "Evidence items insertable" ON evidence_items;
DROP POLICY IF EXISTS "Evidence items updatable" ON evidence_items;
DROP POLICY IF EXISTS "Evidence items readable " ON evidence_items;
DROP POLICY IF EXISTS "Evidence items insertable " ON evidence_items;
DROP POLICY IF EXISTS "Evidence items updatable " ON evidence_items;
CREATE POLICY "evidence_items_select" ON evidence_items FOR SELECT USING (true);
CREATE POLICY "evidence_items_insert" ON evidence_items FOR INSERT WITH CHECK (true);
CREATE POLICY "evidence_items_update" ON evidence_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Evidence requests readable" ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests insertable" ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests updatable" ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests readable " ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests insertable " ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests updatable " ON evidence_requests;
CREATE POLICY "evidence_requests_select" ON evidence_requests FOR SELECT USING (true);
CREATE POLICY "evidence_requests_insert" ON evidence_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "evidence_requests_update" ON evidence_requests FOR UPDATE USING (true);

-- CHECKLISTS
DROP POLICY IF EXISTS "Case checklists readable" ON case_checklists;
DROP POLICY IF EXISTS "Case checklists insertable" ON case_checklists;
DROP POLICY IF EXISTS "Case checklists updatable" ON case_checklists;
DROP POLICY IF EXISTS "Case checklists readable " ON case_checklists;
DROP POLICY IF EXISTS "Case checklists insertable " ON case_checklists;
DROP POLICY IF EXISTS "Case checklists updatable " ON case_checklists;
CREATE POLICY "case_checklists_select" ON case_checklists FOR SELECT USING (true);
CREATE POLICY "case_checklists_insert" ON case_checklists FOR INSERT WITH CHECK (true);
CREATE POLICY "case_checklists_update" ON case_checklists FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Checklist templates readable" ON checklist_templates;
DROP POLICY IF EXISTS "Checklist templates insertable" ON checklist_templates;
DROP POLICY IF EXISTS "Checklist templates updatable" ON checklist_templates;
DROP POLICY IF EXISTS "Checklist templates readable " ON checklist_templates;
DROP POLICY IF EXISTS "Checklist templates insertable " ON checklist_templates;
DROP POLICY IF EXISTS "Checklist templates updatable " ON checklist_templates;
CREATE POLICY "checklist_templates_select" ON checklist_templates FOR SELECT USING (true);
CREATE POLICY "checklist_templates_insert" ON checklist_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "checklist_templates_update" ON checklist_templates FOR UPDATE USING (true);

-- DOCUMENTS
DROP POLICY IF EXISTS "document_templates readable" ON document_templates;
DROP POLICY IF EXISTS "document_templates insertable" ON document_templates;
DROP POLICY IF EXISTS "document_templates updatable" ON document_templates;
DROP POLICY IF EXISTS "document_templates deletable" ON document_templates;
DROP POLICY IF EXISTS "document_templates readable " ON document_templates;
DROP POLICY IF EXISTS "document_templates insertable " ON document_templates;
DROP POLICY IF EXISTS "document_templates updatable " ON document_templates;
DROP POLICY IF EXISTS "document_templates deletable " ON document_templates;
CREATE POLICY "doc_templates_select" ON document_templates FOR SELECT USING (true);
CREATE POLICY "doc_templates_insert" ON document_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "doc_templates_update" ON document_templates FOR UPDATE USING (true);
CREATE POLICY "doc_templates_delete" ON document_templates FOR DELETE USING (true);

DROP POLICY IF EXISTS "generated_documents readable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents insertable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents updatable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents deletable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents readable " ON generated_documents;
DROP POLICY IF EXISTS "generated_documents insertable " ON generated_documents;
DROP POLICY IF EXISTS "generated_documents updatable " ON generated_documents;
DROP POLICY IF EXISTS "generated_documents deletable " ON generated_documents;
CREATE POLICY "gen_docs_select" ON generated_documents FOR SELECT USING (true);
CREATE POLICY "gen_docs_insert" ON generated_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "gen_docs_update" ON generated_documents FOR UPDATE USING (true);
CREATE POLICY "gen_docs_delete" ON generated_documents FOR DELETE USING (true);

DROP POLICY IF EXISTS "document_versions readable" ON document_versions;
DROP POLICY IF EXISTS "document_versions insertable" ON document_versions;
DROP POLICY IF EXISTS "document_versions readable " ON document_versions;
DROP POLICY IF EXISTS "document_versions insertable " ON document_versions;
CREATE POLICY "doc_versions_select" ON document_versions FOR SELECT USING (true);
CREATE POLICY "doc_versions_insert" ON document_versions FOR INSERT WITH CHECK (true);

-- DOWNLOAD_LOGS
DROP POLICY IF EXISTS "Download logs readable" ON download_logs;
DROP POLICY IF EXISTS "Download logs insertable" ON download_logs;
DROP POLICY IF EXISTS "Download logs readable " ON download_logs;
DROP POLICY IF EXISTS "Download logs insertable " ON download_logs;
CREATE POLICY "download_logs_select" ON download_logs FOR SELECT USING (true);
CREATE POLICY "download_logs_insert" ON download_logs FOR INSERT WITH CHECK (true);

-- EMPLOYEES
DROP POLICY IF EXISTS "Employees readable" ON employees;
DROP POLICY IF EXISTS "Employees insertable" ON employees;
DROP POLICY IF EXISTS "Employees updatable" ON employees;
DROP POLICY IF EXISTS "Employees readable " ON employees;
DROP POLICY IF EXISTS "Employees insertable " ON employees;
DROP POLICY IF EXISTS "Employees updatable " ON employees;
CREATE POLICY "employees_select" ON employees FOR SELECT USING (true);
CREATE POLICY "employees_insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "employees_update" ON employees FOR UPDATE USING (true);

-- HOLIDAYS
DROP POLICY IF EXISTS "Holidays are viewable by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be managed by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be updated by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be deleted by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays are viewable by authenticated users " ON holidays;
DROP POLICY IF EXISTS "Holidays can be managed by authenticated users " ON holidays;
DROP POLICY IF EXISTS "Holidays can be updated by authenticated users " ON holidays;
DROP POLICY IF EXISTS "Holidays can be deleted by authenticated users " ON holidays;
CREATE POLICY "holidays_select" ON holidays FOR SELECT USING (true);
CREATE POLICY "holidays_insert" ON holidays FOR INSERT WITH CHECK (true);
CREATE POLICY "holidays_update" ON holidays FOR UPDATE USING (true);
CREATE POLICY "holidays_delete" ON holidays FOR DELETE USING (true);

-- DEADLINE_SUSPENSIONS
DROP POLICY IF EXISTS "Suspensions readable" ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions insertable" ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions updatable" ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions readable " ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions insertable " ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions updatable " ON deadline_suspensions;
CREATE POLICY "suspensions_select" ON deadline_suspensions FOR SELECT USING (true);
CREATE POLICY "suspensions_insert" ON deadline_suspensions FOR INSERT WITH CHECK (true);
CREATE POLICY "suspensions_update" ON deadline_suspensions FOR UPDATE USING (true);

-- RESPONSAVEIS
DROP POLICY IF EXISTS "Responsaveis readable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis insertable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis updatable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis deletable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis readable " ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis insertable " ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis updatable " ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis deletable " ON responsaveis;
CREATE POLICY "responsaveis_select" ON responsaveis FOR SELECT USING (true);
CREATE POLICY "responsaveis_insert" ON responsaveis FOR INSERT WITH CHECK (true);
CREATE POLICY "responsaveis_update" ON responsaveis FOR UPDATE USING (true);
CREATE POLICY "responsaveis_delete" ON responsaveis FOR DELETE USING (true);
