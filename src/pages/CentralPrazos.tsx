import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calculator, Calendar, Clock, AlertTriangle, Plus, Trash2, Edit,
  PauseCircle, PlayCircle, Search, Filter, CalendarDays, MapPin, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  addBusinessDays, remainingBusinessDays, getDeadlineAlertLevel,
  DEADLINE_TYPES, type Holiday
} from "@/lib/deadlineCalculator";

const alertColors: Record<string, string> = {
  vencido: "bg-destructive text-destructive-foreground",
  hoje: "bg-destructive/80 text-destructive-foreground",
  "3d": "bg-warning text-warning-foreground",
  "7d": "bg-warning/60 text-warning-foreground",
  "15d": "bg-info/60 text-info-foreground",
  ok: "bg-muted text-muted-foreground",
};

const alertLabels: Record<string, string> = {
  vencido: "Vencido", hoje: "Vence Hoje", "3d": "3 dias",
  "7d": "7 dias", "15d": "15 dias", ok: "No prazo",
};

export default function CentralPrazos() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("prazos");
  const [calcOpen, setCalcOpen] = useState(false);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [filterAlert, setFilterAlert] = useState("all");
  const [search, setSearch] = useState("");

  // Calculator state
  const [calcType, setCalcType] = useState("contestacao");
  const [calcStartDate, setCalcStartDate] = useState<Date>(new Date());
  const [calcDays, setCalcDays] = useState(15);
  const [calcCourt, setCalcCourt] = useState("");
  const [calcResult, setCalcResult] = useState<Date | null>(null);

  // Holiday form
  const [hName, setHName] = useState("");
  const [hDate, setHDate] = useState<Date>(new Date());
  const [hScope, setHScope] = useState("nacional");
  const [hCourt, setHCourt] = useState("");
  const [hRecurring, setHRecurring] = useState(false);

  // Suspension form
  const [suspDeadlineId, setSuspDeadlineId] = useState("");
  const [suspReason, setSuspReason] = useState("");

  // Queries
  const { data: holidays = [] } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => {
      const { data, error } = await supabase.from("holidays").select("*").order("date");
      if (error) throw error;
      return data as Holiday[];
    },
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["all-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadlines")
        .select("*, cases(case_number, employee_name, court)")
        .order("due_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: suspensions = [] } = useQuery({
    queryKey: ["deadline-suspensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadline_suspensions")
        .select("*, deadlines(title, due_at)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Enriched deadlines with alert levels
  const enrichedDeadlines = useMemo(() => {
    return deadlines.map((d: any) => {
      const dueDate = parseISO(d.due_at);
      const court = d.cases?.court ?? d.court;
      const alertLevel = d.suspended ? "ok" : getDeadlineAlertLevel(dueDate, holidays, court);
      const remaining = d.suspended ? null : remainingBusinessDays(dueDate, holidays, court);
      return { ...d, alertLevel, remaining, courtName: court };
    });
  }, [deadlines, holidays]);

  const filtered = enrichedDeadlines.filter((d: any) => {
    if (filterAlert !== "all" && d.alertLevel !== filterAlert) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!d.title.toLowerCase().includes(s) &&
        !(d.cases?.case_number ?? "").toLowerCase().includes(s) &&
        !(d.cases?.employee_name ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // Stats
  const stats = useMemo(() => ({
    vencidos: enrichedDeadlines.filter((d: any) => d.alertLevel === "vencido").length,
    hoje: enrichedDeadlines.filter((d: any) => d.alertLevel === "hoje").length,
    proximos3: enrichedDeadlines.filter((d: any) => d.alertLevel === "3d").length,
    proximos7: enrichedDeadlines.filter((d: any) => d.alertLevel === "7d").length,
    suspensos: enrichedDeadlines.filter((d: any) => d.suspended).length,
    total: enrichedDeadlines.length,
  }), [enrichedDeadlines]);

  // Calculator
  const calculate = () => {
    const type = DEADLINE_TYPES.find((t) => t.value === calcType);
    const days = type && type.value !== "personalizado" ? type.days : calcDays;
    const result = addBusinessDays(calcStartDate, days, holidays, calcCourt || undefined);
    setCalcResult(result);
  };

  // Holiday CRUD
  const addHoliday = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("holidays").insert({
        name: hName,
        date: format(hDate, "yyyy-MM-dd"),
        scope: hScope,
        court: hScope !== "nacional" ? hCourt : null,
        recurring: hRecurring,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ title: "Feriado adicionado" });
      setHolidayOpen(false);
      setHName(""); setHCourt("");
    },
  });

  const removeHoliday = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("holidays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast({ title: "Feriado removido" });
    },
  });

  // Suspend deadline
  const suspendDeadline = useMutation({
    mutationFn: async () => {
      const deadline = deadlines.find((d: any) => d.id === suspDeadlineId);
      if (!deadline) throw new Error("Prazo não encontrado");
      const remaining = remainingBusinessDays(parseISO(deadline.due_at), holidays, deadline.court);

      await supabase.from("deadline_suspensions").insert({
        deadline_id: suspDeadlineId,
        case_id: deadline.case_id,
        reason: suspReason,
        remaining_days: remaining,
      });
      await supabase.from("deadlines").update({
        suspended: true,
        original_due_at: deadline.original_due_at ?? deadline.due_at,
      }).eq("id", suspDeadlineId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-deadlines", "deadline-suspensions"] });
      toast({ title: "Prazo suspenso" });
      setSuspendOpen(false);
      setSuspReason("");
    },
  });

  // Resume deadline
  const resumeDeadline = useMutation({
    mutationFn: async (deadlineId: string) => {
      const suspension = suspensions.find((s: any) => s.deadline_id === deadlineId && !s.resumed_at);
      if (!suspension) throw new Error("Suspensão não encontrada");

      const newDue = addBusinessDays(new Date(), suspension.remaining_days ?? 0, holidays);

      await supabase.from("deadline_suspensions").update({
        resumed_at: new Date().toISOString(),
      }).eq("id", suspension.id);

      await supabase.from("deadlines").update({
        suspended: false,
        due_at: newDue.toISOString(),
      }).eq("id", deadlineId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-deadlines", "deadline-suspensions"] });
      toast({ title: "Prazo reativado com novo vencimento" });
    },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Central de Prazos</h1>
          <p className="text-sm text-muted-foreground">Calculadora inteligente, feriados e controle de suspensão</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setCalcOpen(true)}>
            <Calculator className="h-3.5 w-3.5" /> Calculadora
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setSuspendOpen(true)}>
            <PauseCircle className="h-3.5 w-3.5" /> Suspender Prazo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Vencidos", value: stats.vencidos, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Vence Hoje", value: stats.hoje, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Próx. 3 dias", value: stats.proximos3, color: "text-warning", bg: "bg-warning/10" },
          { label: "Próx. 7 dias", value: stats.proximos7, color: "text-warning", bg: "bg-warning/10" },
          { label: "Suspensos", value: stats.suspensos, color: "text-muted-foreground", bg: "bg-muted" },
          { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-card" },
        ].map((s) => (
          <Card key={s.label} className={cn("border", s.bg)}>
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="prazos" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Prazos</TabsTrigger>
          <TabsTrigger value="feriados" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Feriados</TabsTrigger>
          <TabsTrigger value="suspensoes" className="gap-1.5"><PauseCircle className="h-3.5 w-3.5" /> Suspensões</TabsTrigger>
        </TabsList>

        {/* Prazos Tab */}
        <TabsContent value="prazos" className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar prazo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterAlert} onValueChange={setFilterAlert}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
                <SelectItem value="hoje">Vence Hoje</SelectItem>
                <SelectItem value="3d">3 dias</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="15d">15 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum prazo encontrado.</p>
          ) : filtered.map((d: any) => (
            <div key={d.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <Badge className={cn("text-[9px]", alertColors[d.alertLevel])}>
                    {d.suspended ? "Suspenso" : alertLabels[d.alertLevel]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {d.cases?.case_number && <span>{d.cases.case_number}</span>}
                  {d.cases?.employee_name && <><span>·</span><span>{d.cases.employee_name}</span></>}
                  <span>·</span>
                  <span>Vence: {format(parseISO(d.due_at), "dd/MM/yyyy")}</span>
                  {d.remaining !== null && !d.suspended && (
                    <><span>·</span><span className="font-medium">{d.remaining} dias úteis restantes</span></>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.suspended ? (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => resumeDeadline.mutate(d.id)}>
                    <PlayCircle className="h-3 w-3" /> Reativar
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setSuspDeadlineId(d.id); setSuspendOpen(true); }}>
                    <PauseCircle className="h-3 w-3" /> Suspender
                  </Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Feriados Tab */}
        <TabsContent value="feriados" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setHolidayOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Novo Feriado
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 group">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{h.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{format(parseISO(h.date), "dd/MM/yyyy")}</span>
                    <Badge variant="outline" className="text-[9px]">{h.scope}</Badge>
                    {h.recurring && <Badge variant="secondary" className="text-[9px]">Recorrente</Badge>}
                    {h.court && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{h.court}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeHoliday.mutate(h.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Suspensões Tab */}
        <TabsContent value="suspensoes" className="space-y-3">
          {suspensions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma suspensão registrada.</p>
          ) : suspensions.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <PauseCircle className={cn("h-4 w-4 shrink-0", s.resumed_at ? "text-success" : "text-warning")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.deadlines?.title ?? "Prazo"}</p>
                <p className="text-xs text-muted-foreground">{s.reason}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>Suspenso em: {format(parseISO(s.suspended_at), "dd/MM/yyyy")}</span>
                  {s.resumed_at && <><span>·</span><span>Reativado em: {format(parseISO(s.resumed_at), "dd/MM/yyyy")}</span></>}
                  {s.remaining_days && <><span>·</span><span>{s.remaining_days} dias restantes ao suspender</span></>}
                </div>
              </div>
              <Badge variant={s.resumed_at ? "default" : "secondary"} className="text-[9px]">
                {s.resumed_at ? "Reativado" : "Ativo"}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Calculator Dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Calculadora de Prazos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Tipo de Prazo</Label>
              <Select value={calcType} onValueChange={(v) => {
                setCalcType(v);
                const type = DEADLINE_TYPES.find((t) => t.value === v);
                if (type && type.value !== "personalizado") setCalcDays(type.days);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEADLINE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label} {t.days > 0 ? `(${t.days} dias)` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {calcType === "personalizado" && (
              <div>
                <Label className="text-xs">Quantidade de Dias Úteis</Label>
                <Input type="number" value={calcDays} onChange={(e) => setCalcDays(Number(e.target.value))} />
              </div>
            )}
            <div>
              <Label className="text-xs">Data de Início (intimação/publicação)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(calcStartDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={calcStartDate}
                    onSelect={(d) => d && setCalcStartDate(d)}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Comarca/TRT (opcional)</Label>
              <Input value={calcCourt} onChange={(e) => setCalcCourt(e.target.value)} placeholder="Ex: TRT-2, Vara do Trabalho de SP" />
            </div>

            <Button className="w-full" onClick={calculate}>Calcular Prazo Final</Button>

            {calcResult && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Prazo final em</p>
                  <p className="text-2xl font-bold text-primary">{format(calcResult, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calcDays} dias úteis a partir de {format(calcStartDate, "dd/MM/yyyy")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Holiday Dialog */}
      <Dialog open={holidayOpen} onOpenChange={setHolidayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Feriado</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nome</Label><Input value={hName} onChange={(e) => setHName(e.target.value)} placeholder="Ex: Aniversário de São Paulo" /></div>
            <div>
              <Label className="text-xs">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />{format(hDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={hDate} onSelect={(d) => d && setHDate(d)} className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Escopo</Label>
              <Select value={hScope} onValueChange={setHScope}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="trt">TRT/Tribunal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hScope !== "nacional" && (
              <div><Label className="text-xs">Comarca/TRT</Label><Input value={hCourt} onChange={(e) => setHCourt(e.target.value)} placeholder="Ex: TRT-2" /></div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" checked={hRecurring} onChange={(e) => setHRecurring(e.target.checked)} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="recurring" className="text-xs">Recorrente (repete todo ano)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHolidayOpen(false)}>Cancelar</Button>
            <Button size="sm" disabled={!hName} onClick={() => addHoliday.mutate()}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PauseCircle className="h-5 w-5 text-warning" /> Suspender Prazo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {!suspDeadlineId && (
              <div>
                <Label className="text-xs">Prazo</Label>
                <Select value={suspDeadlineId} onValueChange={setSuspDeadlineId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o prazo..." /></SelectTrigger>
                  <SelectContent>
                    {deadlines.filter((d: any) => !d.suspended).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.title} - {d.cases?.case_number ?? ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs">Motivo da Suspensão</Label>
              <Textarea value={suspReason} onChange={(e) => setSuspReason(e.target.value)}
                placeholder="Ex: Recesso forense, decisão judicial, acordo entre partes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setSuspendOpen(false); setSuspDeadlineId(""); }}>Cancelar</Button>
            <Button size="sm" disabled={!suspDeadlineId || !suspReason} onClick={() => suspendDeadline.mutate()}>Suspender</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
