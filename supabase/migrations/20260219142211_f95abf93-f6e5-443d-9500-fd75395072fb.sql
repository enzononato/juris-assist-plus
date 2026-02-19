
-- =============================================
-- DADOS REAIS REVALLE - USANDO USUÁRIOS EXISTENTES
-- =============================================

-- 1. UNIDADES
INSERT INTO units (id, code, name, city, state, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'JUA', 'Revalle Juazeiro',          'Juazeiro',          'BA', true),
  ('a2000000-0000-0000-0000-000000000002'::uuid, 'BON', 'Revalle Bonfim',            'Senhor do Bonfim',  'BA', true),
  ('a3000000-0000-0000-0000-000000000003'::uuid, 'PET', 'Revalle Petrolina',         'Petrolina',         'PE', true),
  ('a4000000-0000-0000-0000-000000000004'::uuid, 'RPO', 'Revalle Ribeira do Pombal', 'Ribeira do Pombal', 'BA', true),
  ('a5000000-0000-0000-0000-000000000005'::uuid, 'PAF', 'Revalle Paulo Afonso',      'Paulo Afonso',      'BA', true),
  ('a6000000-0000-0000-0000-000000000006'::uuid, 'ALA', 'Revalle Alagoinhas',        'Alagoinhas',        'BA', true),
  ('a7000000-0000-0000-0000-000000000007'::uuid, 'SER', 'Revalle Serrinha',          'Serrinha',          'BA', true)
ON CONFLICT (id) DO NOTHING;

