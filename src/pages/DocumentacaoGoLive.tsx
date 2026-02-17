import { useState } from "react";
import {
  BookOpen, GraduationCap, Rocket, CheckCircle2, Circle, Clock,
  Users, Shield, Bell, FileText, CalendarDays, BarChart3,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: { id: string; title: string; status: "disponivel" | "em_breve" }[];
}

interface TrainingSession {
  id: string;
  title: string;
  audience: string;
  duration: string;
  status: "concluido" | "agendado" | "pendente";
  date?: string;
  participants?: number;
  topics: string[];
}

interface GoLiveItem {
  id: string;
  category: string;
  title: string;
  status: "concluido" | "em_andamento" | "pendente";
  responsible: string;
  notes?: string;
}

const docSections: DocSection[] = [
  {
    id: "d1", title: "Processos", icon: <FileText className="h-4 w-4" />,
    description: "CRUD de processos, status, timeline e ACL de sigilo",
    articles: [
      { id: "a1", title: "Criar novo processo", status: "disponivel" },
      { id: "a2", title: "Alterar status do processo", status: "disponivel" },
      { id: "a3", title: "Configurar sigilo (normal/restrito/ultra_restrito)", status: "disponivel" },
      { id: "a4", title: "Timeline de eventos", status: "disponivel" },
    ],
  },
  {
    id: "d2", title: "Provas & Evidências", icon: <Shield className="h-4 w-4" />,
    description: "SLA, upload, metadados obrigatórios e marca d'água",
    articles: [
      { id: "a5", title: "Criar solicitação de prova com SLA", status: "disponivel" },
      { id: "a6", title: "Upload de evidência com metadados", status: "disponivel" },
      { id: "a7", title: "Classificação automática por IA (Juria)", status: "disponivel" },
      { id: "a8", title: "Marca d'água em downloads sigilosos", status: "disponivel" },
      { id: "a9", title: "Ingest de e-mail e anexo do Drive", status: "disponivel" },
    ],
  },
  {
    id: "d3", title: "Alertas & Escalonamento", icon: <Bell className="h-4 w-4" />,
    description: "Regras de alertas, offsets 7d/2d/2h e escalonamento",
    articles: [
      { id: "a10", title: "Configurar regras de alerta", status: "disponivel" },
      { id: "a11", title: "Offsets automáticos (7d, 2d, 2h)", status: "disponivel" },
      { id: "a12", title: "Escalonamento para gestores", status: "disponivel" },
      { id: "a13", title: "Canais: In-app, E-mail, WhatsApp", status: "disponivel" },
    ],
  },
  {
    id: "d4", title: "Agenda & Tarefas", icon: <CalendarDays className="h-4 w-4" />,
    description: "Calendário, tarefas, prazos e checklists",
    articles: [
      { id: "a14", title: "Navegar pelo calendário", status: "disponivel" },
      { id: "a15", title: "Criar e gerenciar tarefas", status: "disponivel" },
      { id: "a16", title: "Checklists pré e pós-audiência", status: "disponivel" },
      { id: "a17", title: "Pacote automático de audiência", status: "disponivel" },
    ],
  },
  {
    id: "d5", title: "Relatórios & Auditoria", icon: <BarChart3 className="h-4 w-4" />,
    description: "KPIs, dashboards, logs de auditoria e exportação",
    articles: [
      { id: "a18", title: "Dashboard executivo", status: "disponivel" },
      { id: "a19", title: "Relatório de SLA e compliance", status: "disponivel" },
      { id: "a20", title: "Logs de auditoria e exportação CSV", status: "disponivel" },
      { id: "a21", title: "Exportação PDF/Excel de relatórios", status: "disponivel" },
    ],
  },
  {
    id: "d6", title: "Administração", icon: <Users className="h-4 w-4" />,
    description: "Usuários, permissões, roles e multi-tenant",
    articles: [
      { id: "a22", title: "Gerenciar usuários e permissões", status: "disponivel" },
      { id: "a23", title: "Roles: Admin, DP, RH, Advogado Externo...", status: "disponivel" },
      { id: "a24", title: "Multi-tenant: isolamento por empresa", status: "disponivel" },
      { id: "a25", title: "Portal do Advogado Externo", status: "disponivel" },
    ],
  },
];

