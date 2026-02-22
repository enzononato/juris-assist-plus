import { useState, useCallback } from "react";
import { Sparkles, FileText, AlertTriangle, Calendar, Link as LinkIcon, RefreshCw, Brain, Clock, CheckCircle2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { type Case } from "@/data/mock";
import { buildCaseContext } from "@/lib/buildJuriaContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  caso: Case;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/juria-chat`;

const LOADING_STEPS = [
  { label: "Coletando dados do processo...", icon: Clock },
  { label: "Analisando timeline e provas...", icon: FileText },
  { label: "Verificando prazos e audiências...", icon: Calendar },
  { label: "Gerando resumo com IA...", icon: Brain },
];

export default function ProcessoAIResumoTab({ caso }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>("");

  const generate = useCallback(async () => {
    setLoading(true);
    setLoadingStep(0);
    setProgress(0);
    setSummary(null);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 90));
    }, 300);

    try {
      const context = buildCaseContext(caso);

      const prompt = `Gere um resumo executivo completo deste processo trabalhista. Inclua as seguintes seções com formatação Markdown:

## 📋 Visão Geral
Resumo do processo com dados principais.

## 📅 Linha do Tempo
Principais eventos e marcos processuais.

## 📎 Provas e Documentos
Status das provas coletadas e pendentes.

## ⚠️ Pontos de Atenção
Prazos críticos, riscos e alertas.

## 💡 Recomendações
Próximos passos sugeridos e estratégia recomendada.

## ⚖️ Análise de Risco
Classificação do risco processual (🟢 Baixo | 🟡 Médio | 🔴 Alto) com justificativa.`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          context,
        }),
      });

      if (!resp.ok) {
        let errorMsg = "Erro ao gerar resumo";
        try {
          const data = await resp.json();
          if (data.error) errorMsg = data.error;
        } catch {}
        throw new Error(errorMsg);
      }

      // Read streaming response
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setSummary(fullText);
              setProgress(Math.min(90 + (fullText.length / 20), 99));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setProgress(100);
      setGeneratedAt(new Date().toLocaleString("pt-BR"));
    } catch (err: any) {
      toast({ title: "Erro ao gerar resumo", description: err.message, variant: "destructive" });
      setSummary(null);
    } finally {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setLoading(false);
    }
  }, [caso]);

  if (!summary && !loading) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed p-12 text-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 shadow-lg shadow-primary/5">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Resumo IA do Processo</p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
            A Juria IA irá analisar os dados reais do processo — timeline, provas, prazos e audiências — para gerar um resumo executivo completo com recomendações estratégicas.
          </p>
        </div>
        <Button onClick={generate} className="gap-2 shadow-sm">
          <Sparkles className="h-4 w-4" /> Gerar Resumo IA
        </Button>
      </div>
    );
  }

  if (loading && !summary) {
    const StepIcon = LOADING_STEPS[loadingStep].icon;
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-background p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-md shadow-primary/5">
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
            <Scale className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold">Resumo IA – Juria</h3>
          {generatedAt && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Clock className="h-3 w-3" />
              {generatedAt}
            </Badge>
          )}
          {loading && (
            <Badge variant="secondary" className="text-[10px] gap-1 animate-pulse">
              <Sparkles className="h-3 w-3" />
              Gerando...
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={generate} disabled={loading}>
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground
          prose-headings:text-foreground prose-strong:text-foreground
          prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2
          prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1.5
          prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:rounded-lg prose-blockquote:py-2 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:text-sm
          prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
          prose-th:bg-muted/50 prose-th:font-semibold prose-table:border prose-table:rounded
          prose-tr:border-b prose-tr:border-border/50
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:text-xs
          prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1
        ">
          <ReactMarkdown>{summary || ""}</ReactMarkdown>
        </div>
        {loading && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary/60 animate-pulse">Juria está escrevendo...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
