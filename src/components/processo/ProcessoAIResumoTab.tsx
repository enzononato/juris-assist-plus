import { useState } from "react";
import { Sparkles, Loader2, FileText, AlertTriangle, Calendar, Link as LinkIcon, RefreshCw, Brain, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
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
    overview: `O processo **${caso.case_number}** (${caso.theme}) movido por **${caso.employee}** contra **${caso.company}** (${caso.branch}) encontra-se no status **${statusLabels[caso.status]}**. Ajuizado em ${new Date(caso.filed_at).toLocaleDateString("pt-BR")}, tramita perante o ${caso.court}. O responsável interno é **${caso.responsible}** e o advogado é **${caso.lawyer}**.`,
    timeline: `Foram registrados **${events.length} eventos** na timeline, incluindo ${events.filter((e) => e.type === "prova_anexada").length} anexações de prova e ${events.filter((e) => e.type === "tarefa_criada").length} tarefas criadas.`,
    evidence: items.length > 0
      ? `Há **${items.length} evidências** anexadas: ${Object.entries(categoryCounts).map(([k, v]) => `${v}× ${evidenceCategoryLabels[k as keyof typeof evidenceCategoryLabels] || k}`).join(", ")}.\n\n| Status | Qtd |\n|--------|-----|\n| ✅ Validadas | ${items.filter((i) => i.status === "validado").length} |\n| 📥 Recebidas | ${items.filter((i) => i.status === "recebido").length} |\n| ⏳ Pendentes | ${items.filter((i) => i.status === "pendente").length} |`
      : "Nenhuma evidência anexada ao processo.",
    alerts: [
      ...pendingDeadlines.map((d) => `⏰ Prazo pendente: **${d.title}** — vence em ${new Date(d.due_at).toLocaleDateString("pt-BR")}`),
      ...upcomingHearings.map((h) => `📅 Audiência agendada: **${h.type}** em ${new Date(h.date).toLocaleDateString("pt-BR")} às ${h.time}`),
      ...(items.filter((i) => i.status === "pendente").length > 0 ? [`📎 **${items.filter((i) => i.status === "pendente").length}** evidência(s) pendente(s) de validação`] : []),
    ],
    recommendation: pendingDeadlines.length > 0
      ? `> 💡 **Recomendação:** Priorize o prazo de "${pendingDeadlines[0].title}" que vence em breve. ${upcomingHearings.length > 0 ? `Prepare-se para a audiência de ${upcomingHearings[0].type}.` : ""}`
      : upcomingHearings.length > 0
        ? `> 💡 **Recomendação:** Prepare-se para a audiência de ${upcomingHearings[0].type} agendada.`
        : "> ✅ Nenhum ponto crítico identificado no momento.",
    generatedAt: new Date().toLocaleString("pt-BR"),
  };
}

const LOADING_STEPS = [
  { label: "Analisando timeline do processo...", icon: Clock },
  { label: "Verificando provas e evidências...", icon: FileText },
  { label: "Checando prazos e audiências...", icon: Calendar },
  { label: "Gerando resumo e recomendações...", icon: Brain },
];

export default function ProcessoAIResumoTab({ caso }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ReturnType<typeof generateMockSummary> | null>(null);

  const generate = () => {
    setLoading(true);
    setLoadingStep(0);
    setProgress(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 95));
    }, 250);

    setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setSummary(generateMockSummary(caso));
      setLoading(false);
    }, 2200);
  };

  if (!summary && !loading) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed p-12 text-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Resumo IA do Processo</p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
            A Juria IA irá analisar a timeline, provas, prazos e audiências para gerar um resumo completo — ideal para preparação de audiências.
          </p>
        </div>
        <Button onClick={generate} className="gap-2 shadow-sm">
          <Sparkles className="h-4 w-4" /> Gerar Resumo IA
        </Button>
      </div>
    );
  }

  if (loading) {
    const StepIcon = LOADING_STEPS[loadingStep].icon;
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-background p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <StepIcon className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <p className="text-sm font-semibold text-primary">{LOADING_STEPS[loadingStep].label}</p>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="flex gap-3 mt-2">
          {LOADING_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              {i <= loadingStep ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
              )}
              <span className="text-[10px] text-muted-foreground hidden sm:inline">{step.label.split("...")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold">Resumo IA – Juria</h3>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" />
            {summary!.generatedAt}
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={generate}>
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-5">
        <Section icon={<FileText className="h-4 w-4 text-primary" />} title="Visão Geral">
          <MarkdownBlock text={summary!.overview} />
        </Section>

        <Section icon={<Calendar className="h-4 w-4 text-info" />} title="Timeline">
          <MarkdownBlock text={summary!.timeline} />
        </Section>

        <Section icon={<LinkIcon className="h-4 w-4 text-success" />} title="Provas e Evidências">
          <MarkdownBlock text={summary!.evidence} />
        </Section>

        {summary!.alerts.length > 0 && (
          <Section icon={<AlertTriangle className="h-4 w-4 text-warning" />} title="Pontos de Atenção">
            <ul className="space-y-2">
              {summary!.alerts.map((a, i) => (
                <li key={i} className="text-sm rounded-lg bg-warning/5 border border-warning/10 px-3 py-2">
                  <MarkdownBlock text={a} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section icon={<Brain className="h-4 w-4 text-primary" />} title="Recomendação da IA">
          <MarkdownBlock text={summary!.recommendation} />
        </Section>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        ⚠️ Resumo gerado por IA em modo demo. Verifique as informações antes de usar em audiência.
      </p>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function MarkdownBlock({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground
      prose-headings:text-foreground prose-strong:text-foreground
      prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:rounded-lg prose-blockquote:py-2 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:text-sm
      prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
      prose-th:bg-muted/50 prose-th:font-semibold prose-table:border prose-table:rounded
      prose-tr:border-b prose-tr:border-border/50
      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:text-xs
    ">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
