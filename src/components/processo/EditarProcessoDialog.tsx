import { useState } from "react";
import { Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Case, mockCases, mockTimelineEvents, type TimelineEvent } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const tribunais = [
  "1ª Vara do Trabalho de São Paulo",
  "2ª Vara do Trabalho de São Paulo",
  "3ª Vara do Trabalho de São Paulo",
  "1ª Vara do Trabalho de Juazeiro",
  "2ª Vara do Trabalho de Juazeiro",
  "1ª Vara do Trabalho de Petrolina",
  "2ª Vara do Trabalho de Petrolina",
  "TRT 5ª Região – Salvador",
  "TRT 2ª Região – São Paulo",
  "TST – Brasília",
];

const temas = [
  "Horas Extras",
  "Rescisão Indireta",
  "Danos Morais",
  "Insalubridade",
  "Periculosidade",
  "Acidente de Trabalho",
  "Desvio de Função",
  "Equiparação Salarial",
  "Assédio Moral",
  "Verbas Rescisórias",
  "FGTS",
  "Outros",
];

interface Props {
  caso: Case;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export default function EditarProcessoDialog({ caso, open, onOpenChange, onUpdated }: Props) {
  const { user } = useAuth();

  const [court, setCourt] = useState(caso.court);
  const [theme, setTheme] = useState(caso.theme);
  const [amount, setAmount] = useState(caso.amount != null ? String(caso.amount) : "");
  const [caseNumber, setCaseNumber] = useState(caso.case_number);
  const [employee, setEmployee] = useState(caso.employee);
  const [branch, setBranch] = useState(caso.branch);

  const addTimelineEvent = (title: string, description: string) => {
    const event: TimelineEvent = {
      id: `te_edit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      case_id: caso.id,
      type: "campo_editado",
      title,
      description,
      user: user?.name ?? "Sistema",
      created_at: new Date().toISOString(),
    };
    mockTimelineEvents.push(event);
  };

  const handleSave = () => {
    const mockCase = mockCases.find((c) => c.id === caso.id);
    if (!mockCase) return;

    const changes: string[] = [];

    if (court !== caso.court) {
      addTimelineEvent(
        "Tribunal alterado",
        `De "${caso.court}" para "${court}"`
      );
      mockCase.court = court;
      changes.push("Tribunal");
    }

    if (theme !== caso.theme) {
      addTimelineEvent(
        "Tema alterado",
        `De "${caso.theme}" para "${theme}"`
      );
      mockCase.theme = theme;
      changes.push("Tema");
    }

    const newAmount = amount.trim() ? parseFloat(amount.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined;
    const oldAmount = caso.amount;
    if (newAmount !== oldAmount) {
      const fmt = (v?: number) => v != null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Não informado";
      addTimelineEvent(
        "Valor da causa alterado",
        `De ${fmt(oldAmount)} para ${fmt(newAmount)}`
      );
      mockCase.amount = newAmount;
      changes.push("Valor da Causa");
    }

    if (caseNumber !== caso.case_number) {
      addTimelineEvent(
        "Número do processo alterado",
        `De "${caso.case_number}" para "${caseNumber}"`
      );
      mockCase.case_number = caseNumber;
      changes.push("Nº do Processo");
    }

    if (employee !== caso.employee) {
      addTimelineEvent(
        "Reclamante alterado",
        `De "${caso.employee}" para "${employee}"`
      );
      mockCase.employee = employee;
      changes.push("Reclamante");
    }

    if (branch !== caso.branch) {
      addTimelineEvent(
        "Filial alterada",
        `De "${caso.branch}" para "${branch}"`
      );
      mockCase.branch = branch;
      changes.push("Filial");
    }

    if (changes.length === 0) {
      toast({ title: "Nenhuma alteração detectada." });
      onOpenChange(false);
      return;
    }

    toast({
      title: "Processo atualizado",
      description: `Campos alterados: ${changes.join(", ")}. Registrado na timeline.`,
    });
    onOpenChange(false);
    onUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-primary" />
            Editar Processo
          </DialogTitle>
          <DialogDescription>
            Altere os dados do processo. Todas as mudanças serão registradas na timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nº do Processo */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-case-number" className="text-sm">Nº do Processo</Label>
            <Input
              id="edit-case-number"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Reclamante */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-employee" className="text-sm">Reclamante</Label>
            <Input
              id="edit-employee"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Filial */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-branch" className="text-sm">Filial</Label>
            <Input
              id="edit-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Tribunal */}
          <div className="space-y-1.5">
            <Label className="text-sm">Tribunal / Vara</Label>
            <Select value={court} onValueChange={setCourt}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tribunais.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                {!tribunais.includes(court) && (
                  <SelectItem value={court}>{court}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tema */}
          <div className="space-y-1.5">
            <Label className="text-sm">Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {temas.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                {!temas.includes(theme) && (
                  <SelectItem value={theme}>{theme}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Valor da Causa */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-amount" className="text-sm">Valor da Causa (R$)</Label>
            <Input
              id="edit-amount"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 50000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Use ponto ou vírgula como separador decimal
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
