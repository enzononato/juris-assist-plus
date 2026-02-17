import { useState, useEffect } from "react";
import { Sparkles, Check, X, Loader2, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evidenceCategoryLabels, evidenceOriginLabels, type EvidenceCategory, type EvidenceOrigin } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AISuggestion {
  category: EvidenceCategory;
  origin: EvidenceOrigin;
  period_start?: string;
  period_end?: string;
  confidence: number;
  reasoning?: string;
}

const mockSuggestions: Record<string, AISuggestion> = {
  "espelho_ponto": { category: "ponto_eletronico", origin: "sistema_ponto", period_start: "2024-01-01", period_end: "2024-03-31", confidence: 0.95, reasoning: "Nome do arquivo contém 'espelho_ponto', formato PDF típico de sistemas de ponto eletrônico." },
  "escala": { category: "escalas", origin: "drive", period_start: "2023-01-01", period_end: "2023-12-31", confidence: 0.88, reasoning: "Arquivo referencia escalas de trabalho. Formato compatível com exportação do Google Drive." },
  "cftv": { category: "cftv_camera", origin: "servidor", confidence: 0.92, reasoning: "Referência a CFTV/câmera de segurança. Provavelmente extraído de servidor de monitoramento." },
  "atestado": { category: "atestados_justificativas", origin: "email", confidence: 0.85, reasoning: "Documento de atestado médico, comumente recebido por e-mail do colaborador." },
  "treinamento": { category: "treinamento", origin: "drive", confidence: 0.78, reasoning: "Material de treinamento identificado. Confiança moderada — pode ser certificado ou material didático." },
  "default": { category: "documentos_assinados", origin: "outro", confidence: 0.45, reasoning: "Não foi possível classificar com alta confiança. Verifique manualmente a categoria e origem." },
};

function getSuggestion(filename: string): AISuggestion {
  const lower = filename.toLowerCase();
  for (const [key, val] of Object.entries(mockSuggestions)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return mockSuggestions.default;
}

interface Props {
  filename: string;
  onAccept: (suggestion: AISuggestion) => void;
  onDismiss: () => void;
}

export default function AIClassifierSuggestion({ filename, onAccept, onDismiss }: Props) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editOrigin, setEditOrigin] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 25, 90));
    }, 300);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      const s = getSuggestion(filename);
      setSuggestion(s);
      setEditCategory(s.category);
      setEditOrigin(s.origin);
      setLoading(false);
    }, 1800);

    return () => { clearTimeout(timer); clearInterval(progressInterval); };
  }, [filename]);

  if (loading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Brain className="h-4 w-4 animate-pulse" />
          <span className="font-semibold">Juria IA analisando arquivo...</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="text-[11px] text-muted-foreground">
          Identificando categoria, origem e período do documento...
        </p>
      </div>
    );
  }

  if (!suggestion) return null;

  const confidencePercent = Math.round(suggestion.confidence * 100);
  const confidenceColor = suggestion.confidence >= 0.8 ? "text-success" : suggestion.confidence >= 0.6 ? "text-warning" : "text-destructive";
  const confidenceBg = suggestion.confidence >= 0.8 ? "bg-success/10" : suggestion.confidence >= 0.6 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold text-primary">Sugestão da Juria IA</span>
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", confidenceColor, confidenceBg)}>
          <Zap className="h-3 w-3" />
          {confidencePercent}%
        </Badge>
      </div>

      {/* Reasoning */}
      {suggestion.reasoning && (
        <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
          💡 {suggestion.reasoning}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Categoria</p>
          <Select value={editCategory} onValueChange={setEditCategory}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(evidenceCategoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">Origem</p>
          <Select value={editOrigin} onValueChange={setEditOrigin}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(evidenceOriginLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(suggestion.period_start || suggestion.period_end) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5">
          <span>📅</span>
          <span>Período: {suggestion.period_start && new Date(suggestion.period_start).toLocaleDateString("pt-BR")}
          {suggestion.period_end && ` – ${new Date(suggestion.period_end).toLocaleDateString("pt-BR")}`}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-1.5 text-xs flex-1 shadow-sm"
          onClick={() => onAccept({ ...suggestion, category: editCategory as EvidenceCategory, origin: editOrigin as EvidenceOrigin })}
        >
          <Check className="h-3.5 w-3.5" /> Aceitar Sugestão
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onDismiss}>
          <X className="h-3.5 w-3.5" /> Ignorar
        </Button>
      </div>
    </div>
  );
}
