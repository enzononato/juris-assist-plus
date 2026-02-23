
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE for demo (mock auth)
-- CASES
DROP POLICY IF EXISTS "Cases readable" ON cases;
DROP POLICY IF EXISTS "Cases insertable" ON cases;
DROP POLICY IF EXISTS "Cases updatable" ON cases;
DROP POLICY IF EXISTS "Cases deletable" ON cases;
CREATE POLICY "Cases readable" ON cases FOR SELECT USING (true);
CREATE POLICY "Cases insertable" ON cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Cases updatable" ON cases FOR UPDATE USING (true);
CREATE POLICY "Cases deletable" ON cases FOR DELETE USING (true);

-- TASKS
DROP POLICY IF EXISTS "Tasks readable" ON tasks;
DROP POLICY IF EXISTS "Tasks insertable" ON tasks;
DROP POLICY IF EXISTS "Tasks updatable" ON tasks;
DROP POLICY IF EXISTS "Tasks deletable" ON tasks;
CREATE POLICY "Tasks readable" ON tasks FOR SELECT USING (true);
CREATE POLICY "Tasks insertable" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tasks updatable" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Tasks deletable" ON tasks FOR DELETE USING (true);

-- HEARINGS
DROP POLICY IF EXISTS "Hearings readable" ON hearings;
DROP POLICY IF EXISTS "Hearings insertable" ON hearings;
DROP POLICY IF EXISTS "Hearings updatable" ON hearings;
DROP POLICY IF EXISTS "Hearings deletable" ON hearings;
CREATE POLICY "Hearings readable" ON hearings FOR SELECT USING (true);
CREATE POLICY "Hearings insertable" ON hearings FOR INSERT WITH CHECK (true);
CREATE POLICY "Hearings updatable" ON hearings FOR UPDATE USING (true);
CREATE POLICY "Hearings deletable" ON hearings FOR DELETE USING (true);

-- DEADLINES
DROP POLICY IF EXISTS "Deadlines readable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines insertable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines updatable" ON deadlines;
DROP POLICY IF EXISTS "Deadlines deletable" ON deadlines;
CREATE POLICY "Deadlines readable" ON deadlines FOR SELECT USING (true);
CREATE POLICY "Deadlines insertable" ON deadlines FOR INSERT WITH CHECK (true);
CREATE POLICY "Deadlines updatable" ON deadlines FOR UPDATE USING (true);
CREATE POLICY "Deadlines deletable" ON deadlines FOR DELETE USING (true);

-- COMPANIES
DROP POLICY IF EXISTS "Companies readable" ON companies;
DROP POLICY IF EXISTS "Companies insertable" ON companies;
DROP POLICY IF EXISTS "Companies updatable" ON companies;
CREATE POLICY "Companies readable" ON companies FOR SELECT USING (true);
CREATE POLICY "Companies insertable" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Companies updatable" ON companies FOR UPDATE USING (true);

-- EMPLOYEES
DROP POLICY IF EXISTS "Employees readable" ON employees;
DROP POLICY IF EXISTS "Employees insertable" ON employees;
DROP POLICY IF EXISTS "Employees updatable" ON employees;
CREATE POLICY "Employees readable" ON employees FOR SELECT USING (true);
CREATE POLICY "Employees insertable" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees updatable" ON employees FOR UPDATE USING (true);

-- FINANCIAL_ENTRIES
DROP POLICY IF EXISTS "financial_entries readable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries insertable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries updatable" ON financial_entries;
DROP POLICY IF EXISTS "financial_entries deletable" ON financial_entries;
CREATE POLICY "financial_entries readable" ON financial_entries FOR SELECT USING (true);
CREATE POLICY "financial_entries insertable" ON financial_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "financial_entries updatable" ON financial_entries FOR UPDATE USING (true);
CREATE POLICY "financial_entries deletable" ON financial_entries FOR DELETE USING (true);

-- CASE_FEES
DROP POLICY IF EXISTS "case_fees readable" ON case_fees;
DROP POLICY IF EXISTS "case_fees insertable" ON case_fees;
DROP POLICY IF EXISTS "case_fees updatable" ON case_fees;
DROP POLICY IF EXISTS "case_fees deletable" ON case_fees;
CREATE POLICY "case_fees readable" ON case_fees FOR SELECT USING (true);
CREATE POLICY "case_fees insertable" ON case_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "case_fees updatable" ON case_fees FOR UPDATE USING (true);
CREATE POLICY "case_fees deletable" ON case_fees FOR DELETE USING (true);

-- TIMESHEETS
DROP POLICY IF EXISTS "timesheets readable" ON timesheets;
DROP POLICY IF EXISTS "timesheets insertable" ON timesheets;
DROP POLICY IF EXISTS "timesheets updatable" ON timesheets;
DROP POLICY IF EXISTS "timesheets deletable" ON timesheets;
CREATE POLICY "timesheets readable" ON timesheets FOR SELECT USING (true);
CREATE POLICY "timesheets insertable" ON timesheets FOR INSERT WITH CHECK (true);
CREATE POLICY "timesheets updatable" ON timesheets FOR UPDATE USING (true);
CREATE POLICY "timesheets deletable" ON timesheets FOR DELETE USING (true);

