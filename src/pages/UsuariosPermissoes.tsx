import { useState } from "react";
import { Users, Plus, Shield, Edit, Search, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { mockResponsaveis } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Role = "admin" | "interno" | "advogado_externo";
const roleLabels: Record<Role, string> = { admin: "Admin", interno: "Interno", advogado_externo: "Advogado Externo" };
const roleColors: Record<Role, string> = { admin: "bg-destructive/10 text-destructive", interno: "bg-primary/10 text-primary", advogado_externo: "bg-warning/15 text-warning" };

const mockUsers = mockResponsaveis.map((r, i) => ({
  ...r,
  role: (i === 0 ? "admin" : i <= 2 ? "interno" : "advogado_externo") as Role,
  last_login: `2026-02-${16 - i}T08:00:00`,
  permissions: {
    view_confidential: i <= 1,
    manage_users: i === 0,
    manage_checklists: i <= 2,
    manage_alerts: i <= 1,
    export_reports: i <= 2,
  },
}));

export default function UsuariosPermissoes() {
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Usuários e Permissões
          </h1>
          <p className="text-sm text-muted-foreground">Gerenciar acesso ao sistema</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Usuário criado (Demo)" }); setAddOpen(false); }}>
              <div className="space-y-2"><Label>Nome *</Label><Input required /></div>
              <div className="space-y-2"><Label>E-mail *</Label><Input type="email" required /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input /></div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Criar Usuário</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="h-9 pl-8 text-xs" />
      </div>

      <div className="mb-3 flex gap-2">
        {Object.entries(roleLabels).map(([k, v]) => (
          <Badge key={k} variant="outline" className="text-[10px]">{v}: {mockUsers.filter((u) => u.role === k).length}</Badge>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((user) => {
          const expanded = expandedUser === user.id;
          return (
            <div key={user.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedUser(expanded ? null : user.id)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <span className="text-xs font-bold text-primary">{user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <Badge className={cn("text-[9px] border-0", roleColors[user.role])}>{roleLabels[user.role]}</Badge>
                    {!user.active && <Badge className="text-[9px] bg-muted text-muted-foreground border-0">Inativo</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{user.email} · {roleLabels[user.role]}</p>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>

              {expanded && (
                <div className="border-t bg-muted/20 p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="text-xs"><span className="text-muted-foreground">Telefone:</span> {user.phone}</div>
                    <div className="text-xs"><span className="text-muted-foreground">Último login:</span> {new Date(user.last_login).toLocaleString("pt-BR")}</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2">Permissões</p>
                    <div className="space-y-2">
                      {[
                        { key: "view_confidential", label: "Acessar casos sigilosos" },
                        { key: "manage_users", label: "Gerenciar usuários" },
                        { key: "manage_checklists", label: "Gerenciar checklists" },
                        { key: "manage_alerts", label: "Gerenciar regras de alertas" },
                        { key: "export_reports", label: "Exportar relatórios" },
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between">
                          <span className="text-xs">{perm.label}</span>
                          <Switch checked={(user.permissions as any)[perm.key]} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
