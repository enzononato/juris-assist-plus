export type CaseStatus = 'novo' | 'em_andamento' | 'audiencia_marcada' | 'sentenca' | 'recurso' | 'encerrado';
export type Priority = 'baixa' | 'media' | 'alta' | 'critica';
export type TaskStatus = 'aberta' | 'em_andamento' | 'aguardando' | 'concluida';
export type AlertSeverity = 'info' | 'atencao' | 'urgente';
export type AlertType = 'prazo' | 'audiencia' | 'tarefa' | 'prova' | 'publicacao';

export interface Company {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  company_id: string;
  role: string;
}

export interface Case {
  id: string;
  case_number: string;
  company_id: string;
  company: string;
  branch: string;
  employee: string;
  employee_id: string;
  theme: string;
  status: CaseStatus;
  court: string;
  responsible: string;
  lawyer: string;
  confidentiality: 'normal' | 'restrito' | 'ultra_restrito';
  filed_at: string;
  next_hearing?: string;
  next_deadline?: string;
}

export interface Task {
  id: string;
  title: string;
  case_id?: string;
  case_number?: string;
  employee?: string;
  assignees: string[];
  due_at: string;
  priority: Priority;
  status: TaskStatus;
  show_in_calendar: boolean;
  all_day: boolean;
}

export interface Hearing {
  id: string;
  case_id: string;
  case_number: string;
  employee: string;
  date: string;
  time: string;
  type: string;
  court: string;
  status: 'agendada' | 'realizada' | 'adiada' | 'cancelada';
}

export interface Deadline {
  id: string;
  case_id: string;
  case_number: string;
  employee: string;
  title: string;
  due_at: string;
  status: 'pendente' | 'cumprido' | 'vencido';
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  case_number?: string;
  employee?: string;
  event_date: string;
  severity: AlertSeverity;
  treated: boolean;
}

export const mockCompanies: Company[] = [
  { id: 'c1', name: 'Revalle Juazeiro' },
  { id: 'c2', name: 'Revalle Bonfim' },
  { id: 'c3', name: 'Revalle Petrolina' },
  { id: 'c4', name: 'Revalle Ribeira do Pombal' },
  { id: 'c5', name: 'Revalle Paulo Afonso' },
  { id: 'c6', name: 'Revalle Alagoinhas' },
  { id: 'c7', name: 'Revalle Serrinha' },
];

export const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Carlos Alberto Silva', company_id: 'c1', role: 'Operador de Produção' },
  { id: 'e2', name: 'Ana Paula Santos', company_id: 'c1', role: 'Assistente Administrativo' },
  { id: 'e3', name: 'Maria Fernanda Oliveira', company_id: 'c2', role: 'Auxiliar de Logística' },
  { id: 'e4', name: 'José Roberto Lima', company_id: 'c2', role: 'Motorista' },
  { id: 'e5', name: 'Pedro Henrique Costa', company_id: 'c3', role: 'Vendedor' },
  { id: 'e6', name: 'Luciana Pereira', company_id: 'c3', role: 'Caixa' },
  { id: 'e7', name: 'Juliana Rodrigues', company_id: 'c4', role: 'Supervisora de Produção' },
  { id: 'e8', name: 'Marcos Antônio Souza', company_id: 'c4', role: 'Operador de Máquinas' },
  { id: 'e9', name: 'Ricardo Souza', company_id: 'c5', role: 'Técnico de Manutenção' },
  { id: 'e10', name: 'Fernanda Almeida', company_id: 'c5', role: 'Assistente de RH' },
  { id: 'e11', name: 'Thiago Barbosa', company_id: 'c6', role: 'Estoquista' },
  { id: 'e12', name: 'Camila Ferreira', company_id: 'c6', role: 'Recepcionista' },
  { id: 'e13', name: 'Bruno Nascimento', company_id: 'c7', role: 'Vendedor Externo' },
  { id: 'e14', name: 'Patrícia Mendes', company_id: 'c7', role: 'Auxiliar Financeiro' },
];

