
-- Seed realistic cases data
INSERT INTO public.cases (case_number, employee_name, company_id, theme, status, responsible, amount, filed_at, confidentiality, court) VALUES
('0000587-45.2024.5.05.0191', 'Carlos Eduardo Silva', 'c0000000-0000-0000-0000-000000000001', 'Horas extras, Adicional noturno', 'em_andamento', 'Thiago', 45000.00, '2024-03-15', 'normal', '1ª Vara do Trabalho de Juazeiro'),
('0001234-12.2024.5.06.0001', 'Maria Aparecida Santos', 'c0000000-0000-0000-0000-000000000003', 'Rescisão indireta, FGTS', 'em_andamento', 'Sandra', 78000.00, '2024-05-22', 'normal', '2ª Vara do Trabalho de Petrolina'),
('0002345-67.2024.5.05.0461', 'José Roberto Oliveira', 'c0000000-0000-0000-0000-000000000002', 'Assédio moral, Danos morais', 'audiencia_marcada', 'Sullydaiane', 120000.00, '2024-01-10', 'restrito', 'Vara do Trabalho de Bonfim'),
('0003456-89.2025.5.05.0191', 'Ana Paula Ferreira', 'c0000000-0000-0000-0000-000000000001', 'Equiparação salarial', 'novo', 'Thiago', 35000.00, '2025-01-08', 'normal', '1ª Vara do Trabalho de Juazeiro'),
('0004567-01.2024.5.06.0001', 'Ricardo Mendes Lima', 'c0000000-0000-0000-0000-000000000003', 'Acidente de trabalho, Estabilidade', 'recurso', 'Cintia', 200000.00, '2024-07-03', 'normal', '1ª Vara do Trabalho de Petrolina'),
('0005678-23.2025.5.05.0191', 'Fernanda Costa Souza', 'c0000000-0000-0000-0000-000000000004', 'Verbas rescisórias', 'em_andamento', 'Sandra', 22000.00, '2025-02-14', 'normal', 'Vara do Trabalho de Ribeira do Pombal'),
('0006789-34.2024.5.05.0461', 'Pedro Henrique Alves', 'c0000000-0000-0000-0000-000000000005', 'Insalubridade, Periculosidade', 'sentenca', 'Sullydaiane', 95000.00, '2024-04-20', 'normal', 'Vara do Trabalho de Paulo Afonso'),
('0007890-56.2024.5.05.0191', 'Luciana Martins Rocha', 'c0000000-0000-0000-0000-000000000001', 'Desvio de função', 'encerrado', 'Thiago', 55000.00, '2023-11-05', 'normal', '1ª Vara do Trabalho de Juazeiro'),
('0008901-78.2025.5.05.0191', 'Marcos Vinícius Pereira', 'c0000000-0000-0000-0000-000000000006', 'Justa causa revertida', 'em_andamento', 'Cintia', 67000.00, '2025-01-20', 'normal', 'Vara do Trabalho de Alagoinhas'),
('0009012-90.2025.5.05.0461', 'Juliana Beatriz Ramos', 'c0000000-0000-0000-0000-000000000007', 'Horas extras, Intervalo intrajornada', 'em_andamento', 'Sandra', 42000.00, '2025-02-01', 'normal', 'Vara do Trabalho de Serrinha');

-- Seed some tasks
INSERT INTO public.tasks (title, case_id, status, priority, due_at, assignees, show_in_calendar) VALUES
('Preparar contestação', (SELECT id FROM cases WHERE case_number = '0000587-45.2024.5.05.0191'), 'aberta', 'alta', '2026-03-01T14:00:00Z', ARRAY['Thiago'], true),
('Coletar provas documentais', (SELECT id FROM cases WHERE case_number = '0001234-12.2024.5.06.0001'), 'em_andamento', 'critica', '2026-02-28T10:00:00Z', ARRAY['Sandra'], true),
('Revisar cálculos trabalhistas', (SELECT id FROM cases WHERE case_number = '0002345-67.2024.5.05.0461'), 'aberta', 'media', '2026-03-10T16:00:00Z', ARRAY['Sullydaiane'], true),
('Agendar perícia médica', (SELECT id FROM cases WHERE case_number = '0004567-01.2024.5.06.0001'), 'aguardando', 'alta', '2026-03-05T09:00:00Z', ARRAY['Cintia'], true);

-- Seed some hearings
INSERT INTO public.hearings (case_id, date, time, type, court, status) VALUES
((SELECT id FROM cases WHERE case_number = '0002345-67.2024.5.05.0461'), '2026-03-15', '09:30', 'Instrução', 'Vara do Trabalho de Bonfim', 'agendada'),
((SELECT id FROM cases WHERE case_number = '0000587-45.2024.5.05.0191'), '2026-03-20', '14:00', 'Conciliação', '1ª Vara do Trabalho de Juazeiro', 'agendada'),
((SELECT id FROM cases WHERE case_number = '0001234-12.2024.5.06.0001'), '2026-04-02', '10:00', 'Julgamento', '2ª Vara do Trabalho de Petrolina', 'agendada');

-- Seed some deadlines
INSERT INTO public.deadlines (case_id, title, due_at, status, deadline_type) VALUES
((SELECT id FROM cases WHERE case_number = '0000587-45.2024.5.05.0191'), 'Prazo para contestação', '2026-03-01T23:59:00Z', 'pendente', 'judicial'),
((SELECT id FROM cases WHERE case_number = '0001234-12.2024.5.06.0001'), 'Juntada de documentos', '2026-02-28T23:59:00Z', 'pendente', 'judicial'),
((SELECT id FROM cases WHERE case_number = '0003456-89.2025.5.05.0191'), 'Manifestação inicial', '2026-03-10T23:59:00Z', 'pendente', 'judicial');

-- Seed some alerts
INSERT INTO public.alerts (title, type, severity, case_number, employee_name, description, event_date) VALUES
('Prazo vencendo em 3 dias', 'prazo', 'urgente', '0000587-45.2024.5.05.0191', 'Carlos Eduardo Silva', 'Prazo para contestação vence em 01/03/2026', '2026-03-01'),
('Audiência em 7 dias', 'audiencia', 'atencao', '0002345-67.2024.5.05.0461', 'José Roberto Oliveira', 'Audiência de instrução agendada para 15/03/2026', '2026-03-15');
