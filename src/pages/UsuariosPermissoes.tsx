import { useState } from "react";
import { Users, Plus, Shield, Edit, Search, Trash2, Save, X, Building2, ChevronDown, ChevronUp, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { mockResponsaveis, mockCompanies } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Role = "admin" | "interno" | "advogado_externo";
const roleLabels: Record<Role, string> = { admin: "Admin", interno: "Interno", advogado_externo: "Advogado Externo" };
const roleColors: Record<Role, string> = { admin: "bg-destructive/10 text-destructive", interno: "bg-primary/10 text-primary", advogado_externo: "bg-warning/15 text-warning" };

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: Role;
  last_login: string;
  revendas: string[];
  permissions: {
    view_confidential: boolean;
    manage_users: boolean;
    manage_checklists: boolean;
    manage_alerts: boolean;
    export_reports: boolean;
  };
}

const initialUsers: UserData[] = mockResponsaveis.map((r, i) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  active: r.active !== undefined ? r.active : true,
  role: (i === 0 ? "admin" : i <= 2 ? "interno" : "advogado_externo") as Role,
  last_login: `2026-02-${16 - i}T08:00:00`,
  revendas: i === 0 ? mockCompanies.map(c => c.id) : [mockCompanies[i % mockCompanies.length].id],
  permissions: {
    view_confidential: i <= 1,
    manage_users: i === 0,
    manage_checklists: i <= 2,
    manage_alerts: i <= 1,
    export_reports: i <= 2,
  },
}));