-- 2. ACESSO ÀS UNIDADES
INSERT INTO user_unit_access (user_id, unit_id)
SELECT u.user_id::uuid, un.id
FROM (VALUES
  ('20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('a1ace2ca-e0d5-4821-885c-5053f6f8ffc3'),
  ('f2a43dbc-f987-4b80-b21a-b62587ea7d2f'),
  ('106ba77e-1e8f-4a2f-ad60-ff7e8f743b3e'),
  ('23e4cb3f-33c3-4365-9298-e408b67334f5')
) AS u(user_id)
CROSS JOIN units un
ON CONFLICT DO NOTHING;

INSERT INTO user_unit_access (user_id, unit_id) VALUES
  ('c72a0e16-a31f-44ab-9b20-a6bdc440734c'::uuid,'a1000000-0000-0000-0000-000000000001'::uuid),
  ('c72a0e16-a31f-44ab-9b20-a6bdc440734c'::uuid,'a2000000-0000-0000-0000-000000000002'::uuid),
  ('de43e81d-512e-466c-8b34-4793b4b2444a'::uuid,'a3000000-0000-0000-0000-000000000003'::uuid),
  ('de43e81d-512e-466c-8b34-4793b4b2444a'::uuid,'a4000000-0000-0000-0000-000000000004'::uuid),
  ('abee28f1-a5b6-4f26-94dd-03f8341f09d2'::uuid,'a5000000-0000-0000-0000-000000000005'::uuid),
  ('abee28f1-a5b6-4f26-94dd-03f8341f09d2'::uuid,'a6000000-0000-0000-0000-000000000006'::uuid),
  ('abee28f1-a5b6-4f26-94dd-03f8341f09d2'::uuid,'a7000000-0000-0000-0000-000000000007'::uuid),
  ('fc8877a4-cd20-41dc-bc1f-6a4b02d99caa'::uuid,'a1000000-0000-0000-0000-000000000001'::uuid),
  ('e7858801-4d52-44f1-b320-ff5c6bbf5bda'::uuid,'a3000000-0000-0000-0000-000000000003'::uuid),
  ('c014a79f-dd5b-4b5f-8191-76db7202875a'::uuid,'a2000000-0000-0000-0000-000000000002'::uuid),
  ('5bc19777-4d82-42f6-a36e-e9332ecd4305'::uuid,'a1000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT DO NOTHING;

-- 3. FERIADOS 2025/2026
INSERT INTO holidays (name, date, created_by) VALUES
  ('Confraternização Universal','2025-01-01','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Carnaval','2025-03-03','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Carnaval','2025-03-04','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Sexta-feira Santa','2025-04-18','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Tiradentes','2025-04-21','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Dia do Trabalho','2025-05-01','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Corpus Christi','2025-06-19','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Independência do Brasil','2025-09-07','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Nossa Sra. Aparecida','2025-10-12','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Finados','2025-11-02','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Proclamação da República','2025-11-15','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Natal','2025-12-25','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Confraternização Universal','2026-01-01','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Carnaval','2026-02-16','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Carnaval','2026-02-17','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Sexta-feira Santa','2026-04-03','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Tiradentes','2026-04-21','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Dia do Trabalho','2026-05-01','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Independência do Brasil','2026-09-07','20846e5f-4561-4ade-b564-4a7d8c62ef78'),
  ('Natal','2026-12-25','20846e5f-4561-4ade-b564-4a7d8c62ef78');

-- 4. SLA CONFIGS (sem id fixo, deixar gen_random_uuid)
INSERT INTO sla_configs (benefit_type, green_hours, yellow_hours, time_unit) VALUES
  ('alteracao_ferias',24,48,'hours'),
  ('aviso_folga_falta',8,24,'hours'),
  ('atestado',4,12,'hours'),
  ('contracheque',48,72,'hours'),
  ('abono_horas',24,48,'hours'),
  ('farmacia',2,6,'hours'),
  ('vale_transporte',24,48,'hours'),
  ('outros',48,96,'hours'),
  ('otica',48,96,'hours'),
  ('oficina',48,96,'hours'),
  ('papelaria',24,48,'hours'),
  ('autoescola',48,72,'hours'),
  ('relatorio_ponto',24,48,'hours'),
  ('operacao_domingo',8,24,'hours'),
  ('alteracao_horario',24,48,'hours'),
  ('vale_gas',24,48,'hours'),
  ('plano_odontologico',48,72,'hours'),
  ('plano_saude',48,72,'hours');

-- 5. PARCERIAS
INSERT INTO partnerships (name, type, contact_name, contact_phone, contact_email, city, state, is_active) VALUES
  ('Farmácia São João','farmacia','Geraldo Mendes','(74) 3611-1001','contato@farmaciasjoao.com.br','Juazeiro','BA',true),
  ('Ótica Visão Clara','otica','Sandra Lima','(74) 3622-2002','vendas@visaoclara.com.br','Juazeiro','BA',true),
  ('Auto Escola Pioneira','autoescola','Roberto Alves','(74) 3611-3003','contato@aepioneira.com.br','Juazeiro','BA',true),
  ('Oficina do Zé Mecânico','oficina','José Carlos','(74) 99844-4004','zemecanico@gmail.com','Senhor do Bonfim','BA',true),
  ('Papelaria Criativa','papelaria','Cláudia Reis','(87) 3862-5005','papelaria.criativa@gmail.com','Petrolina','PE',true),
  ('Plano Odonto Sorriso','plano_odontologico','Dr. Flávio Melo','(75) 3641-6006','atendimento@sorriso.com.br','Alagoinhas','BA',true),
  ('Plano de Saúde VidaMais','plano_saude','Dra. Carla Pinto','(75) 3641-7007','empresarial@vidamais.com.br','Alagoinhas','BA',true),
  ('Posto Revalle','vale_gas','Marcos Fuel','(74) 99900-8888','financeiro@postorevalle.com.br','Juazeiro','BA',true),
  ('Ótica Bonfim','otica','Paulo Vieira','(74) 3611-9009','oticabonfim@gmail.com','Senhor do Bonfim','BA',true),
  ('Farmácia Popular Petrolina','farmacia','Rita Sousa','(87) 3862-0010','farmaciapt@gmail.com','Petrolina','PE',true);

-- 6. ATIVOS DE TI
INSERT INTO assets (unit_id, name, type, status, health, ip_address, location, description, sla_target) VALUES
  ('a1000000-0000-0000-0000-000000000001'::uuid,'Servidor Principal JUA','server','operational',98,'192.168.1.10','Sala de TI','Servidor Dell PowerEdge R540',99.9),
  ('a1000000-0000-0000-0000-000000000001'::uuid,'Switch Core JUA','switch','operational',95,'192.168.1.1','Sala de TI','Switch Cisco Catalyst 2960',99.5),
  ('a1000000-0000-0000-0000-000000000001'::uuid,'Link Internet JUA','link','operational',92,'','Sala de TI','Fibra óptica 200Mbps',99.0),
  ('a2000000-0000-0000-0000-000000000002'::uuid,'Servidor BON','server','operational',96,'192.168.2.10','Sala de TI','Servidor HP ProLiant DL380',99.9),
  ('a2000000-0000-0000-0000-000000000002'::uuid,'Link Internet BON','link','warning',78,'','Sala de TI','Fibra óptica 100Mbps',99.0),
  ('a3000000-0000-0000-0000-000000000003'::uuid,'Servidor PET','server','operational',99,'192.168.3.10','Sala de TI','Servidor Dell PowerEdge R440',99.9),
  ('a3000000-0000-0000-0000-000000000003'::uuid,'Firewall PET','firewall','operational',100,'192.168.3.1','Sala de TI','Fortinet FortiGate 60F',99.9),
  ('a4000000-0000-0000-0000-000000000004'::uuid,'Servidor RPO','server','maintenance',60,'192.168.4.10','Sala de TI','Servidor HP ProLiant ML350',99.0),
  ('a5000000-0000-0000-0000-000000000005'::uuid,'Servidor PAF','server','operational',97,'192.168.5.10','Sala de TI','Servidor Dell PowerEdge R540',99.9),
  ('a5000000-0000-0000-0000-000000000005'::uuid,'NVR Câmeras PAF','nvr','operational',100,'192.168.5.20','Segurança','NVR Intelbras 16 canais',99.5),
  ('a6000000-0000-0000-0000-000000000006'::uuid,'Servidor ALA','server','operational',94,'192.168.6.10','Sala de TI','Servidor Dell PowerEdge R440',99.9),
  ('a6000000-0000-0000-0000-000000000006'::uuid,'Link Internet ALA','link','critical',40,'','Sala de TI','Fibra óptica 100Mbps',99.0),
  ('a7000000-0000-0000-0000-000000000007'::uuid,'Servidor SER','server','operational',91,'192.168.7.10','Sala de TI','Servidor HP ProLiant DL380',99.9),
  ('a7000000-0000-0000-0000-000000000007'::uuid,'Nobreak SER','nobreak','operational',88,'','Sala de TI','Nobreak APC Smart-UPS 1500VA',99.0);

-- 7. ALERTAS (usando IDs dos ativos recém-inseridos via subquery)
INSERT INTO alerts (unit_id, asset_id, title, description, severity, status)
SELECT a.unit_id, a.id, v.title, v.description, v.severity::alert_severity, v.status::alert_status
FROM (VALUES
  ('Link Internet BON',  'Link Internet com instabilidade','Perda de pacotes acima de 15% no link de Bonfim','warning','active'),
  ('Servidor RPO',       'Servidor em manutenção','Servidor de Ribeira do Pombal em manutenção preventiva','warning','acknowledged'),
  ('Link Internet ALA',  'Link Internet CRÍTICO - Alagoinhas','Link de internet fora do ar na unidade de Alagoinhas','critical','active'),
  ('Servidor Principal JUA','Backup concluído com sucesso','Backup diário do servidor de Juazeiro realizado com sucesso','info','resolved')
) AS v(asset_name, title, description, severity, status)
JOIN assets a ON a.name = v.asset_name;

-- 8. SISTEMA CONFIG
INSERT INTO system_config (key, value, description) VALUES
  ('app_name','"Revalle"','Nome da aplicação'),
  ('max_benefit_value','500','Valor máximo padrão por solicitação em R$'),
  ('notification_email','"ti@revalle.com.br"','E-mail para notificações do sistema'),
  ('sla_warning_threshold','80','% mínimo de SLA antes de alerta'),
  ('whatsapp_bot_enabled','true','Habilita recebimento de solicitações via WhatsApp Bot'),
  ('admission_required_farmacia','30','Dias mínimos de admissão para solicitar farmácia'),
  ('admission_required_autoescola','365','Dias mínimos de admissão para solicitar autoescola')
ON CONFLICT (key) DO NOTHING;
