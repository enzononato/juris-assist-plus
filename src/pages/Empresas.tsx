import { useState } from "react";
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockCompanies } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

const mockBranches = [
  { id: "b1", company_id: "c1", name: "Matriz Juazeiro", city: "Juazeiro", state: "BA", phone: "(74) 3611-0000", email: "juazeiro@revalle.com.br", active: true },
  { id: "b2", company_id: "c2", name: "Filial Bonfim", city: "Senhor do Bonfim", state: "BA", phone: "(74) 3541-0000", email: "bonfim@revalle.com.br", active: true },
  { id: "b3", company_id: "c3", name: "Filial Petrolina", city: "Petrolina", state: "PE", phone: "(87) 3861-0000", email: "petrolina@revalle.com.br", active: true },
  { id: "b4", company_id: "c4", name: "Filial Ribeira", city: "Ribeira do Pombal", state: "BA", phone: "(75) 3276-0000", email: "ribeira@revalle.com.br", active: true },
  { id: "b5", company_id: "c5", name: "Filial Paulo Afonso", city: "Paulo Afonso", state: "BA", phone: "(75) 3281-0000", email: "pauloafonso@revalle.com.br", active: true },
  { id: "b6", company_id: "c6", name: "Filial Alagoinhas", city: "Alagoinhas", state: "BA", phone: "(75) 3422-0000", email: "alagoinhas@revalle.com.br", active: false },
  { id: "b7", company_id: "c7", name: "Filial Serrinha", city: "Serrinha", state: "BA", phone: "(75) 3261-0000", email: "serrinha@revalle.com.br", active: true },
];

export default function Empresas() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Empresas e Filiais
          </h1>
          <p className="text-sm text-muted-foreground">Gerenciamento multi-tenant</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Empresa criada (Demo)" }); setAddOpen(false); }}>
              <div className="space-y-2"><Label>Nome *</Label><Input placeholder="Revalle..." required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Cidade</Label><Input placeholder="Cidade" /></div>
                <div className="space-y-2"><Label>Estado</Label><Input placeholder="BA" maxLength={2} /></div>
              </div>
              <div className="space-y-2"><Label>Telefone</Label><Input placeholder="(00) 0000-0000" /></div>
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" placeholder="empresa@revalle.com.br" /></div>
              <Button type="submit" className="w-full">Criar Empresa</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {mockCompanies.map((co) => {
          const branches = mockBranches.filter((b) => b.company_id === co.id);
          return (
            <div key={co.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{co.name}</p>
                    <p className="text-[11px] text-muted-foreground">{branches.length} filial(is)</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {branches.length > 0 && (
                <div className="border-t bg-muted/20 p-3 space-y-1.5">
                  {branches.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-lg bg-card p-2.5 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{b.name}</span>
                        <span className="text-muted-foreground"> · {b.city}/{b.state}</span>
                      </div>
                      {!b.active && <Badge className="text-[9px] bg-muted text-muted-foreground border-0">Inativa</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
