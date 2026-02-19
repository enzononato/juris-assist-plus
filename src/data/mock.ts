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
  amount?: number;
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

// ===== TIMELINE EVENTS =====

export type TimelineEventType = 
  | 'processo_criado' | 'status_alterado' | 'prazo_criado' | 'prazo_cumprido'
  | 'audiencia_agendada' | 'audiencia_realizada' | 'prova_anexada' | 'tarefa_criada'
  | 'tarefa_concluida' | 'comentario' | 'checklist_aplicado' | 'responsavel_alterado';

export interface TimelineEvent {
  id: string;
  case_id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  user: string;
  created_at: string;
  metadata?: Record<string, string>;
}

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'te1', case_id: '1', type: 'processo_criado',
    title: 'Processo criado',
    description: 'Processo nº 0001234-56.2024.5.01.0001 cadastrado no sistema',
    user: 'Thiago', created_at: '2024-03-15T09:00:00',
  },
  {
    id: 'te2', case_id: '1', type: 'status_alterado',
    title: 'Status alterado para Em Andamento',
    description: 'Status anterior: Novo',
    user: 'Thiago', created_at: '2024-03-20T14:30:00',
  },
  {
    id: 'te3', case_id: '1', type: 'tarefa_criada',
    title: 'Tarefa criada: Reunir espelhos de ponto',
    description: 'Atribuída a Sandra, prazo 20/02/2026',
    user: 'Thiago', created_at: '2026-02-10T10:00:00',
  },
  {
    id: 'te4', case_id: '1', type: 'prova_anexada',
    title: 'Prova anexada: espelho_ponto_jan2024.pdf',
    description: 'Categoria: Ponto Eletrônico, 2.3 MB',
    user: 'Sandra', created_at: '2026-02-15T11:30:00',
  },
  {
    id: 'te5', case_id: '1', type: 'prova_anexada',
    title: 'Prova anexada: espelho_ponto_fev2024.pdf',
    description: 'Categoria: Ponto Eletrônico, 1.8 MB',
    user: 'Sandra', created_at: '2026-02-15T11:35:00',
  },
  {
    id: 'te6', case_id: '1', type: 'checklist_aplicado',
    title: 'Checklist aplicado: Provas – Jornada de Trabalho',
    description: '6 itens a serem verificados',
    user: 'Thiago', created_at: '2026-02-14T16:00:00',
  },
  {
    id: 'te7', case_id: '1', type: 'audiencia_agendada',
    title: 'Audiência de Instrução agendada',
    description: '10/03/2026 às 14:00 – 1ª Vara do Trabalho de São Paulo',
    user: 'Thiago', created_at: '2026-02-12T09:00:00',
  },
  {
    id: 'te8', case_id: '1', type: 'prazo_criado',
    title: 'Prazo criado: Manifestação sobre laudo pericial',
    description: 'Vencimento: 28/02/2026',
    user: 'Thiago', created_at: '2026-02-10T11:00:00',
  },
  {
    id: 'te9', case_id: '1', type: 'comentario',
    title: 'Comentário adicionado',
    description: 'Verificar se o reclamante apresentou novos documentos na audiência anterior.',
    user: 'Sullydaiane', created_at: '2026-02-16T08:00:00',
  },
  {
    id: 'te10', case_id: '2', type: 'processo_criado',
    title: 'Processo criado',
    description: 'Processo nº 0005678-90.2024.5.02.0002 cadastrado no sistema',
    user: 'Sandra', created_at: '2024-06-20T10:00:00',
  },
  {
    id: 'te11', case_id: '2', type: 'audiencia_agendada',
    title: 'Audiência Inicial agendada',
    description: '25/02/2026 às 10:00 – 2ª Vara do Trabalho do Rio de Janeiro',
    user: 'Sullydaiane', created_at: '2026-01-15T14:00:00',
  },
  {
    id: 'te12', case_id: '2', type: 'checklist_aplicado',
    title: 'Checklist Pré-Audiência aplicado automaticamente',
    description: '6 itens de preparação para audiência',
    user: 'Sistema', created_at: '2026-01-15T14:01:00',
  },
  {
    id: 'te13', case_id: '2', type: 'tarefa_criada',
    title: 'Tarefa criada: Confirmar presença das testemunhas',
    description: 'Atribuída a Thiago, prioridade Crítica',
    user: 'Sullydaiane', created_at: '2026-02-10T09:00:00',
  },
  {
    id: 'te14', case_id: '2', type: 'prazo_criado',
    title: 'Prazo criado: Juntada de documentos',
    description: 'Vencimento: 20/02/2026',
    user: 'Sullydaiane', created_at: '2026-02-05T11:00:00',
  },
  {
    id: 'te15', case_id: '3', type: 'processo_criado',
    title: 'Processo sigiloso criado',
    description: 'Nível: Ultra Restrito – Assédio Moral',
    user: 'Thiago', created_at: '2025-01-10T08:00:00',
  },
  {
    id: 'te16', case_id: '3', type: 'tarefa_criada',
    title: 'Tarefa criada: Solicitar registros de catraca',
    description: 'Atribuída a Sandra',
    user: 'Thiago', created_at: '2026-02-10T10:00:00',
  },
  {
    id: 'te17', case_id: '4', type: 'processo_criado',
    title: 'Processo criado',
    description: 'Processo nº 0002345-67.2025.5.01.0004 – FGTS',
    user: 'Sandra', created_at: '2024-09-05T10:00:00',
  },
  {
    id: 'te18', case_id: '4', type: 'status_alterado',
    title: 'Status alterado para Sentença',
    description: 'Sentença proferida em 10/01/2026',
    user: 'Cintia', created_at: '2026-01-10T16:00:00',
  },
  {
    id: 'te19', case_id: '5', type: 'processo_criado',
    title: 'Processo criado',
    description: 'Processo nº 0003456-78.2025.5.02.0005 – Verbas Rescisórias',
    user: 'Thiago', created_at: '2024-11-12T09:00:00',
  },
  {
    id: 'te20', case_id: '5', type: 'status_alterado',
    title: 'Status alterado para Recurso',
    description: 'Recurso Ordinário interposto',
    user: 'Sullydaiane', created_at: '2026-02-01T14:00:00',
  },
];

