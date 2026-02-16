import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCompanies, mockEmployees } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

export default function NovoProcesso() {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [theme, setTheme] = useState("");
  const [court, setCourt] = useState("");
  const [responsible, setResponsible] = useState("");
  const [lawyer, setLawyer] = useState("");
  const [confidentiality, setConfidentiality] = useState("normal");

  const filteredEmployees = mockEmployees.filter((e) => e.company_id === companyId);

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setEmployeeId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !employeeId || !caseNumber || !theme) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    toast({ title: "Processo criado com sucesso!" });
    navigate("/processos");
  };

  const themes = [
    "Horas Extras",
    "Rescisão Indireta",
    "Assédio Moral",
    "Assédio Sexual",
    "FGTS",
    "Verbas Rescisórias",
    "Acidente de Trabalho",
    "Insalubridade",
    "Periculosidade",
    "Dano Moral",
    "Equiparação Salarial",
    "Outros",
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 gap-1 text-muted-foreground">
        <Link to="/processos"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Novo Processo</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Select value={companyId} onValueChange={handleCompanyChange}>
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

          <div className="space-y-2">
            <Label>Funcionário *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} disabled={!companyId}>
              <SelectTrigger>
                <SelectValue placeholder={companyId ? "Selecione o funcionário" : "Selecione a empresa primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} – {emp.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nº do Processo *</Label>
            <Input
              placeholder="0000000-00.0000.0.00.0000"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tema *</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tribunal / Vara</Label>
          <Input
            placeholder="Ex: 1ª Vara do Trabalho de Juazeiro"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Responsável Interno</Label>
            <Input
              placeholder="Nome do responsável"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Advogado</Label>
            <Input
              placeholder="Nome do advogado"
              value={lawyer}
              onChange={(e) => setLawyer(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sigilo</Label>
          <Select value={confidentiality} onValueChange={setConfidentiality}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="restrito">Restrito</SelectItem>
              <SelectItem value="ultra_restrito">Ultra Restrito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Criar Processo</Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/processos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
