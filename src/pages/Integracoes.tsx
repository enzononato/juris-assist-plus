import { useState } from "react";
import { MessageCircle, Mail, HardDrive, Sparkles, Send, CheckCircle2, Clock, AlertTriangle, ExternalLink, Settings, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCases, mockResponsaveis } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ===== MOCK DATA =====
const mockWhatsAppLogs = [
  { id: "w1", to: "Ana Jurídico", phone: "(74) 99912-3456", template: "Alerta de Prazo", status: "entregue" as const, sent_at: "2026-02-16T10:00:00", case_number: "0005678-90.2024.5.02.0002" },
  { id: "w2", to: "João DP", phone: "(74) 99934-5678", template: "Alerta de SLA", status: "entregue" as const, sent_at: "2026-02-16T08:30:00", case_number: "0009876-12.2024.5.03.0003" },
  { id: "w3", to: "Dra. Patrícia Externa", phone: "(87) 99765-4321", template: "Alerta de Audiência", status: "erro" as const, sent_at: "2026-02-15T16:00:00", case_number: "0005678-90.2024.5.02.0002" },
  { id: "w4", to: "Dr. Marcos Interno", phone: "(74) 99888-7654", template: "Alerta de Prazo", status: "entregue" as const, sent_at: "2026-02-15T09:00:00", case_number: "0003456-78.2025.5.02.0005" },
];

const mockEmailInbox = [
  { id: "e1", from: "dp@revalle.com.br", subject: "RE: Processo 0001234 - Espelhos de ponto março", date: "2026-02-16T14:30:00", attachments: 2, matched_case: "0001234-56.2024.5.01.0001", status: "pendente" as const },
  { id: "e2", from: "rh@revalle.com.br", subject: "Documentos - Processo 0005678", date: "2026-02-16T11:00:00", attachments: 1, matched_case: "0005678-90.2024.5.02.0002", status: "confirmado" as const },
  { id: "e3", from: "seguranca@revalle.com.br", subject: "Registros CFTV solicitados", date: "2026-02-15T16:45:00", attachments: 3, matched_case: null, status: "pendente" as const },
];

const mockDriveLinks = [
  { id: "d1", url: "https://drive.google.com/file/d/abc123", name: "Escalas_2023.xlsx", source: "Google Drive", case_id: "1", imported: true, added_at: "2026-02-16T09:00:00" },
  { id: "d2", url: "https://onedrive.live.com/redir?resid=def456", name: "Contrato_trabalho.pdf", source: "OneDrive", case_id: "1", imported: false, added_at: "2026-02-15T14:00:00" },
];

const statusStyles = { entregue: "bg-success/15 text-success", erro: "bg-destructive/10 text-destructive", pendente: "bg-warning/15 text-warning", confirmado: "bg-success/15 text-success" };