// ===== MOCK DATA =====

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
    responsible: 'Thiago',
    lawyer: 'Sullydaiane',
    confidentiality: 'normal',
    filed_at: '2024-03-15',
    next_hearing: '2026-03-10T14:00:00',
    next_deadline: '2026-02-28',
    amount: 85000,
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
    responsible: 'Sandra',
    lawyer: 'Sullydaiane',
    confidentiality: 'normal',
    filed_at: '2024-06-20',
    next_hearing: '2026-02-25T10:00:00',
    next_deadline: '2026-02-20',
    amount: 120000,
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
    responsible: 'Thiago',
    lawyer: 'Sullydaiane',
    confidentiality: 'ultra_restrito',
    filed_at: '2025-01-10',
    next_deadline: '2026-03-05',
    amount: 250000,
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
    responsible: 'Sandra',
    lawyer: 'Cintia',
    confidentiality: 'normal',
    filed_at: '2024-09-05',
    amount: 45000,
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
    responsible: 'Thiago',
    lawyer: 'Sullydaiane',
    confidentiality: 'normal',
    filed_at: '2024-11-12',
    next_deadline: '2026-03-15',
    amount: 175000,
  },
  {
    id: '6',
    case_number: '0007890-11.2023.5.01.0006',
    company_id: 'c6',
    company: 'Revalle Alagoinhas',
    branch: 'Alagoinhas - BA',
    employee: 'Thiago Barbosa',
    employee_id: 'e11',
    theme: 'Equiparação Salarial',
    status: 'encerrado',
    court: '1ª Vara do Trabalho de Alagoinhas',
    responsible: 'Sandra',
    lawyer: 'Cintia',
    confidentiality: 'normal',
    filed_at: '2023-04-10',
    amount: 32000,
  },
  {
    id: '7',
    case_number: '0004321-99.2022.5.03.0007',
    company_id: 'c7',
    company: 'Revalle Serrinha',
    branch: 'Serrinha - BA',
    employee: 'Bruno Nascimento',
    employee_id: 'e13',
    theme: 'Acidente de Trabalho',
    status: 'encerrado',
    court: '1ª Vara do Trabalho de Serrinha',
    responsible: 'Thiago',
    lawyer: 'Sullydaiane',
    confidentiality: 'normal',
    filed_at: '2022-08-22',
    amount: 98000,
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Reunir espelhos de ponto do período 2023-2024',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    assignees: ['Sandra'],
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
    assignees: ['Thiago'],
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
    assignees: ['Sullydaiane', 'Thiago'],
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
    assignees: ['Samilly'],
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
    assignees: ['Sandra'],
    due_at: '2026-02-22T15:00:00',
    priority: 'alta',
    status: 'aguardando',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '6',
    title: 'Revisar cálculos de verbas rescisórias',
    case_id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    employee: 'Ricardo Souza',
    assignees: ['Cintia'],
    due_at: '2026-03-01T17:00:00',
    priority: 'alta',
    status: 'aberta',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '7',
    title: 'Preparar recurso ordinário',
    case_id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    employee: 'Ricardo Souza',
    assignees: ['Sullydaiane', 'Thiago'],
    due_at: '2026-03-10T18:00:00',
    priority: 'critica',
    status: 'em_andamento',
    show_in_calendar: true,
    all_day: false,
  },
  {
    id: '8',
    title: 'Coletar depoimento de testemunha interna',
    case_id: '3',
    case_number: '0009876-12.2024.5.03.0003',
    employee: 'Pedro Henrique Costa',
    assignees: ['Thiago'],
    due_at: '2026-02-28T14:00:00',
    priority: 'alta',
    status: 'aberta',
    show_in_calendar: false,
    all_day: false,
  },
  {
    id: '9',
    title: 'Enviar documentos ao perito',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    assignees: ['Sullydaiane'],
    due_at: '2026-02-25T12:00:00',
    priority: 'media',
    status: 'concluida',
    show_in_calendar: false,
    all_day: false,
  },
  {
    id: '10',
    title: 'Atualizar planilha de FGTS',
    case_id: '4',
    case_number: '0002345-67.2025.5.01.0004',
    employee: 'Juliana Rodrigues',
    assignees: ['Sandra'],
    due_at: '2026-02-19T17:00:00',
    priority: 'baixa',
    status: 'concluida',
    show_in_calendar: false,
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
  {
    id: '3',
    case_id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    employee: 'Ricardo Souza',
    date: '2026-04-15',
    time: '09:30',
    type: 'Audiência de Julgamento',
    court: '1ª Vara do Trabalho de Paulo Afonso',
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
  {
    id: '4',
    case_id: '3',
    case_number: '0009876-12.2024.5.03.0003',
    employee: 'Pedro Henrique Costa',
    title: 'Prazo para resposta à notificação',
    due_at: '2026-03-05',
    status: 'pendente',
  },
  {
    id: '5',
    case_id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    employee: 'Carlos Alberto Silva',
    title: 'Prazo para entrega de documentos ao perito',
    due_at: '2026-02-22',
    status: 'cumprido',
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
  sha256?: string;
}

export interface DownloadLog {
  id: string;
  evidence_item_id: string;
  user: string;
  downloaded_at: string;
  watermarked: boolean;
}

export const mockEvidenceRequests: EvidenceRequest[] = [
  {
    id: 'er1',
    case_id: '1',
    theme: 'Jornada de Trabalho',
    description: 'Reunir todos os espelhos de ponto e registros de jornada do período 2023-2024',
    assigned_areas: ['DP', 'RH'],
    assigned_users: ['Sandra'],
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
    assigned_users: ['Samilly'],
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
    assigned_users: ['Sandra'],
    status: 'atrasada',
    sla_hours: 72,
    created_at: '2026-02-10T09:00:00',
    due_at: '2026-02-13T09:00:00',
  },
];

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'ei1', request_id: 'er1', case_id: '1',
    filename: 'espelho_ponto_jan2024.pdf', category: 'ponto_eletronico', origin: 'sistema_ponto',
    fact_date: '2024-01-01', uploaded_by: 'Sandra', uploaded_at: '2026-02-15T11:30:00',
    status: 'validado', file_size: '2.3 MB', sha256: 'a1b2c3d4e5f6789012345678abcdef01234567890abcdef1234567890abcdef12',
  },
  {
    id: 'ei2', request_id: 'er1', case_id: '1',
    filename: 'espelho_ponto_fev2024.pdf', category: 'ponto_eletronico', origin: 'sistema_ponto',
    fact_date: '2024-02-01', uploaded_by: 'Sandra', uploaded_at: '2026-02-15T11:35:00',
    status: 'recebido', file_size: '1.8 MB', sha256: 'b2c3d4e5f6789012345678abcdef01234567890abcdef1234567890abcdef1234',
  },
  {
    id: 'ei3', request_id: 'er1', case_id: '1',
    filename: 'escala_trabalho_2023.xlsx', category: 'escalas', origin: 'drive',
    fact_date: '2023-01-01', uploaded_by: 'Samilly', uploaded_at: '2026-02-16T09:00:00',
    status: 'pendente', file_size: '856 KB', sha256: 'c3d4e5f6789012345678abcdef01234567890abcdef1234567890abcdef123456',
  },
  {
    id: 'ei4', request_id: 'er3', case_id: '3',
    filename: 'registro_cftv_corredor.mp4', category: 'cftv_camera', origin: 'servidor',
    fact_date: '2025-01-05', uploaded_by: 'Sandra', uploaded_at: '2026-02-12T16:00:00',
    status: 'recebido', file_size: '45.2 MB', sha256: 'd4e5f6789012345678abcdef01234567890abcdef1234567890abcdef12345678',
  },
  {
    id: 'ei5', request_id: 'er2', case_id: '1',
    filename: 'autorizacao_he_mar2024.pdf', category: 'documentos_assinados', origin: 'drive',
    fact_date: '2024-03-01', uploaded_by: 'Samilly', uploaded_at: '2026-02-16T10:30:00',
    status: 'recebido', file_size: '340 KB', sha256: 'e5f6789012345678abcdef01234567890abcdef1234567890abcdef1234567890',
  },
  {
    id: 'ei6', request_id: 'er2', case_id: '1',
    filename: 'comprovante_pgto_he_abr2024.pdf', category: 'documentos_assinados', origin: 'email',
    fact_date: '2024-04-01', uploaded_by: 'Sandra', uploaded_at: '2026-02-16T14:00:00',
    status: 'pendente', file_size: '210 KB', sha256: 'f6789012345678abcdef01234567890abcdef1234567890abcdef123456789012',
  },
  {
    id: 'ei7', request_id: 'er3', case_id: '3',
    filename: 'logs_acesso_jan2025.csv', category: 'catraca_controle_acesso', origin: 'sistema_catraca',
    fact_date: '2025-01-01', uploaded_by: 'Sandra', uploaded_at: '2026-02-13T09:00:00',
    status: 'validado', file_size: '1.2 MB', sha256: '0789012345678abcdef01234567890abcdef1234567890abcdef12345678901234',
  },
  {
    id: 'ei8', request_id: 'er3', case_id: '3',
    filename: 'conversas_teams_supervisor.pdf', category: 'conversas_oficiais', origin: 'outro',
    fact_date: '2024-12-15', uploaded_by: 'Thiago', uploaded_at: '2026-02-14T11:00:00',
    status: 'recebido', file_size: '3.5 MB', sha256: '1234567890abcdef01234567890abcdef1234567890abcdef1234567890abcdef',
  },
  {
    id: 'ei9', request_id: 'er1', case_id: '1',
    filename: 'espelho_ponto_mar2024.pdf', category: 'ponto_eletronico', origin: 'sistema_ponto',
    fact_date: '2024-03-01', uploaded_by: 'Sandra', uploaded_at: '2026-02-16T15:00:00',
    status: 'recebido', file_size: '2.1 MB', sha256: '2345678abcdef01234567890abcdef1234567890abcdef1234567890abcdef0123',
  },
  {
    id: 'ei10', request_id: 'er3', case_id: '3',
    filename: 'atestado_medico_reclamante.pdf', category: 'atestados_justificativas', origin: 'email',
    fact_date: '2025-01-08', uploaded_by: 'Thiago', uploaded_at: '2026-02-15T08:00:00',
    status: 'validado', file_size: '450 KB', sha256: '345678abcdef01234567890abcdef1234567890abcdef1234567890abcdef012345',
  },
];

