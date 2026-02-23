import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Sparkles, History, Trash2, Edit, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface Props {
  caseId: string;
  caseData?: any;
}

export default function DocumentosProcessoTab({ caseId, caseData }: Props) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [versionsDoc, setVersionsDoc] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("none");

  // Form for manual creation
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");

  const { data: documents } = useQuery({
    queryKey: ["case-documents", caseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("generated_documents").select("*").eq("case_id", caseId).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["document-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("document_templates").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: versions } = useQuery({
    queryKey: ["document-versions", versionsDoc],
    enabled: !!versionsDoc,
    queryFn: async () => {
      const { data, error } = await supabase.from("document_versions").select("*").eq("document_id", versionsDoc!).order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const fillTemplate = (templateContent: string): string => {
    if (!caseData) return templateContent;
    const vars: Record<string, string> = {
      "{{numero_processo}}": caseData.case_number ?? "",
      "{{reclamante}}": caseData.employee_name ?? "",
      "{{reclamada}}": caseData.branch ?? "",
      "{{vara}}": caseData.court ?? "",
      "{{comarca}}": caseData.court ?? "",
      "{{advogado}}": caseData.lawyer ?? "",
      "{{data_atual}}": format(new Date(), "dd/MM/yyyy"),
      "{{valor_causa}}": caseData.amount ? Number(caseData.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      "{{tema}}": caseData.theme ?? "",
      "{{status}}": caseData.status ?? "",
      "{{filial}}": caseData.branch ?? "",
      "{{setor_responsavel}}": caseData.responsible_sector ?? "",
    };
    let result = templateContent;
    for (const [key, value] of Object.entries(vars)) {
      result = result.split(key).join(value);
    }
    return result;
  };

  const createDoc = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("generated_documents").insert({
        case_id: caseId, title: docTitle, content: docContent, source: "template",
      }).select().single();
      if (error) throw error;
      // Save version 1
      await supabase.from("document_versions").insert({ document_id: data.id, version: 1, content: docContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] });
      toast({ title: "Documento criado" });
      setCreateOpen(false);
      setDocTitle("");
      setDocContent("");
      setSelectedTemplate("none");
    },
  });

  const updateDoc = useMutation({
    mutationFn: async () => {
      const newVersion = (editDoc.version ?? 1) + 1;
      await supabase.from("document_versions").insert({
        document_id: editDoc.id, version: newVersion, content: editDoc.content,
      });
      const { error } = await supabase.from("generated_documents").update({
        content: editDoc.content, version: newVersion,
      }).eq("id", editDoc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] });
      toast({ title: "Documento atualizado (nova versão)" });
      setEditDoc(null);
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] });
      toast({ title: "Documento excluído" });
    },
  });

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const caseContext = caseData
        ? `Número: ${caseData.case_number}\nReclamante: ${caseData.employee_name}\nTema: ${caseData.theme}\nVara: ${caseData.court}\nValor: ${caseData.amount}\nStatus: ${caseData.status}\nAdvogado: ${caseData.lawyer}`
        : "";

      const template = selectedTemplate !== "none" ? templates?.find((t) => t.id === selectedTemplate) : null;

      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: {
          prompt: aiPrompt,
          caseContext,
          templateContent: template ? fillTemplate(template.content) : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDocContent(data.content);
      setDocTitle(aiPrompt.slice(0, 80));
      setAiOpen(false);
      setCreateOpen(true);
      toast({ title: "Documento gerado pela IA", description: "Revise o conteúdo antes de salvar." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId !== "none") {
      const t = templates?.find((tpl) => tpl.id === templateId);
      if (t) {
        setDocTitle(t.name);
        setDocContent(fillTemplate(t.content));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setAiOpen(true)}>
          <Sparkles className="h-3.5 w-3.5" /> Gerar com IA
        </Button>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo Documento
        </Button>
      </div>

      {/* Documents list */}
      {(!documents || documents.length === 0) ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento gerado para este processo.</p>
      ) : documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 group">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.title}</p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>v{doc.version}</span>
              <span>·</span>
              <Badge variant="outline" className="text-[9px]">{doc.source === "ia" ? "IA" : "Template"}</Badge>
              <span>·</span>
              <span>{format(new Date(doc.updated_at), "dd/MM/yyyy HH:mm")}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewDoc(doc)}><Eye className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditDoc({ ...doc })}><Edit className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setVersionsDoc(doc.id); }}><History className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteDoc.mutate(doc.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Documento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Template base (opcional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger><SelectValue placeholder="Selecione um template..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem template</SelectItem>
                  {templates?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Título do documento" />
            </div>
            <div>
              <Label className="text-xs">Conteúdo</Label>
              <Textarea value={docContent} onChange={(e) => setDocContent(e.target.value)} rows={14} className="font-mono text-xs" placeholder="Conteúdo do documento..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button size="sm" disabled={!docTitle || !docContent} onClick={() => createDoc.mutate()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewDoc?.title}</DialogTitle></DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{viewDoc?.content ?? ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar: {editDoc?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Textarea value={editDoc?.content ?? ""} onChange={(e) => setEditDoc((prev: any) => ({ ...prev, content: e.target.value }))} rows={16} className="font-mono text-xs" />
            <p className="text-[10px] text-muted-foreground">Salvar criará a versão {(editDoc?.version ?? 1) + 1}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDoc(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => updateDoc.mutate()}>Salvar Nova Versão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions dialog */}
      <Dialog open={!!versionsDoc} onOpenChange={() => setVersionsDoc(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Histórico de Versões</DialogTitle></DialogHeader>
          {(!versions || versions.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma versão anterior.</p>
          ) : versions.map((v) => (
            <div key={v.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Versão {v.version}</Badge>
                <span className="text-[10px] text-muted-foreground">{format(new Date(v.created_at), "dd/MM/yyyy HH:mm")}</span>
              </div>
              {v.changed_by && <p className="text-[10px] text-muted-foreground">Por: {v.changed_by}</p>}
              <p className="text-xs text-muted-foreground line-clamp-3 font-mono">{v.content.slice(0, 200)}...</p>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* AI Generation dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Gerar Documento com IA</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Template de referência (opcional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem template</SelectItem>
                  {templates?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">O que você precisa?</Label>
              <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4}
                placeholder="Ex: Gere uma petição inicial trabalhista sobre horas extras não pagas..." />
            </div>
            <p className="text-[10px] text-muted-foreground">A IA usará os dados do processo para preencher o documento automaticamente.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(false)}>Cancelar</Button>
            <Button size="sm" disabled={!aiPrompt || aiLoading} onClick={generateWithAI} className="gap-1.5">
              {aiLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gerando...</> : <><Sparkles className="h-3.5 w-3.5" /> Gerar</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