export const mockCases: Case[] = [
  {
    id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    company_id: 'c1',
    company: 'Revalle Juazeiro',
    branch: 'Juazeiro - BA',
    employee: 'Carlos Alberto Silva',
    employee_id: 'e1',
    theme: 'Horas Extras',
    status: 'em_andamento',
    court: '1ª Vara do Trabalho de Juazeiro',
    responsible: 'Ana Jurídico',
    lawyer: 'Dr. Roberto Advogado',
    confidentiality: 'normal',
    filed_at: '2024-03-15',
    next_hearing: '2026-03-10T14:00:00',
    next_deadline: '2026-02-28',
  },
  {
    id: '2',
    case_number: '0005678-90.2024.5.02.0002',
    company_id: 'c2',
    company: 'Revalle Bonfim',
    branch: 'Senhor do Bonfim - BA',
    employee: 'Maria Fernanda Oliveira',
    employee_id: 'e3',
    theme: 'Rescisão Indireta',
    status: 'audiencia_marcada',
    court: '1ª Vara do Trabalho de Senhor do Bonfim',
    responsible: 'João DP',
    lawyer: 'Dra. Patrícia Externa',
    confidentiality: 'normal',
    filed_at: '2024-06-20',
    next_hearing: '2026-02-25T10:00:00',
    next_deadline: '2026-02-20',
  },
  {
    id: '3',
    case_number: '0009876-12.2024.5.03.0003',
    company_id: 'c3',
    company: 'Revalle Petrolina',
    branch: 'Petrolina - PE',
    employee: 'Pedro Henrique Costa',
    employee_id: 'e5',
    theme: 'Assédio Moral',
    status: 'novo',
    court: '1ª Vara do Trabalho de Petrolina',
    responsible: 'Ana Jurídico',
    lawyer: 'Dr. Roberto Advogado',
    confidentiality: 'ultra_restrito',
    filed_at: '2025-01-10',
    next_deadline: '2026-03-05',
  },
  {
    id: '4',
    case_number: '0002345-67.2025.5.01.0004',
    company_id: 'c4',
    company: 'Revalle Ribeira do Pombal',
    branch: 'Ribeira do Pombal - BA',
    employee: 'Juliana Rodrigues',
    employee_id: 'e7',
    theme: 'FGTS',
    status: 'sentenca',
    court: '1ª Vara do Trabalho de Ribeira do Pombal',
    responsible: 'João DP',
    lawyer: 'Dr. Marcos Interno',
    confidentiality: 'normal',
    filed_at: '2024-09-05',
  },
  {
    id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    company_id: 'c5',
    company: 'Revalle Paulo Afonso',
    branch: 'Paulo Afonso - BA',
    employee: 'Ricardo Souza',
    employee_id: 'e9',
    theme: 'Verbas Rescisórias',
    status: 'recurso',
    court: '1ª Vara do Trabalho de Paulo Afonso',
    responsible: 'Ana Jurídico',
    lawyer: 'Dra. Patrícia Externa',
    confidentiality: 'normal',
    filed_at: '2024-11-12',
    next_deadline: '2026-03-15',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Reunir espelhos de ponto do período 2023-2024',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    assignees: ['João DP'],
    due_at: '2026-02-20T17:00:00',
    priority: 'alta',
    status: 'aberta',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '2',
    title: 'Confirmar presença das testemunhas para audiência',
    case_id: '2',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    assignees: ['Ana Jurídico'],
    due_at: '2026-02-23T12:00:00',
    priority: 'critica',
    status: 'em_andamento',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '3',
    title: 'Preparar contestação para audiência inicial',
    case_id: '2',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    assignees: ['Dr. Roberto Advogado', 'Ana Jurídico'],
    due_at: '2026-02-24T18:00:00',
    priority: 'critica',
    status: 'aberta',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '4',
    title: 'Verificar escala de trabalho do reclamante',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    assignees: ['Maria RH'],
    due_at: '2026-02-18T17:00:00',
    priority: 'media',
    status: 'concluida',
    show_in_calendar: false,
    all_day: false,
  },
  {
    id: '5',
    title: 'Solicitar registros de catraca ao setor de segurança',
    case_id: '3',
    case_number: '0009876-12.2024.5.03.0003',
    employee: 'Pedro Henrique Costa',
    assignees: ['João DP'],
    due_at: '2026-02-22T15:00:00',
    priority: 'alta',
    status: 'aguardando',
    show_in_calendar: true,
    all_day: false,
  },
];

