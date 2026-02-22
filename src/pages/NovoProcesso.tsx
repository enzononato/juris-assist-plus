import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCompanies, mockEmployees, mockCases } from "@/data/mock";
import { useMockData } from "@/contexts/MockDataContext";
import type { Case } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { availableMockUsers } from "@/contexts/AuthContext";

const RESPONSAVEIS = availableMockUsers.map((u) => u.name);

export default function NovoProcesso() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyChange } = useMockData();

  const [caseNumber, setCaseNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [theme, setTheme] = useState("");
  const [status, setStatus] = useState<"em_andamento" | "encerrado">("em_andamento");
  const [responsible, setResponsible] = useState(user?.name ?? "");
  const [manager, setManager] = useState("nenhum");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber || !employeeName || !theme) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const company = mockCompanies.find((c) => c.id === companyId);
    const newCase: Case = {
      id: crypto.randomUUID(),
      case_number: caseNumber,
      company_id: companyId || "c1",
      company: company?.name || "N/A",
      branch: company?.name || "",
      employee: employeeName,
      employee_id: "",
      theme,
      status: status === "encerrado" ? "encerrado" : "em_andamento",
      court: "",
      responsible: responsible || user?.name || "",
      lawyer: "",
      confidentiality: "normal",
      filed_at: new Date().toISOString().slice(0, 10),
      amount: amount ? parseFloat(amount.replace(/\./g, "").replace(",", ".")) : undefined,
    };

    mockCases.push(newCase);
    notifyChange();

    toast({
      title: "Processo criado!",
      description: `Processo ${caseNumber} criado com sucesso.`,
    });
    navigate("/processos");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" size="sm" asChild className="mb-4 gap-1 text-muted-foreground">
        <Link to="/processos"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Novo Processo</h1>
      <p className="mb-6 text-sm text-muted-foreground">Preencha os dados básicos do processo trabalhista.</p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">

        {/* Número do Processo */}
        <div className="space-y-2">
          <Label>Número do Processo *</Label>
          <Input
            placeholder="0000000-00.0000.0.00.0000"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
          />
        </div>

        {/* Nome do Colaborador */}
        <div className="space-y-2">
          <Label>Nome do Colaborador *</Label>
          <Input
            placeholder="Nome completo do reclamante"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          />
        </div>

        {/* Empresa / Filial */}
        <div className="space-y-2">
          <Label>Empresa / Filial</Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {mockCompanies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tema */}
        <div className="space-y-2">
          <Label>Tema *</Label>
          <Textarea
            placeholder="Ex: Horas extras, Rescisão indireta, Assédio moral..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            rows={2}
          />
        </div>

        {/* Valor da Causa */}
        <div className="space-y-2">
          <Label>Valor da Causa (R$)</Label>
          <Input
            placeholder="R$ 0,00"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              if (!raw) { setAmount(""); return; }
              const cents = parseInt(raw, 10);
              const formatted = (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              setAmount(formatted);
            }}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "em_andamento" | "encerrado")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsável executor */}
        <div className="space-y-2">
          <Label>Responsável (executor)</Label>
          <Select value={responsible} onValueChange={setResponsible}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o responsável" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSAVEIS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gestor responsável */}
        <div className="space-y-2">
          <Label>Gestor responsável</Label>
          <Select value={manager} onValueChange={setManager}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o gestor" />
            </SelectTrigger>
              <SelectContent>
              <SelectItem value="nenhum">Nenhum</SelectItem>
              {RESPONSAVEIS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">O gestor será notificado sobre atualizações deste processo.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="gap-2" style={{ background: "var(--gradient-primary)" }}>
            Criar Processo
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/processos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