export const mockDownloadLogs: DownloadLog[] = [
  { id: 'dl1', evidence_item_id: 'ei1', user: 'Thiago', downloaded_at: '2026-02-15T14:00:00', watermarked: false },
  { id: 'dl2', evidence_item_id: 'ei1', user: 'Sullydaiane', downloaded_at: '2026-02-15T16:30:00', watermarked: false },
  { id: 'dl3', evidence_item_id: 'ei4', user: 'Thiago', downloaded_at: '2026-02-13T10:00:00', watermarked: true },
  { id: 'dl4', evidence_item_id: 'ei7', user: 'Thiago', downloaded_at: '2026-02-14T09:30:00', watermarked: true },
  { id: 'dl5', evidence_item_id: 'ei8', user: 'Thiago', downloaded_at: '2026-02-14T11:30:00', watermarked: true },
  { id: 'dl6', evidence_item_id: 'ei3', user: 'Samilly', downloaded_at: '2026-02-16T09:15:00', watermarked: false },
  { id: 'dl7', evidence_item_id: 'ei2', user: 'Sandra', downloaded_at: '2026-02-16T10:00:00', watermarked: false },
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
      { id: 'i1', text: 'Provas anexadas ao processo?', checked: true, checked_by: 'Thiago', checked_at: '2026-02-18T10:00:00' },
      { id: 'i2', text: 'Documentos enviados ao jurídico?', checked: true, checked_by: 'Sandra', checked_at: '2026-02-18T11:00:00' },
      { id: 'i3', text: 'Testemunhas confirmadas?', checked: false },
      { id: 'i4', text: 'Representante da empresa presente?', checked: false },
      { id: 'i5', text: 'Conferência de horários e link (caso virtual)?', checked: true, checked_by: 'Thiago', checked_at: '2026-02-19T09:00:00' },
      { id: 'i6', text: 'Procuração assinada e atualizada?', checked: true, checked_by: 'Thiago', checked_at: '2026-02-17T14:00:00' },
    ],
  },
  {
    id: 'cc2',
    case_id: '1',
    template_id: 'ct3',
    template_name: 'Provas – Jornada de Trabalho',
    type: 'provas_por_tema',
    items: [
      { id: 'i1', text: 'Espelhos de ponto completos do período', checked: true, checked_by: 'Sandra', checked_at: '2026-02-15T11:30:00' },
      { id: 'i2', text: 'Escalas de trabalho', checked: true, checked_by: 'Samilly', checked_at: '2026-02-16T09:00:00' },
      { id: 'i3', text: 'Registros de catraca / controle de acesso', checked: false },
      { id: 'i4', text: 'Autorizações de horas extras', checked: false },
      { id: 'i5', text: 'Comprovantes de pagamento de HE', checked: false },
      { id: 'i6', text: 'Banco de horas (se aplicável)', checked: false },
    ],
  },
];