-- ALERTS
DROP POLICY IF EXISTS "Alerts readable" ON alerts;
DROP POLICY IF EXISTS "Alerts insertable" ON alerts;
DROP POLICY IF EXISTS "Alerts updatable" ON alerts;
CREATE POLICY "Alerts readable" ON alerts FOR SELECT USING (true);
CREATE POLICY "Alerts insertable" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Alerts updatable" ON alerts FOR UPDATE USING (true);

-- RESPONSAVEIS
DROP POLICY IF EXISTS "Responsaveis readable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis insertable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis updatable" ON responsaveis;
DROP POLICY IF EXISTS "Responsaveis deletable" ON responsaveis;
CREATE POLICY "Responsaveis readable" ON responsaveis FOR SELECT USING (true);
CREATE POLICY "Responsaveis insertable" ON responsaveis FOR INSERT WITH CHECK (true);
CREATE POLICY "Responsaveis updatable" ON responsaveis FOR UPDATE USING (true);
CREATE POLICY "Responsaveis deletable" ON responsaveis FOR DELETE USING (true);

-- TIMELINE_EVENTS
DROP POLICY IF EXISTS "Timeline readable" ON timeline_events;
DROP POLICY IF EXISTS "Timeline insertable" ON timeline_events;
CREATE POLICY "Timeline readable" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Timeline insertable" ON timeline_events FOR INSERT WITH CHECK (true);

-- CASE_MOVEMENTS  
DROP POLICY IF EXISTS "Case movements readable" ON case_movements;
DROP POLICY IF EXISTS "Case movements insertable" ON case_movements;
CREATE POLICY "Case movements readable" ON case_movements FOR SELECT USING (true);
CREATE POLICY "Case movements insertable" ON case_movements FOR INSERT WITH CHECK (true);

-- CASE_CHECKLISTS
DROP POLICY IF EXISTS "Case checklists readable" ON case_checklists;
DROP POLICY IF EXISTS "Case checklists insertable" ON case_checklists;
DROP POLICY IF EXISTS "Case checklists updatable" ON case_checklists;
CREATE POLICY "Case checklists readable" ON case_checklists FOR SELECT USING (true);
CREATE POLICY "Case checklists insertable" ON case_checklists FOR INSERT WITH CHECK (true);
CREATE POLICY "Case checklists updatable" ON case_checklists FOR UPDATE USING (true);

-- EVIDENCE tables
DROP POLICY IF EXISTS "Evidence requests readable" ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests insertable" ON evidence_requests;
DROP POLICY IF EXISTS "Evidence requests updatable" ON evidence_requests;
CREATE POLICY "Evidence requests readable" ON evidence_requests FOR SELECT USING (true);
CREATE POLICY "Evidence requests insertable" ON evidence_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Evidence requests updatable" ON evidence_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Evidence items readable" ON evidence_items;
DROP POLICY IF EXISTS "Evidence items insertable" ON evidence_items;
DROP POLICY IF EXISTS "Evidence items updatable" ON evidence_items;
CREATE POLICY "Evidence items readable" ON evidence_items FOR SELECT USING (true);
CREATE POLICY "Evidence items insertable" ON evidence_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Evidence items updatable" ON evidence_items FOR UPDATE USING (true);

-- GENERATED_DOCUMENTS
DROP POLICY IF EXISTS "generated_documents readable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents insertable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents updatable" ON generated_documents;
DROP POLICY IF EXISTS "generated_documents deletable" ON generated_documents;
CREATE POLICY "generated_documents readable" ON generated_documents FOR SELECT USING (true);
CREATE POLICY "generated_documents insertable" ON generated_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "generated_documents updatable" ON generated_documents FOR UPDATE USING (true);
CREATE POLICY "generated_documents deletable" ON generated_documents FOR DELETE USING (true);

-- DOCUMENT_VERSIONS
DROP POLICY IF EXISTS "document_versions readable" ON document_versions;
DROP POLICY IF EXISTS "document_versions insertable" ON document_versions;
CREATE POLICY "document_versions readable" ON document_versions FOR SELECT USING (true);
CREATE POLICY "document_versions insertable" ON document_versions FOR INSERT WITH CHECK (true);

-- DOWNLOAD_LOGS
DROP POLICY IF EXISTS "Download logs readable" ON download_logs;
DROP POLICY IF EXISTS "Download logs insertable" ON download_logs;
CREATE POLICY "Download logs readable" ON download_logs FOR SELECT USING (true);
CREATE POLICY "Download logs insertable" ON download_logs FOR INSERT WITH CHECK (true);

-- DEADLINE_SUSPENSIONS
DROP POLICY IF EXISTS "Suspensions readable" ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions insertable" ON deadline_suspensions;
DROP POLICY IF EXISTS "Suspensions updatable" ON deadline_suspensions;
CREATE POLICY "Suspensions readable" ON deadline_suspensions FOR SELECT USING (true);
CREATE POLICY "Suspensions insertable" ON deadline_suspensions FOR INSERT WITH CHECK (true);
CREATE POLICY "Suspensions updatable" ON deadline_suspensions FOR UPDATE USING (true);

-- CASE_SYNC_LOG
DROP POLICY IF EXISTS "Sync log readable" ON case_sync_log;
DROP POLICY IF EXISTS "Sync log insertable" ON case_sync_log;
DROP POLICY IF EXISTS "Sync log updatable" ON case_sync_log;
CREATE POLICY "Sync log readable" ON case_sync_log FOR SELECT USING (true);
CREATE POLICY "Sync log insertable" ON case_sync_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Sync log updatable" ON case_sync_log FOR UPDATE USING (true);
