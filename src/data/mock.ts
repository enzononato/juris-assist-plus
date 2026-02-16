export type CaseStatus = 'novo' | 'em_andamento' | 'audiencia_marcada' | 'sentenca' | 'recurso' | 'encerrado';
export type Priority = 'baixa' | 'media' | 'alta' | 'critica';
export type TaskStatus = 'aberta' | 'em_andamento' | 'aguardando' | 'concluida';
export type AlertSeverity = 'info' | 'atencao' | 'urgente';
export type AlertType = 'prazo' | 'audiencia' | 'tarefa' | 'prova' | 'publicacao';

export interface Case {
  id: string;
  case_number: string;
  company: string;
  branch: string;
  employee: string;
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

export const mockCases: Case[] = [
  {
    id: '1',
    case_number: '0001234-56.2024.5.01.0001',
    company: 'Tech Solutions Ltda',
    branch: 'Filial São Paulo',
    employee: 'Carlos Alberto Silva',
    theme: 'Horas Extras',
    status: 'em_andamento',
    court: '1ª Vara do Trabalho de São Paulo',
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
    company: 'Logística Express SA',
    branch: 'Filial Rio de Janeiro',
    employee: 'Maria Fernanda Oliveira',
    theme: 'Rescisão Indireta',
    status: 'audiencia_marcada',
    court: '2ª Vara do Trabalho do Rio de Janeiro',
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
    company: 'Tech Solutions Ltda',
    branch: 'Filial Belo Horizonte',
    employee: 'Pedro Henrique Costa',
    theme: 'Assédio Moral',
    status: 'novo',
    court: '3ª Vara do Trabalho de Belo Horizonte',
    responsible: 'Ana Jurídico',
    lawyer: 'Dr. Roberto Advogado',
    confidentiality: 'ultra_restrito',
    filed_at: '2025-01-10',
    next_deadline: '2026-03-05',
  },
  {
    id: '4',
    case_number: '0002345-67.2025.5.01.0004',
    company: 'Comércio Global Ltda',
    branch: 'Filial Curitiba',
    employee: 'Juliana Rodrigues',
    theme: 'FGTS',
    status: 'sentenca',
    court: '4ª Vara do Trabalho de Curitiba',
    responsible: 'João DP',
    lawyer: 'Dr. Marcos Interno',
    confidentiality: 'normal',
    filed_at: '2024-09-05',
  },
  {
    id: '5',
    case_number: '0003456-78.2025.5.02.0005',
    company: 'Logística Express SA',
    branch: 'Filial São Paulo',
    employee: 'Ricardo Souza',
    theme: 'Verbas Rescisórias',
    status: 'recurso',
    court: '5ª Vara do Trabalho de São Paulo',
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