const trainingSessions: TrainingSession[] = [
  {
    id: "t1", title: "Módulo 1 – Visão Geral do Sistema",
    audience: "Todos os usuários", duration: "1h30",
    status: "concluido", date: "2026-02-10", participants: 12,
    topics: ["Login e navegação", "Dashboard e KPIs", "Perfis e permissões", "Busca e filtros"],
  },
  {
    id: "t2", title: "Módulo 2 – Gestão de Processos",
    audience: "Jurídico + DP", duration: "2h",
    status: "concluido", date: "2026-02-12", participants: 8,
    topics: ["CRUD de processos", "Timeline de eventos", "Prazos e audiências", "Checklists automáticos", "Sigilo e ACL"],
  },
  {
    id: "t3", title: "Módulo 3 – Provas e Evidências",
    audience: "Jurídico + DP + RH", duration: "2h",
    status: "concluido", date: "2026-02-13", participants: 10,
    topics: ["Solicitação com SLA", "Upload com metadados", "IA classificadora", "Marca d'água", "Ingest e-mail/Drive"],
  },
  {
    id: "t4", title: "Módulo 4 – Alertas e Notificações",
    audience: "Todos os usuários", duration: "1h",
    status: "concluido", date: "2026-02-14", participants: 12,
    topics: ["Central de alertas", "Regras e offsets", "Escalonamento", "WhatsApp e e-mail"],
  },
  {
    id: "t5", title: "Módulo 5 – Relatórios e Auditoria",
    audience: "Gestores + Admin", duration: "1h30",
    status: "concluido", date: "2026-02-15", participants: 5,
    topics: ["Dashboard executivo", "KPIs de SLA", "Logs de auditoria", "Exportação de dados"],
  },
  {
    id: "t6", title: "Módulo 6 – Portal do Advogado Externo",
    audience: "Advogados Externos", duration: "1h",
    status: "concluido", date: "2026-02-16", participants: 3,
    topics: ["Acesso restrito", "Visualização de processos", "Download de evidências", "Comunicação"],
  },
];

const goLiveItems: GoLiveItem[] = [
  { id: "g1", category: "Infraestrutura", title: "Lovable Cloud habilitado", status: "pendente", responsible: "Equipe TI", notes: "Habilitar backend com Supabase" },
  { id: "g2", category: "Infraestrutura", title: "Migração de dados mock → banco real", status: "pendente", responsible: "Equipe TI" },
  { id: "g3", category: "Infraestrutura", title: "Configurar Auth (login real)", status: "pendente", responsible: "Equipe TI" },
  { id: "g4", category: "Infraestrutura", title: "Configurar Storage (upload real)", status: "pendente", responsible: "Equipe TI" },
  { id: "g5", category: "Integrações", title: "WhatsApp API (Evolution/Twilio)", status: "pendente", responsible: "Equipe TI" },
  { id: "g6", category: "Integrações", title: "E-mail SMTP configurado", status: "pendente", responsible: "Equipe TI" },
  { id: "g7", category: "Integrações", title: "Google Drive OAuth", status: "pendente", responsible: "Equipe TI" },
  { id: "g8", category: "Dados", title: "Importação de processos existentes", status: "pendente", responsible: "Jurídico" },
  { id: "g9", category: "Dados", title: "Cadastro de empresas e filiais", status: "pendente", responsible: "Admin" },
  { id: "g10", category: "Dados", title: "Cadastro de usuários e roles", status: "pendente", responsible: "Admin" },
  { id: "g11", category: "Dados", title: "Cadastro de responsáveis e alertas", status: "pendente", responsible: "Jurídico" },
  { id: "g12", category: "Treinamento", title: "Módulos 1-6 concluídos", status: "concluido", responsible: "Todos" },
  { id: "g13", category: "Treinamento", title: "Documentação entregue", status: "concluido", responsible: "Equipe TI" },
  { id: "g14", category: "Validação", title: "Teste end-to-end com dados reais", status: "pendente", responsible: "Jurídico + TI" },
  { id: "g15", category: "Validação", title: "Aprovação do gestor jurídico", status: "pendente", responsible: "Thiago" },
  { id: "g16", category: "Validação", title: "Publicação em produção", status: "pendente", responsible: "Equipe TI" },
];

const statusSessionStyles = {
  concluido: "bg-success/15 text-success",
  agendado: "bg-warning/15 text-warning",
  pendente: "bg-muted text-muted-foreground",
};

