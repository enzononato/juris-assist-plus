import { useState } from "react";
import { Plus, Phone, Bell, BellOff, Pencil, Trash2, UserCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCompanies } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

interface Responsavel {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  company_id: string;
  alerts_audiencias: boolean;
  alerts_prazos: boolean;
  alerts_tarefas: boolean;
  alerts_whatsapp: boolean;
  alerts_email: boolean;
  active: boolean;
}

const initialResponsaveis: Responsavel[] = [
  {
    id: "r1",
    name: "Ana Jurídico",
    phone: "(74) 99912-3456",
    email: "ana@revalle.com.br",
    role: "Responsável Jurídico",
    company_id: "all",
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: true,
    alerts_whatsapp: true,
    alerts_email: true,
    active: true,
  },
  {
    id: "r2",
    name: "João DP",
    phone: "(74) 99934-5678",
    email: "joao.dp@revalle.com.br",
    role: "Departamento Pessoal",
    company_id: "all",
    alerts_audiencias: false,
    alerts_prazos: true,
    alerts_tarefas: true,
    alerts_whatsapp: true,
    alerts_email: false,
    active: true,
  },
  {
    id: "r3",
    name: "Dr. Roberto Advogado",
    phone: "(71) 99876-5432",
    email: "roberto@advocacia.com.br",
    role: "Advogado Externo",
    company_id: "c1",
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: false,
    alerts_whatsapp: false,
    alerts_email: true,
    active: true,
  },
  {
    id: "r4",
    name: "Dra. Patrícia Externa",
    phone: "(87) 99765-4321",
    email: "patricia@advocacia.com.br",
    role: "Advogada Externa",
    company_id: "c2",
    alerts_audiencias: true,
    alerts_prazos: true,
    alerts_tarefas: false,
    alerts_whatsapp: true,
    alerts_email: true,
    active: true,
  },
];

const emptyForm: Omit<Responsavel, "id"> = {
  name: "",
  phone: "",
  email: "",
  role: "",
  company_id: "all",
  alerts_audiencias: true,
  alerts_prazos: true,
  alerts_tarefas: true,
  alerts_whatsapp: true,
  alerts_email: true,
  active: true,
};

export default function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(initialResponsaveis);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Responsavel, "id">>(emptyForm);

  const filtered = responsaveis.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.role.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Responsavel) => {
    const { id, ...rest } = r;
    setForm(rest);
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    if (editingId) {
      setResponsaveis((prev) => prev.map((r) => (r.id === editingId ? { ...form, id: editingId } : r)));
      toast({ title: "Responsável atualizado" });
    } else {
      const newR: Responsavel = { ...form, id: `r${Date.now()}` };
      setResponsaveis((prev) => [...prev, newR]);
      toast({ title: "Responsável cadastrado" });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setResponsaveis((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Responsável removido" });
  };

  const getCompanyName = (cid: string) => {
    if (cid === "all") return "Todas as unidades";
    return mockCompanies.find((c) => c.id === cid)?.name || cid;
  };

  const activeAlerts = (r: Responsavel) => {
    const alerts: string[] = [];
    if (r.alerts_audiencias) alerts.push("Audiências");
    if (r.alerts_prazos) alerts.push("Prazos");
    if (r.alerts_tarefas) alerts.push("Tarefas");
    return alerts;
  };

  const activeChannels = (r: Responsavel) => {
    const ch: string[] = [];
    if (r.alerts_whatsapp) ch.push("WhatsApp");
    if (r.alerts_email) ch.push("E-mail");
    return ch;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Responsáveis</h1>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Responsável
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou função..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{r.name}</p>
                    {!r.active && <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {r.phone}
                    </span>
                    {r.email && <span>{r.email}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {getCompanyName(r.company_id)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeAlerts(r).map((a) => (
                      <Badge key={a} variant="outline" className="gap-1 text-[10px]">
                        <Bell className="h-2.5 w-2.5" /> {a}
                      </Badge>
                    ))}
                    {activeAlerts(r).length === 0 && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <BellOff className="h-2.5 w-2.5" /> Sem alertas
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeChannels(r).map((c) => (
                      <Badge key={c} className="bg-success/15 text-success text-[10px] border-0">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum responsável encontrado.
          </div>
        )}
      </div>

      {/* Dialog de cadastro/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Responsável" : "Novo Responsável"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Telefone (WhatsApp) *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Advogado, DP, Jurídico" />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {mockCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Receber alertas de:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Audiências</Label>
                  <Switch checked={form.alerts_audiencias} onCheckedChange={(v) => setForm({ ...form, alerts_audiencias: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Prazos</Label>
                  <Switch checked={form.alerts_prazos} onCheckedChange={(v) => setForm({ ...form, alerts_prazos: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Tarefas</Label>
                  <Switch checked={form.alerts_tarefas} onCheckedChange={(v) => setForm({ ...form, alerts_tarefas: v })} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Canais de notificação:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">WhatsApp</Label>
                  <Switch checked={form.alerts_whatsapp} onCheckedChange={(v) => setForm({ ...form, alerts_whatsapp: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">E-mail</Label>
                  <Switch checked={form.alerts_email} onCheckedChange={(v) => setForm({ ...form, alerts_email: v })} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Ativo</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