export default function Integracoes() {
  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Integrações</h1>
      <p className="mb-6 text-sm text-muted-foreground">WhatsApp, E-mail, Drive e IA</p>

      <Tabs defaultValue="whatsapp">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="whatsapp" className="gap-1.5 text-xs"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> E-mail Ingest</TabsTrigger>
          <TabsTrigger value="drive" className="gap-1.5 text-xs"><HardDrive className="h-3.5 w-3.5" /> Drive</TabsTrigger>
          <TabsTrigger value="ia" className="gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" /> IA</TabsTrigger>
        </TabsList>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp">
          <WhatsAppTab />
        </TabsContent>

        {/* EMAIL */}
        <TabsContent value="email">
          <EmailIngestTab />
        </TabsContent>

        {/* DRIVE */}
        <TabsContent value="drive">
          <DriveTab />
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia">
          <IATab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WhatsAppTab() {
  const optedIn = mockResponsaveis.filter((r) => r.alerts_whatsapp);

  return (
    <div className="space-y-6">
      {/* Config card */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-success" />
            <h3 className="text-sm font-semibold">WhatsApp Business API</h3>
          </div>
          <Badge className="bg-warning/15 text-warning border-0 text-[10px]">Demo – sem backend</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Alertas automáticos de prazos, audiências e SLA enviados via WhatsApp para responsáveis com opt-in ativo.</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px]">Templates: 3 aprovados</Badge>
          <Badge variant="outline" className="text-[10px]">Opt-in: {optedIn.length} usuários</Badge>
        </div>
      </div>

      {/* Opt-in users */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuários com WhatsApp ativo</h4>
        <div className="space-y-2">
          {optedIn.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
              <Switch checked={true} />
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Log de Envios</h4>
        <div className="space-y-2">
          {mockWhatsAppLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Send className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{log.template} → {log.to}</p>
                <p className="text-[11px] text-muted-foreground">{log.case_number} · {new Date(log.sent_at).toLocaleString("pt-BR")}</p>
              </div>
              <Badge className={cn("text-[10px] border-0 shrink-0", statusStyles[log.status])}>
                {log.status === "entregue" ? "Entregue" : "Erro"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailIngestTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-info" />
            <h3 className="text-sm font-semibold">Ingestão de E-mails</h3>
          </div>
          <Badge className="bg-warning/15 text-warning border-0 text-[10px]">Demo – sem backend</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          E-mails enviados para <strong>juridico@revalle.com.br</strong> ou <strong>dp@revalle.com.br</strong> são processados automaticamente. Anexos viram evidências pendentes e são vinculados ao processo identificado no assunto.
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mails Recebidos</h4>
        <div className="space-y-2">
          {mockEmailInbox.map((email) => (
            <div key={email.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{email.subject}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    De: {email.from} · {new Date(email.date).toLocaleString("pt-BR")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">{email.attachments} anexo(s)</Badge>
                    {email.matched_case ? (
                      <Badge variant="outline" className="text-[10px]">Processo: {email.matched_case}</Badge>
                    ) : (
                      <Badge className="text-[10px] bg-warning/15 text-warning border-0">Processo não identificado</Badge>
                    )}
                  </div>
                </div>
                <Badge className={cn("text-[10px] border-0 shrink-0", statusStyles[email.status])}>
                  {email.status === "pendente" ? "Pendente" : "Confirmado"}
                </Badge>
              </div>
              {email.status === "pendente" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast({ title: "Evidências vinculadas", description: `${email.attachments} anexo(s) adicionados como evidências pendentes. (Demo)` })}>
                    <CheckCircle2 className="h-3 w-3" /> Confirmar e vincular
                  </Button>
                  {!email.matched_case && (
                    <Select>
                      <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Vincular processo..." /></SelectTrigger>
                      <SelectContent>
                        {mockCases.map((c) => <SelectItem key={c.id} value={c.id}>{c.case_number}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DriveTab() {
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Google Drive / OneDrive</h3>
          </div>
          <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Anexar por Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Anexar Link do Drive</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                toast({ title: "Link anexado", description: "Arquivo vinculado ao processo com sucesso. (Demo)" });
                setAddLinkOpen(false);
              }}>
                <div className="space-y-2">
                  <Label>URL do arquivo *</Label>
                  <Input placeholder="https://drive.google.com/file/d/..." required />
                </div>
                <div className="space-y-2">
                  <Label>Processo *</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {mockCases.map((c) => <SelectItem key={c.id} value={c.id}>{c.employee} – {c.case_number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome do arquivo</Label>
                  <Input placeholder="Ex: Contrato_trabalho.pdf" />
                </div>
                <Button type="submit" className="w-full">Anexar Link</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-muted-foreground">Anexe arquivos por link do Google Drive ou OneDrive. Opcionalmente, importe para o armazenamento do sistema.</p>
      </div>

      <div className="space-y-2">
        {mockDriveLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <HardDrive className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{link.name}</p>
              <p className="text-[11px] text-muted-foreground">{link.source} · {new Date(link.added_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {link.imported ? (
                <Badge className="text-[10px] bg-success/15 text-success border-0">Importado</Badge>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast({ title: "Importando...", description: "Arquivo copiado para o armazenamento do sistema. (Demo)" })}>
                  Importar
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(link.url, "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IATab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Classificador de Evidências</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao subir um arquivo, a Juria IA sugere automaticamente categoria, origem e período com base na análise do conteúdo.
          </p>
          <Badge variant="outline" className="text-[10px]">Modelo: Juria v1.0 (Demo)</Badge>
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p>📊 5 arquivos processados (demo)</p>
            <p>✅ 4 sugestões aceitas (80%)</p>
            <p>📝 1 sugestão ajustada pelo usuário</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Resumo IA do Caso</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Gera resumo automático com timeline, provas e pontos de atenção para preparação de audiências. Disponível na aba "Resumo IA" de cada processo.
          </p>
          <Badge variant="outline" className="text-[10px]">Modelo: Juria v1.0 (Demo)</Badge>
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p>📄 3 resumos gerados (demo)</p>
            <p>⏱️ ~2s por resumo</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Log de Classificações IA</h3>
        <div className="space-y-2">
          {[
            { file: "espelho_ponto_jan2024.pdf", suggested: "Ponto Eletrônico", confidence: 95, accepted: true, user: "João DP" },
            { file: "escala_trabalho_2023.xlsx", suggested: "Escalas", confidence: 88, accepted: true, user: "Maria RH" },
            { file: "registro_cftv_corredor.mp4", suggested: "CFTV / Câmera", confidence: 92, accepted: true, user: "João DP" },
            { file: "conversas_teams_supervisor.pdf", suggested: "Conversas Oficiais", confidence: 78, accepted: false, user: "Ana Jurídico" },
            { file: "atestado_medico_reclamante.pdf", suggested: "Atestados / Justificativas", confidence: 85, accepted: true, user: "Ana Jurídico" },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{log.file}</p>
                <p className="text-[11px] text-muted-foreground">
                  Sugestão: {log.suggested} ({log.confidence}%) · {log.user}
                </p>
              </div>
              <Badge className={cn("text-[10px] border-0 shrink-0", log.accepted ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                {log.accepted ? "Aceita" : "Ajustada"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
