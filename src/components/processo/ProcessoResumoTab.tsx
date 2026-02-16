import { CalendarDays, Clock, User, Phone, Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockResponsaveis, type Case } from "@/data/mock";

function ScaleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

interface Props {
  caso: Case;
}

export default function ProcessoResumoTab({ caso }: Props) {
  const responsavel = mockResponsaveis.find((r) => r.name === caso.responsible);
  const advogado = mockResponsaveis.find((r) => r.name === caso.lawyer);
  const linkedResponsaveis = [responsavel, advogado].filter(Boolean);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Dados do Processo</h3>
          <Info icon={<ScaleIcon />} label="Tribunal" value={caso.court} />
          <Info icon={<User className="h-4 w-4" />} label="Responsável" value={caso.responsible} />
          <Info icon={<User className="h-4 w-4" />} label="Advogado" value={caso.lawyer} />
          <Info label="Tema" value={caso.theme} />
          <Info label="Ajuizamento" value={new Date(caso.filed_at).toLocaleDateString("pt-BR")} />
        </div>
        <div className="space-y-4">
          {caso.next_hearing && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Próxima Audiência</h3>
              <p className="text-sm">{new Date(caso.next_hearing).toLocaleString("pt-BR")}</p>
            </div>
          )}
          {caso.next_deadline && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Próximo Prazo</h3>
              <p className="text-sm">{new Date(caso.next_deadline).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </div>
      </div>

      {linkedResponsaveis.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-3 text-sm font-semibold">Responsáveis & Contatos</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {linkedResponsaveis.map((r) => r && (
              <div key={r.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                    <div className="mt-2 space-y-1">
                      <a
                        href={`tel:${r.phone.replace(/\D/g, '')}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {r.phone}
                      </a>
                      {r.email && (
                        <a
                          href={`mailto:${r.email}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          {r.email}
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.alerts_whatsapp && (
                        <a
                          href={`https://wa.me/55${r.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge className="gap-1 text-[10px] bg-success/15 text-success border-0 cursor-pointer hover:bg-success/25">
                            <MessageCircle className="h-2.5 w-2.5" /> WhatsApp
                          </Badge>
                        </a>
                      )}
                      {r.alerts_email && (
                        <Badge className="text-[10px] bg-info/15 text-info border-0">
                          <Mail className="mr-1 h-2.5 w-2.5" /> E-mail ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
