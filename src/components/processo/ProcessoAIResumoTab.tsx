import { useState } from "react";
import { Sparkles, Loader2, FileText, AlertTriangle, Calendar, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type Case, mockTimelineEvents, mockEvidenceItems, mockDeadlines, mockHearings,
  statusLabels, evidenceCategoryLabels,
} from "@/data/mock";

interface Props {
  caso: Case;
}

function generateMockSummary(caso: Case) {
  const events = mockTimelineEvents.filter((e) => e.case_id === caso.id);
  const items = mockEvidenceItems.filter((i) => i.case_id === caso.id);
  const deadlines = mockDeadlines.filter((d) => d.case_id === caso.id);
  const hearings = mockHearings.filter((h) => h.case_id === caso.id);

  const categoryCounts: Record<string, number> = {};
  items.forEach((i) => { categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });

  const pendingDeadlines = deadlines.filter((d) => d.status === "pendente");
  const upcomingHearings = hearings.filter((h) => h.status === "agendada");

  return {
    overview: `O processo **${caso.case_number}** (${caso.theme}) movido por **${caso.employee}** contra **${caso.company}** (${caso.branch}) encontra-se no status **${statusLabels[caso.status]}**. Ajuizado em ${new Date(caso.filed_at).toLocaleDateString("pt-BR")}, tramita perante o ${caso.court}. O responsável interno é ${caso.responsible} e o advogado é ${caso.lawyer}.`,
    timeline: `Foram registrados **${events.length} eventos** na timeline do processo, incluindo ${events.filter((e) => e.type === "prova_anexada").length} anexações de prova e ${events.filter((e) => e.type === "tarefa_criada").length} tarefas criadas.`,
    evidence: items.length > 0
      ? `Há **${items.length} evidências** anexadas: ${Object.entries(categoryCounts).map(([k, v]) => `${v}× ${evidenceCategoryLabels[k as keyof typeof evidenceCategoryLabels] || k}`).join(", ")}. Status: ${items.filter((i) => i.status === "validado").length} validadas, ${items.filter((i) => i.status === "recebido").length} recebidas, ${items.filter((i) => i.status === "pendente").length} pendentes.`
      : "Nenhuma evidência anexada ao processo.",
    alerts: [
      ...pendingDeadlines.map((d) => `⏰ Prazo pendente: "${d.title}" vence em ${new Date(d.due_at).toLocaleDateString("pt-BR")}`),
      ...upcomingHearings.map((h) => `📅 Audiência agendada: ${h.type} em ${new Date(h.date).toLocaleDateString("pt-BR")} às ${h.time}`),
      ...(items.filter((i) => i.status === "pendente").length > 0 ? [`📎 ${items.filter((i) => i.status === "pendente").length} evidência(s) pendente(s) de validação`] : []),
    ],
    generatedAt: new Date().toLocaleString("pt-BR"),
  };
}

export default function ProcessoAIResumoTab({ caso }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof generateMockSummary> | null>(null);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary(generateMockSummary(caso));
      setLoading(false);
    }, 2000);
  };

  if (!summary && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Resumo IA do Processo</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            A Juria IA irá analisar a timeline, provas, prazos e audiências para gerar um resumo completo do processo, ideal para preparação de audiências.
          </p>
        </div>
        <Button onClick={generate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Gerar Resumo IA
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-primary">Juria IA está analisando o processo...</p>
        <p className="text-xs text-muted-foreground">Compilando timeline, provas e pontos de atenção</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Resumo IA – Juria</h3>
          <Badge variant="outline" className="text-[10px]">Gerado em {summary!.generatedAt}</Badge>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={generate}>
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <Section icon={<FileText className="h-4 w-4 text-primary" />} title="Visão Geral">
          <RenderMarkdown text={summary!.overview} />
        </Section>

        <Section icon={<Calendar className="h-4 w-4 text-info" />} title="Timeline">
          <RenderMarkdown text={summary!.timeline} />
        </Section>

        <Section icon={<LinkIcon className="h-4 w-4 text-success" />} title="Provas e Evidências">
          <RenderMarkdown text={summary!.evidence} />
        </Section>

        {summary!.alerts.length > 0 && (
          <Section icon={<AlertTriangle className="h-4 w-4 text-warning" />} title="Pontos de Atenção">
            <ul className="space-y-1.5">
              {summary!.alerts.map((a, i) => (
                <li key={i} className="text-sm">{a}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        ⚠️ Resumo gerado por IA. Verifique as informações antes de usar em audiência. (Demo – sem backend)
      </p>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function RenderMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="text-sm leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}
