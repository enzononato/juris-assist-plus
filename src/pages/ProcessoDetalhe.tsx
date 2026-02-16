import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, User, Shield, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockCases, mockTasks, mockHearings, mockDeadlines,
  mockEvidenceRequests, mockEvidenceItems, mockCaseChecklists,
  mockResponsaveis, mockTimelineEvents,
  statusLabels, taskStatusLabels, priorityLabels,
} from "@/data/mock";
import ProvasTab from "@/components/provas/ProvasTab";
import ChecklistsTab from "@/components/checklists/ChecklistsTab";
import TimelineTab from "@/components/timeline/TimelineTab";
import ProcessoResumoTab from "@/components/processo/ProcessoResumoTab";
import ProcessoAIResumoTab from "@/components/processo/ProcessoAIResumoTab";
import NovaAudienciaDialog from "@/components/processo/NovaAudienciaDialog";

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const caso = mockCases.find((c) => c.id === id);
  if (!caso) return <div className="p-8 text-muted-foreground">Processo não encontrado.</div>;

  const tasks = mockTasks.filter((t) => t.case_id === id);
  const hearings = mockHearings.filter((h) => h.case_id === id);
  const deadlines = mockDeadlines.filter((d) => d.case_id === id);
  const evidenceRequests = mockEvidenceRequests.filter((r) => r.case_id === id);
  const evidenceItems = mockEvidenceItems.filter((i) => i.case_id === id);
  const checklists = mockCaseChecklists.filter((c) => c.case_id === id);
  const timelineEvents = mockTimelineEvents.filter((e) => e.case_id === id);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2 gap-1 text-muted-foreground">
          <Link to="/processos"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{caso.employee}</h1>
              {caso.confidentiality !== "normal" && <Shield className="h-4 w-4 text-destructive" />}
            </div>
            <p className="text-sm text-muted-foreground">{caso.case_number}</p>
            <p className="text-sm text-muted-foreground">{caso.company} – {caso.branch}</p>
          </div>
          <Badge variant="outline">{statusLabels[caso.status]}</Badge>
        </div>
      </div>

      <Tabs defaultValue="resumo">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="resumo-ia">Resumo IA</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timelineEvents.length})</TabsTrigger>
          <TabsTrigger value="prazos">Prazos ({deadlines.length})</TabsTrigger>
          <TabsTrigger value="audiencias">Audiências ({hearings.length})</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="provas">Provas ({evidenceRequests.length})</TabsTrigger>
          <TabsTrigger value="checklists">Checklists ({checklists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <ProcessoResumoTab caso={caso} />
        </TabsContent>

        <TabsContent value="resumo-ia">
          <ProcessoAIResumoTab caso={caso} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab events={timelineEvents} />
        </TabsContent>

        <TabsContent value="prazos">
          <div className="space-y-2">
            {deadlines.length === 0 && <p className="text-sm text-muted-foreground">Nenhum prazo cadastrado.</p>}
            {deadlines.map((d) => (
              <div key={d.id} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">Vencimento: {new Date(d.due_at).toLocaleDateString("pt-BR")}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{d.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audiencias">
          <div className="space-y-3">
            <div className="flex justify-end">
              <NovaAudienciaDialog caseId={id} />
            </div>
            {hearings.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma audiência cadastrada.</p>}
            {hearings.map((h) => (
              <div key={h.id} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">{h.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR")} às {h.time}</p>
                <p className="text-xs text-muted-foreground">{h.court}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{h.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tarefas">
          <div className="space-y-2">
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa vinculada.</p>}
            {tasks.map((t) => (
              <div key={t.id} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">{t.title}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">{taskStatusLabels[t.status]}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{priorityLabels[t.priority]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.assignees.join(", ")}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="provas">
          <ProvasTab requests={evidenceRequests} items={evidenceItems} caseId={id} />
        </TabsContent>

        <TabsContent value="checklists">
          <ChecklistsTab checklists={checklists} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
