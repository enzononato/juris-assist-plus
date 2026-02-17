import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ChevronRight, Shield, Building2, CalendarDays, Clock, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusLabels, type CaseStatus } from "@/data/mock";
import { useTenantData } from "@/hooks/useTenantData";
import { cn } from "@/lib/utils";

const statusColors: Record<CaseStatus, string> = {
  novo: "bg-info/15 text-info border-info/30",
  em_andamento: "bg-primary/10 text-primary border-primary/30",
  audiencia_marcada: "bg-warning/15 text-warning border-warning/30",
  sentenca: "bg-success/15 text-success border-success/30",
  recurso: "bg-destructive/10 text-destructive border-destructive/30",
  encerrado: "bg-muted text-muted-foreground border-muted",
};

export default function Processos() {
  const { cases, companies } = useTenantData();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.case_number.includes(search) ||
      c.employee.toLowerCase().includes(search.toLowerCase()) ||
      c.theme.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesCompany = companyFilter === "all" || c.company_id === companyFilter;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Processos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} processos encontrados</p>
        </div>
        <Button className="gap-2" size="sm" asChild>
          <Link to="/processos/novo">
            <Plus className="h-4 w-4" />
            Novo Processo
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nº, nome, tema ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to={`/processos/${c.id}`}
            className="group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.99] sm:gap-4 sm:p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{c.employee}</span>
                {c.confidentiality !== "normal" && (
                  <Shield className="h-3.5 w-3.5 text-destructive" />
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.case_number} · <span className="font-medium text-primary">{c.company}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={cn("text-[10px]", statusColors[c.status])}>
                  {statusLabels[c.status]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{c.theme}</Badge>
              </div>
              {/* Mobile: show dates inline */}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:hidden">
                {c.next_hearing && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(c.next_hearing).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {c.next_deadline && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden flex-col items-end gap-1 text-right sm:flex">
              {c.next_hearing && (
                <span className="text-[11px] text-muted-foreground">
                  Audiência: {new Date(c.next_hearing).toLocaleDateString("pt-BR")}
                </span>
              )}
              {c.next_deadline && (
                <span className="text-[11px] text-muted-foreground">
                  Prazo: {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{c.responsible}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <Scale className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