export const mockHearings: Hearing[] = [
  {
    id: '1',
    case_id: '2',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    date: '2026-02-25',
    time: '10:00',
    type: 'Audiência Inicial',
    court: '2ª Vara do Trabalho do Rio de Janeiro',
    status: 'agendada',
  },
  {
    id: '2',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    date: '2026-03-10',
    time: '14:00',
    type: 'Audiência de Instrução',
    court: '1ª Vara do Trabalho de São Paulo',
    status: 'agendada',
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: '1',
    case_id: '2',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    title: 'Prazo para juntada de documentos',
    due_at: '2026-02-20',
    status: 'pendente',
  },
  {
    id: '2',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    title: 'Prazo para manifestação sobre laudo pericial',
    due_at: '2026-02-28',
    status: 'pendente',
  },
  {
    id: '3',
    case_id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    employee: 'Ricardo Souza',
    title: 'Prazo recursal - Recurso Ordinário',
    due_at: '2026-03-15',
    status: 'pendente',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'audiencia',
    title: 'Audiência em 7 dias',
    description: 'Audiência Inicial marcada para 25/02/2026 às 10:00',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    event_date: '2026-02-25T10:00:00',
    severity: 'atencao',
    treated: false,
  },
  {
    id: '2',
    type: 'prazo',
    title: 'Prazo vencendo em 2 dias',
    description: 'Prazo para juntada de documentos vence em 20/02/2026',
    case_number: '0005678-90.2024.5.02.0002',
    employee: 'Maria Fernanda Oliveira',
    event_date: '2026-02-20T23:59:00',
    severity: 'urgente',
    treated: false,
  },
  {
    id: '3',
    type: 'tarefa',
    title: 'Tarefa próxima do vencimento',
    description: 'Reunir espelhos de ponto vence em 20/02',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    event_date: '2026-02-20T17:00:00',
    severity: 'atencao',
    treated: false,
  },
  {
    id: '4',
    type: 'prova',
    title: 'SLA de prova em risco',
    description: 'Solicitação de registros de catraca com 48h sem atendimento',
    case_number: '0009876-12.2024.5.03.0003',
    employee: 'Pedro Henrique Costa',
    event_date: '2026-02-18T15:00:00',
    severity: 'urgente',
    treated: false,
  },
  {
    id: '5',
    type: 'prazo',
    title: 'Prazo recursal se aproximando',
    description: 'Recurso Ordinário - prazo final 15/03/2026',
    case_number: '0003456-78.2025.5.02.0005',
    employee: 'Ricardo Souza',
    event_date: '2026-03-15T23:59:00',
    severity: 'info',
    treated: true,
  },
  {
    id: '6',
    type: 'audiencia',
    title: 'Audiência de Instrução em 3 semanas',
    description: 'Audiência de Instrução em 10/03/2026 às 14:00',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    event_date: '2026-03-10T14:00:00',
    severity: 'info',
    treated: true,
  },
];

export const statusLabels: Record<CaseStatus, string> = {
  novo: 'Novo',
  em_andamento: 'Em Andamento',
  audiencia_marcada: 'Audiência Marcada',
  sentenca: 'Sentença',
  recurso: 'Recurso',
  encerrado: 'Encerrado',
};

export const priorityLabels: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  aguardando: 'Aguardando',
  concluida: 'Concluída',
};

// ===== PROVAS / EVIDENCE =====

export type EvidenceCategory = 'ponto_eletronico' | 'escalas' | 'treinamento' | 'conversas_oficiais' | 'cftv_camera' | 'documentos_assinados' | 'emails' | 'atestados_justificativas' | 'epi_advertencias' | 'catraca_controle_acesso' | 'logs_servidor' | 'logs_sistemas' | 'outros';
export type EvidenceOrigin = 'email' | 'whatsapp_corporativo' | 'drive' | 'sistema_ponto' | 'sistema_catraca' | 'servidor' | 'outro';
export type EvidenceRequestStatus = 'aberta' | 'parcialmente_atendida' | 'atendida' | 'atrasada';
export type EvidenceItemStatus = 'pendente' | 'recebido' | 'validado' | 'recusado';

export const evidenceCategoryLabels: Record<EvidenceCategory, string> = {
  ponto_eletronico: 'Ponto Eletrônico',
  escalas: 'Escalas',
  treinamento: 'Treinamento',
  conversas_oficiais: 'Conversas Oficiais',
  cftv_camera: 'CFTV / Câmera',
  documentos_assinados: 'Documentos Assinados',
  emails: 'E-mails',
  atestados_justificativas: 'Atestados / Justificativas',
  epi_advertencias: 'EPI / Advertências',
  catraca_controle_acesso: 'Catraca / Controle de Acesso',
  logs_servidor: 'Logs de Servidor',
  logs_sistemas: 'Logs de Sistemas',
  outros: 'Outros',
};