// ===== RESPONSÁVEIS =====

export interface Responsavel {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  company_id: string;
  alerts_audiencias: boolean;
  alerts_prazos: boolean;
  alerts_tarefas: boolean;
  alerts_whatsapp: boolean;
  alerts_email: boolean;
  active: boolean;
}

export const mockResponsaveis: Responsavel[] = [
  {
    id: 'r1',
    name: 'Thiago',
    phone: '(74) 99912-3456',
    email: 'thiago@revalle.com.br',
    role: 'Administrador',
    company_id: 'all',
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: true,
    alerts_whatsapp: true,
    alerts_email: true,
    active: true,
  },
  {
    id: 'r2',
    name: 'Sandra',
    phone: '(74) 99934-5678',
    email: 'sandra@revalle.com.br',
    role: 'Departamento Pessoal',
    company_id: 'all',
    alerts_audiencias: false,
    alerts_prazos: true,
    alerts_tarefas: true,
    alerts_whatsapp: true,
    alerts_email: false,
    active: true,
  },
  {
    id: 'r3',
    name: 'Sullydaiane',
    phone: '(71) 99876-5432',
    email: 'sullydaiane@advocacia.com.br',
    role: 'Advogada Externa',
    company_id: 'c1',
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: false,
    alerts_whatsapp: false,
    alerts_email: true,
    active: true,
  },
  {
    id: 'r4',
    name: 'Sullydaiane',
    phone: '(87) 99765-4321',
    email: 'sullydaiane@advocacia.com.br',
    role: 'Advogada Externa',
    company_id: 'c2',
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: false,
    alerts_whatsapp: true,
    alerts_email: true,
    active: true,
  },
  {
    id: 'r5',
    name: 'Cintia',
    phone: '(74) 99888-7654',
    email: 'cintia@revalle.com.br',
    role: 'Advogada Interna',
    company_id: 'all',
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: true,
    alerts_whatsapp: true,
    alerts_email: true,
    active: true,
  },
];
