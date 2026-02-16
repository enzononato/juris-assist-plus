import { useState, useEffect } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evidenceCategoryLabels, evidenceOriginLabels, type EvidenceCategory, type EvidenceOrigin } from "@/data/mock";
import { cn } from "@/lib/utils";

interface AISuggestion {
  category: EvidenceCategory;
  origin: EvidenceOrigin;
  period_start?: string;
  period_end?: string;
  confidence: number;
}

const mockSuggestions: Record<string, AISuggestion> = {
  "espelho_ponto": { category: "ponto_eletronico", origin: "sistema_ponto", period_start: "2024-01-01", period_end: "2024-03-31", confidence: 0.95 },
  "escala": { category: "escalas", origin: "drive", period_start: "2023-01-01", period_end: "2023-12-31", confidence: 0.88 },
  "cftv": { category: "cftv_camera", origin: "servidor", confidence: 0.92 },
  "atestado": { category: "atestados_justificativas", origin: "email", confidence: 0.85 },
  "treinamento": { category: "treinamento", origin: "drive", confidence: 0.78 },
  "default": { category: "documentos_assinados", origin: "outro", confidence: 0.45 },
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
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editOrigin, setEditOrigin] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const s = getSuggestion(filename);
      setSuggestion(s);
      setEditCategory(s.category);
      setEditOrigin(s.origin);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [filename]);

  if (loading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Juria IA está analisando o arquivo...</span>
        </div>
      </div>
    );
  }

  if (!suggestion) return null;

  const confidenceColor = suggestion.confidence >= 0.8 ? "text-success" : suggestion.confidence >= 0.6 ? "text-warning" : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Sugestão da Juria IA</span>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", confidenceColor)}>
          {Math.round(suggestion.confidence * 100)}% confiança
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Categoria sugerida</p>
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
          <p className="text-[11px] text-muted-foreground">Origem sugerida</p>
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
        <div className="text-xs text-muted-foreground">
          📅 Período detectado: {suggestion.period_start && new Date(suggestion.period_start).toLocaleDateString("pt-BR")}
          {suggestion.period_end && ` – ${new Date(suggestion.period_end).toLocaleDateString("pt-BR")}`}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-1.5 text-xs flex-1"
          onClick={() => onAccept({ ...suggestion, category: editCategory as EvidenceCategory, origin: editOrigin as EvidenceOrigin })}
        >
          <Check className="h-3.5 w-3.5" /> Aceitar
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onDismiss}>
          <X className="h-3.5 w-3.5" /> Ignorar
        </Button>
      </div>
    </div>
  );
}