export const evidenceOriginLabels: Record<EvidenceOrigin, string> = {
  email: 'E-mail',
  whatsapp_corporativo: 'WhatsApp Corporativo',
  drive: 'Drive',
  sistema_ponto: 'Sistema de Ponto',
  sistema_catraca: 'Sistema de Catraca',
  servidor: 'Servidor',
  outro: 'Outro',
};

export interface EvidenceRequest {
  id: string;
  case_id: string;
  theme: string;
  description: string;
  assigned_areas: string[];
  assigned_users: string[];
  status: EvidenceRequestStatus;
  sla_hours: number;
  created_at: string;
  due_at: string;
}

export interface EvidenceItem {
  id: string;
  request_id: string;
  case_id: string;
  filename: string;
  category: EvidenceCategory;
  origin: EvidenceOrigin;
  fact_date: string;
  uploaded_by: string;
  uploaded_at: string;
  status: EvidenceItemStatus;
  file_size: string;
}

export const mockEvidenceRequests: EvidenceRequest[] = [
  {
    id: 'er1',
    case_id: '1',
    theme: 'Jornada de Trabalho',
    description: 'Reunir todos os espelhos de ponto e registros de jornada do período 2023-2024',
    assigned_areas: ['DP', 'RH'],
    assigned_users: ['João DP'],
    status: 'parcialmente_atendida',
    sla_hours: 72,
    created_at: '2026-02-14T10:00:00',
    due_at: '2026-02-17T10:00:00',
  },
  {
    id: 'er2',
    case_id: '1',
    theme: 'Horas Extras',
    description: 'Coletar escalas de trabalho, registros de horas extras autorizadas e comprovantes de pagamento',
    assigned_areas: ['DP'],
    assigned_users: ['Maria RH'],
    status: 'aberta',
    sla_hours: 72,
    created_at: '2026-02-15T14:00:00',
    due_at: '2026-02-18T14:00:00',
  },
  {
    id: 'er3',
    case_id: '3',
    theme: 'Assédio Moral',
    description: 'Levantar registros de câmeras CFTV, logs de acesso e conversas oficiais do período denunciado',
    assigned_areas: ['RH', 'LOGÍSTICA'],
    assigned_users: ['João DP'],
    status: 'atrasada',
    sla_hours: 72,
    created_at: '2026-02-10T09:00:00',
    due_at: '2026-02-13T09:00:00',
  },
];

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'ei1',
    request_id: 'er1',
    case_id: '1',
    filename: 'espelho_ponto_jan2024.pdf',
    category: 'ponto_eletronico',
    origin: 'sistema_ponto',
    fact_date: '2024-01-01',
    uploaded_by: 'João DP',
    uploaded_at: '2026-02-15T11:30:00',
    status: 'validado',
    file_size: '2.3 MB',
  },
  {
    id: 'ei2',
    request_id: 'er1',
    case_id: '1',
    filename: 'espelho_ponto_fev2024.pdf',
    category: 'ponto_eletronico',
    origin: 'sistema_ponto',
    fact_date: '2024-02-01',
    uploaded_by: 'João DP',
    uploaded_at: '2026-02-15T11:35:00',
    status: 'recebido',
    file_size: '1.8 MB',
  },
  {
    id: 'ei3',
    request_id: 'er1',
    case_id: '1',
    filename: 'escala_trabalho_2023.xlsx',
    category: 'escalas',
    origin: 'drive',
    fact_date: '2023-01-01',
    uploaded_by: 'Maria RH',
    uploaded_at: '2026-02-16T09:00:00',
    status: 'pendente',
    file_size: '856 KB',
  },
  {
    id: 'ei4',
    request_id: 'er3',
    case_id: '3',
    filename: 'registro_cftv_corredor.mp4',
    category: 'cftv_camera',
    origin: 'servidor',
    fact_date: '2025-01-05',
    uploaded_by: 'João DP',
    uploaded_at: '2026-02-12T16:00:00',
    status: 'recebido',
    file_size: '45.2 MB',
  },
];