export default function UsuariosPermissoes() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<Role | "">("");
  const [selectedRevendas, setSelectedRevendas] = useState<string[]>([]);

  const toggleRevenda = (id: string) => {
    setSelectedRevendas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAllRevendas = () => {
    setSelectedRevendas(prev =>
      prev.length === mockCompanies.length ? [] : mockCompanies.map((c) => c.id)
    );
  };

  const toggleEditRevenda = (id: string) => {
    setEditForm(prev => {
      const current = prev.revendas || [];
      return { ...prev, revendas: current.includes(id) ? current.filter(r => r !== id) : [...current, id] };
    });
  };

  const selectAllEditRevendas = () => {
    setEditForm(prev => {
      const current = prev.revendas || [];
      return { ...prev, revendas: current.length === mockCompanies.length ? [] : mockCompanies.map(c => c.id) };
    });
  };

  const startEditing = (user: UserData) => {
    setEditingUser(user.id);
    setEditForm({ ...user, permissions: { ...user.permissions } });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (!editingUser) return;
    if ((editForm.revendas || []).length === 0) {
      toast({ title: "Selecione ao menos uma revenda", variant: "destructive" });
      return;
    }
    setUsers(prev => prev.map(u => u.id === editingUser ? { ...u, ...editForm } as UserData : u));
    toast({ title: "Usuário atualizado", description: `${editForm.name} foi atualizado com sucesso.` });
    setEditingUser(null);
    setEditForm({});
  };

  const toggleUserActive = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newActive = !u.active;
      toast({ title: newActive ? "Usuário ativado" : "Usuário desativado", description: `${u.name} foi ${newActive ? "ativado" : "desativado"}.` });
      return { ...u, active: newActive };
    }));
  };

  const deleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setExpandedUser(null);
    toast({ title: "Usuário excluído", description: `${user?.name} foi removido do sistema.` });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRevendas.length === 0) {
      toast({ title: "Selecione ao menos uma revenda", variant: "destructive" });
      return;
    }
    const newUser: UserData = {
      id: `u${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone,
      active: true,
      role: newUserRole as Role,
      last_login: "",
      revendas: selectedRevendas,
      permissions: { view_confidential: false, manage_users: false, manage_checklists: false, manage_alerts: false, export_reports: false },
    };
    setUsers(prev => [...prev, newUser]);
    toast({ title: "Usuário criado", description: `${newName} adicionado com acesso a ${selectedRevendas.length} revenda(s).` });
    setAddOpen(false);
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewUserRole(""); setSelectedRevendas([]);
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionsList = [
    { key: "view_confidential", label: "Acessar casos sigilosos" },
    { key: "manage_users", label: "Gerenciar usuários" },
    { key: "manage_checklists", label: "Gerenciar checklists" },
    { key: "manage_alerts", label: "Gerenciar regras de alertas" },
    { key: "export_reports", label: "Exportar relatórios" },
  ] as const;

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
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2"><Label>Nome *</Label><Input required value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="space-y-2"><Label>E-mail *</Label><Input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Perfil *</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as Role)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-primary" /> Revendas com Acesso *</Label>
                  <button type="button" onClick={selectAllRevendas} className="text-[10px] font-semibold text-primary hover:underline">
                    {selectedRevendas.length === mockCompanies.length ? "Desmarcar todas" : "Selecionar todas"}
                  </button>
                </div>
                {selectedRevendas.length > 0 && <p className="text-[10px] text-muted-foreground">{selectedRevendas.length} de {mockCompanies.length} revenda(s)</p>}
                <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/20 p-2 space-y-1">
                  {mockCompanies.map((company) => (
                    <label key={company.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={selectedRevendas.includes(company.id)} onCheckedChange={() => toggleRevenda(company.id)} />
                      <span className="text-xs font-medium">{company.name}</span>
                    </label>
                  ))}
                </div>
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
          <Badge key={k} variant="outline" className="text-[10px]">{v}: {users.filter((u) => u.role === k).length}</Badge>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((user) => {
          const expanded = expandedUser === user.id;
          const isEditing = editingUser === user.id;

          return (
            <div key={user.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => { if (!isEditing) setExpandedUser(expanded ? null : user.id); }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <span className="text-xs font-bold text-primary">{user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <Badge className={cn("text-[9px] border-0", roleColors[user.role])}>{roleLabels[user.role]}</Badge>
                    {!user.active && <Badge className="text-[9px] bg-muted text-muted-foreground border-0">Inativo</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>

              {expanded && (
                <div className="border-t bg-muted/20 p-4 space-y-4 animate-in fade-in duration-200">
                  {isEditing ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input className="h-8 text-xs" value={editForm.name || ""} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">E-mail</Label>
                          <Input className="h-8 text-xs" value={editForm.email || ""} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Telefone</Label>
                          <Input className="h-8 text-xs" value={editForm.phone || ""} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Perfil</Label>
                          <Select value={editForm.role || ""} onValueChange={v => setEditForm(prev => ({ ...prev, role: v as Role }))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-1.5"><Building2 className="h-3 w-3 text-primary" /> Revendas</Label>
                          <button type="button" onClick={selectAllEditRevendas} className="text-[10px] font-semibold text-primary hover:underline">
                            {(editForm.revendas || []).length === mockCompanies.length ? "Desmarcar todas" : "Selecionar todas"}
                          </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto rounded-lg border bg-background p-2 space-y-1">
                          {mockCompanies.map(company => (
                            <label key={company.id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50 cursor-pointer transition-colors">
                              <Checkbox checked={(editForm.revendas || []).includes(company.id)} onCheckedChange={() => toggleEditRevenda(company.id)} />
                              <span className="text-xs">{company.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-2">Permissões</p>
                        <div className="space-y-2">
                          {permissionsList.map((perm) => (
                            <div key={perm.key} className="flex items-center justify-between">
                              <span className="text-xs">{perm.label}</span>
                              <Switch
                                checked={(editForm.permissions as any)?.[perm.key] ?? false}
                                onCheckedChange={checked => setEditForm(prev => ({
                                  ...prev,
                                  permissions: { ...(prev.permissions as any), [perm.key]: checked }
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="gap-1.5 text-xs" onClick={saveEditing}>
                          <Save className="h-3 w-3" /> Salvar
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={cancelEditing}>
                          <X className="h-3 w-3" /> Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="text-xs"><span className="text-muted-foreground">Telefone:</span> {user.phone}</div>
                        <div className="text-xs"><span className="text-muted-foreground">Último login:</span> {user.last_login ? new Date(user.last_login).toLocaleString("pt-BR") : "Nunca"}</div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-primary" /> Revendas ({user.revendas.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {user.revendas.map(rid => {
                            const company = mockCompanies.find(c => c.id === rid);
                            return company ? <Badge key={rid} variant="secondary" className="text-[10px]">{company.name}</Badge> : null;
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-2">Permissões</p>
                        <div className="space-y-2">
                          {permissionsList.map((perm) => (
                            <div key={perm.key} className="flex items-center justify-between">
                              <span className="text-xs">{perm.label}</span>
                              <Switch checked={user.permissions[perm.key]} disabled />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); startEditing(user); }}>
                          <Edit className="h-3 w-3" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn("gap-1.5 text-xs", user.active ? "text-warning hover:bg-warning/10 border-warning/30" : "text-success hover:bg-success/10 border-success/30")}
                          onClick={(e) => { e.stopPropagation(); toggleUserActive(user.id); }}
                        >
                          {user.active ? <><UserX className="h-3 w-3" /> Desativar</> : <><UserCheck className="h-3 w-3" /> Ativar</>}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
                              <Trash2 className="h-3 w-3" /> Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir <strong>{user.name}</strong>? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteUser(user.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
