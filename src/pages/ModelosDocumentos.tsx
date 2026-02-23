import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Edit, Trash2, Copy, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const categoryLabels: Record<string, string> = {
  peticao: "Petição",
  contestacao: "Contestação",
  recurso: "Recurso",
  notificacao: "Notificação",
  contrato: "Contrato",
  procuracao: "Procuração",
  parecer: "Parecer",
  outro: "Outro",
};

const AVAILABLE_VARIABLES = [
  "{{numero_processo}}", "{{reclamante}}", "{{reclamada}}", "{{vara}}", "{{comarca}}",
  "{{advogado}}", "{{data_atual}}", "{{valor_causa}}", "{{tema}}", "{{status}}",
  "{{filial}}", "{{setor_responsavel}}",
];

export default function ModelosDocumentos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("peticao");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["document-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("document_templates").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = templates?.filter((t) => {
    if (catFilter !== "all" && t.category !== catFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{[a-z_]+\}\}/g);
    return matches ? [...new Set(matches)] : [];
  };

  const save = useMutation({
    mutationFn: async () => {
      const variables = extractVariables(content);
      if (editId) {
        const { error } = await supabase.from("document_templates").update({ name, category, description, content, variables }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("document_templates").insert({ name, category, description, content, variables });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      toast({ title: editId ? "Modelo atualizado" : "Modelo criado" });
      closeDialog();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("document_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      toast({ title: "Modelo excluído" });
    },
  });

  const duplicate = useMutation({
    mutationFn: async (t: any) => {
      const { error } = await supabase.from("document_templates").insert({
        name: `${t.name} (cópia)`, category: t.category, description: t.description, content: t.content, variables: t.variables,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      toast({ title: "Modelo duplicado" });
    },
  });

  const openEdit = (t: any) => {
    setEditId(t.id);
    setName(t.name);
    setCategory(t.category);
    setDescription(t.description ?? "");
    setContent(t.content);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
    setName("");
    setCategory("peticao");
    setDescription("");
    setContent("");
  };

  const insertVariable = (v: string) => {
    setContent((prev) => prev + v);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Modelos de Documentos</h1>
          <p className="text-sm text-muted-foreground">Biblioteca de templates com variáveis automáticas</p>
        </div>
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar modelo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(!filtered || filtered.length === 0) ? (
          <p className="col-span-full text-sm text-muted-foreground text-center py-12">Nenhum modelo encontrado.</p>
        ) : filtered.map((t) => (
          <Card key={t.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold truncate">{t.name}</h3>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">{categoryLabels[t.category] ?? t.category}</Badge>
              </div>
              {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
              {t.variables && t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.variables.slice(0, 5).map((v: string) => (
                    <Badge key={v} variant="secondary" className="text-[9px] font-mono">{v}</Badge>
                  ))}
                  {t.variables.length > 5 && <Badge variant="secondary" className="text-[9px]">+{t.variables.length - 5}</Badge>}
                </div>
              )}
              <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Edit className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicate.mutate(t)}><Copy className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Modelo" : "Novo Modelo de Documento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Petição Inicial Trabalhista" />
              </div>
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do modelo" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Conteúdo do Template</Label>
                <span className="text-[10px] text-muted-foreground">Clique para inserir variáveis:</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button key={v} type="button" onClick={() => insertVariable(v)}
                    className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono hover:bg-primary/10 transition-colors">
                    {v}
                  </button>
                ))}
              </div>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                placeholder="Digite o conteúdo do template aqui. Use {{variavel}} para campos dinâmicos..." className="font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeDialog}>Cancelar</Button>
            <Button size="sm" disabled={!name || !content} onClick={() => save.mutate()}>
              {editId ? "Atualizar" : "Criar Modelo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