// ===== CHECKLISTS =====

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'pre_audiencia' | 'pos_audiencia' | 'provas_por_tema';
  theme?: string;
  items: { id: string; text: string }[];
}

export interface CaseChecklist {
  id: string;
  case_id: string;
  template_id: string;
  template_name: string;
  type: 'pre_audiencia' | 'pos_audiencia' | 'provas_por_tema';
  hearing_id?: string;
  items: { id: string; text: string; checked: boolean; checked_by?: string; checked_at?: string }[];
}

export const checklistTypeLabels: Record<string, string> = {
  pre_audiencia: 'Pré-Audiência',
  pos_audiencia: 'Pós-Audiência',
  provas_por_tema: 'Provas por Tema',
};

export const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 'ct1',
    name: 'Checklist Pré-Audiência Padrão',
    type: 'pre_audiencia',
    items: [
      { id: 'i1', text: 'Provas anexadas ao processo?' },
      { id: 'i2', text: 'Documentos enviados ao jurídico?' },
      { id: 'i3', text: 'Testemunhas confirmadas?' },
      { id: 'i4', text: 'Representante da empresa presente?' },
      { id: 'i5', text: 'Conferência de horários e link (caso virtual)?' },
      { id: 'i6', text: 'Procuração assinada e atualizada?' },
    ],
  },
  {
    id: 'ct2',
    name: 'Checklist Pós-Audiência Padrão',
    type: 'pos_audiencia',
    items: [
      { id: 'i1', text: 'Registrar resultado da audiência' },
      { id: 'i2', text: 'Registrar próximos prazos definidos' },
      { id: 'i3', text: 'Atribuir dono das novas tarefas' },
      { id: 'i4', text: 'Arquivar ata da audiência' },
      { id: 'i5', text: 'Atualizar status do processo' },
    ],
  },
  {
    id: 'ct3',
    name: 'Provas – Jornada de Trabalho',
    type: 'provas_por_tema',
    theme: 'Horas Extras',
    items: [
      { id: 'i1', text: 'Espelhos de ponto completos do período' },
      { id: 'i2', text: 'Escalas de trabalho' },
      { id: 'i3', text: 'Registros de catraca / controle de acesso' },
      { id: 'i4', text: 'Autorizações de horas extras' },
      { id: 'i5', text: 'Comprovantes de pagamento de HE' },
      { id: 'i6', text: 'Banco de horas (se aplicável)' },
    ],
  },
];

export const mockCaseChecklists: CaseChecklist[] = [
  {
    id: 'cc1',
    case_id: '2',
    template_id: 'ct1',
    template_name: 'Checklist Pré-Audiência Padrão',
    type: 'pre_audiencia',
    hearing_id: '1',
    items: [
      { id: 'i1', text: 'Provas anexadas ao processo?', checked: true, checked_by: 'Ana Jurídico', checked_at: '2026-02-18T10:00:00' },
      { id: 'i2', text: 'Documentos enviados ao jurídico?', checked: true, checked_by: 'João DP', checked_at: '2026-02-18T11:00:00' },
      { id: 'i3', text: 'Testemunhas confirmadas?', checked: false },
      { id: 'i4', text: 'Representante da empresa presente?', checked: false },
      { id: 'i5', text: 'Conferência de horários e link (caso virtual)?', checked: true, checked_by: 'Ana Jurídico', checked_at: '2026-02-19T09:00:00' },
      { id: 'i6', text: 'Procuração assinada e atualizada?', checked: true, checked_by: 'Ana Jurídico', checked_at: '2026-02-17T14:00:00' },
    ],
  },
  {
    id: 'cc2',
    case_id: '1',
    template_id: 'ct3',
    template_name: 'Provas – Jornada de Trabalho',
    type: 'provas_por_tema',
    items: [
      { id: 'i1', text: 'Espelhos de ponto completos do período', checked: true, checked_by: 'João DP', checked_at: '2026-02-15T11:30:00' },
      { id: 'i2', text: 'Escalas de trabalho', checked: true, checked_by: 'Maria RH', checked_at: '2026-02-16T09:00:00' },
      { id: 'i3', text: 'Registros de catraca / controle de acesso', checked: false },
      { id: 'i4', text: 'Autorizações de horas extras', checked: false },
      { id: 'i5', text: 'Comprovantes de pagamento de HE', checked: false },
      { id: 'i6', text: 'Banco de horas (se aplicável)', checked: false },
    ],
  },
];
