
-- ========================================
-- SEED ALL DATA
-- ========================================

-- Companies
INSERT INTO public.companies (id, name) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Revalle Juazeiro'),
  ('c0000000-0000-0000-0000-000000000002', 'Revalle Bonfim'),
  ('c0000000-0000-0000-0000-000000000003', 'Revalle Petrolina'),
  ('c0000000-0000-0000-0000-000000000004', 'Revalle Ribeira do Pombal'),
  ('c0000000-0000-0000-0000-000000000005', 'Revalle Paulo Afonso'),
  ('c0000000-0000-0000-0000-000000000006', 'Revalle Alagoinhas'),
  ('c0000000-0000-0000-0000-000000000007', 'Revalle Serrinha');

-- Employees
INSERT INTO public.employees (id, name, company_id, role) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Carlos Alberto Silva', 'c0000000-0000-0000-0000-000000000001', 'Operador de Produção'),
  ('e0000000-0000-0000-0000-000000000002', 'Ana Paula Santos', 'c0000000-0000-0000-0000-000000000001', 'Assistente Administrativo'),
  ('e0000000-0000-0000-0000-000000000003', 'Maria Fernanda Oliveira', 'c0000000-0000-0000-0000-000000000002', 'Auxiliar de Logística'),
  ('e0000000-0000-0000-0000-000000000004', 'José Roberto Lima', 'c0000000-0000-0000-0000-000000000002', 'Motorista'),
  ('e0000000-0000-0000-0000-000000000005', 'Pedro Henrique Costa', 'c0000000-0000-0000-0000-000000000003', 'Vendedor'),
  ('e0000000-0000-0000-0000-000000000006', 'Luciana Pereira', 'c0000000-0000-0000-0000-000000000003', 'Caixa'),
  ('e0000000-0000-0000-0000-000000000007', 'Juliana Rodrigues', 'c0000000-0000-0000-0000-000000000004', 'Supervisora de Produção'),
  ('e0000000-0000-0000-0000-000000000008', 'Marcos Antônio Souza', 'c0000000-0000-0000-0000-000000000004', 'Operador de Máquinas'),
  ('e0000000-0000-0000-0000-000000000009', 'Ricardo Souza', 'c0000000-0000-0000-0000-000000000005', 'Técnico de Manutenção'),
  ('e0000000-0000-0000-0000-000000000010', 'Fernanda Almeida', 'c0000000-0000-0000-0000-000000000005', 'Assistente de RH'),
  ('e0000000-0000-0000-0000-000000000011', 'Thiago Barbosa', 'c0000000-0000-0000-0000-000000000006', 'Estoquista'),
  ('e0000000-0000-0000-0000-000000000012', 'Camila Ferreira', 'c0000000-0000-0000-0000-000000000006', 'Recepcionista'),
  ('e0000000-0000-0000-0000-000000000013', 'Bruno Nascimento', 'c0000000-0000-0000-0000-000000000007', 'Vendedor Externo'),
  ('e0000000-0000-0000-0000-000000000014', 'Patrícia Mendes', 'c0000000-0000-0000-0000-000000000007', 'Auxiliar Financeiro');

-- Checklist Templates
INSERT INTO public.checklist_templates (id, name, type, theme, items) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Checklist Pré-Audiência Padrão', 'pre_audiencia', NULL, 
   '[{"id":"i1","text":"Provas anexadas ao processo?"},{"id":"i2","text":"Documentos enviados ao jurídico?"},{"id":"i3","text":"Testemunhas confirmadas?"},{"id":"i4","text":"Representante da empresa presente?"},{"id":"i5","text":"Conferência de horários e link (caso virtual)?"},{"id":"i6","text":"Procuração assinada e atualizada?"}]'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'Checklist Pós-Audiência Padrão', 'pos_audiencia', NULL,
   '[{"id":"i1","text":"Registrar resultado da audiência"},{"id":"i2","text":"Registrar próximos prazos definidos"},{"id":"i3","text":"Atribuir dono das novas tarefas"},{"id":"i4","text":"Arquivar ata da audiência"},{"id":"i5","text":"Atualizar status do processo"}]'::jsonb),
  ('a0000000-0000-0000-0000-000000000003', 'Provas – Jornada de Trabalho', 'provas_por_tema', 'Horas Extras',
   '[{"id":"i1","text":"Espelhos de ponto completos do período"},{"id":"i2","text":"Escalas de trabalho"},{"id":"i3","text":"Registros de catraca / controle de acesso"},{"id":"i4","text":"Autorizações de horas extras"},{"id":"i5","text":"Comprovantes de pagamento de HE"},{"id":"i6","text":"Banco de horas (se aplicável)"}]'::jsonb);

-- Responsaveis
INSERT INTO public.responsaveis (id, name, phone, email, role, company_id, company_id_all, alerts_audiencias, alerts_prazos, alerts_tarefas, alerts_whatsapp, alerts_email, active) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Thiago', '(74) 99912-3456', 'thiago@revalle.com.br', 'Administrador', NULL, true, true, true, true, true, true, true),
  ('b0000000-0000-0000-0000-000000000002', 'Sandra', '(74) 99934-5678', 'sandra@revalle.com.br', 'Departamento Pessoal', NULL, true, false, true, true, true, false, true),
  ('b0000000-0000-0000-0000-000000000003', 'Sullydaiane', '(71) 99876-5432', 'sullydaiane@advocacia.com.br', 'Advogada Externa', 'c0000000-0000-0000-0000-000000000001', false, true, true, false, false, true, true),
  ('b0000000-0000-0000-0000-000000000004', 'Sullydaiane', '(87) 99765-4321', 'sullydaiane@advocacia.com.br', 'Advogada Externa', 'c0000000-0000-0000-0000-000000000002', false, true, true, false, true, true, true),
  ('b0000000-0000-0000-0000-000000000005', 'Cintia', '(74) 99888-7654', 'cintia@revalle.com.br', 'Advogada Interna', NULL, true, true, true, true, true, true, true);