export default function DocumentacaoGoLive() {
  const [tab, setTab] = useState("documentacao");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);
  const [localGoLive, setLocalGoLive] = useState(goLiveItems);

  const totalDocs = docSections.reduce((s, d) => s + d.articles.length, 0);
  const availableDocs = docSections.reduce((s, d) => s + d.articles.filter((a) => a.status === "disponivel").length, 0);

  const completedSessions = trainingSessions.filter((s) => s.status === "concluido").length;
  const totalParticipants = trainingSessions.reduce((s, t) => s + (t.participants || 0), 0);

  const goLiveCompleted = localGoLive.filter((i) => i.status === "concluido").length;
  const goLivePercent = Math.round((goLiveCompleted / localGoLive.length) * 100);

  const toggleGoLiveItem = (id: string) => {
    setLocalGoLive((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const newStatus = item.status === "concluido" ? "pendente" : "concluido";
      return { ...item, status: newStatus };
    }));
  };

  const categories = [...new Set(localGoLive.map((i) => i.category))];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Documentação & Go-Live</h1>
        <p className="text-sm text-muted-foreground">Treinamento, documentação e checklist de produção</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{availableDocs}/{totalDocs}</p>
          <p className="text-[11px] text-muted-foreground">Artigos documentados</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{completedSessions}/{trainingSessions.length}</p>
          <p className="text-[11px] text-muted-foreground">Treinamentos concluídos</p>
          <p className="text-[10px] text-muted-foreground/70">{totalParticipants} participantes</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Rocket className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{goLivePercent}%</p>
          <p className="text-[11px] text-muted-foreground">Go-live pronto</p>
          <Progress value={goLivePercent} className="mt-1.5 h-1.5" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="documentacao" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" /> Documentação
          </TabsTrigger>
          <TabsTrigger value="treinamento" className="gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Treinamento
          </TabsTrigger>
          <TabsTrigger value="golive" className="gap-1.5 text-xs">
            <Rocket className="h-3.5 w-3.5" /> Go-Live
            <Badge className="ml-1 h-4 min-w-4 rounded-full bg-warning px-1 text-[9px] text-warning-foreground">
              {goLivePercent}%
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* DOCUMENTAÇÃO */}
        <TabsContent value="documentacao">
          <div className="space-y-3">
            {docSections.map((section) => {
              const expanded = expandedDoc === section.id;
              return (
                <div key={section.id} className="rounded-xl border bg-card overflow-hidden">
                  <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/20 transition-colors" onClick={() => setExpandedDoc(expanded ? null : section.id)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">{section.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{section.articles.length} artigos</Badge>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {expanded && (
                    <div className="border-t bg-muted/20 p-4 space-y-1.5 animate-in fade-in duration-200">
                      {section.articles.map((article) => (
                        <div key={article.id} className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/20 cursor-pointer transition-colors" onClick={() => toast({ title: article.title, description: "Artigo aberto. (Demo)" })}>
                          {article.status === "disponivel" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-xs flex-1">{article.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TREINAMENTO */}
        <TabsContent value="treinamento">
          <div className="space-y-3">
            {trainingSessions.map((session) => {
              const expanded = expandedTraining === session.id;
              return (
                <div key={session.id} className="rounded-xl border bg-card overflow-hidden">
                  <button className="flex w-full items-start gap-3 p-4 text-left hover:bg-accent/20 transition-colors" onClick={() => setExpandedTraining(expanded ? null : session.id)}>
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", statusSessionStyles[session.status])}>
                      {session.status === "concluido" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{session.title}</p>
                        <Badge className={cn("text-[10px] border-0", statusSessionStyles[session.status])}>
                          {session.status === "concluido" ? "Concluído" : session.status === "agendado" ? "Agendado" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.audience} · {session.duration}
                        {session.date && ` · ${new Date(session.date).toLocaleDateString("pt-BR")}`}
                        {session.participants && ` · ${session.participants} participantes`}
                      </p>
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                  </button>
                  {expanded && (
                    <div className="border-t bg-muted/20 p-4 animate-in fade-in duration-200">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tópicos abordados</p>
                      <div className="space-y-1">
                        {session.topics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* GO-LIVE */}
        <TabsContent value="golive">
          <div className="mb-4 rounded-xl border border-warning/20 bg-warning/5 p-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Progresso para Go-Live</p>
                <p className="text-xs text-muted-foreground">{goLiveCompleted} de {localGoLive.length} itens concluídos</p>
              </div>
              <p className="text-2xl font-bold text-warning">{goLivePercent}%</p>
            </div>
            <Progress value={goLivePercent} className="mt-3 h-2" />
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const items = localGoLive.filter((i) => i.category === cat);
              const catCompleted = items.filter((i) => i.status === "concluido").length;
              return (
                <div key={cat}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
                    <Badge variant="outline" className="text-[10px]">{catCompleted}/{items.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/20",
                          item.status === "concluido" && "opacity-60",
                        )}
                        onClick={() => toggleGoLiveItem(item.id)}
                      >
                        {item.status === "concluido" ? (
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        ) : item.status === "em_andamento" ? (
                          <Clock className="h-4 w-4 text-warning shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm", item.status === "concluido" && "line-through")}>{item.title}</p>
                          {item.notes && <p className="text-[10px] text-muted-foreground">{item.notes}</p>}
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">{item.responsible}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
