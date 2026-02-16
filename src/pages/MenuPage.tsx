import { Building2, Users, Settings, Shield, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Empresas e Filiais", icon: Building2, description: "Gerenciar organizações" },
  { label: "Usuários e Permissões", icon: Users, description: "Controle de acesso" },
  { label: "Checklists", icon: FileText, description: "Templates e modelos" },
  { label: "Casos Sigilosos", icon: Shield, description: "Sala segura" },
  { label: "Configurações", icon: Settings, description: "Preferências do sistema" },
];

export default function MenuPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Menu</h1>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button className="mt-8 flex items-center gap-3 text-sm text-destructive hover:underline">
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
