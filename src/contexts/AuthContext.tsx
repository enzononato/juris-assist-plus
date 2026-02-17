import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { mockCompanies } from "@/data/mock";

export type AppRole = "admin" | "responsavel_juridico_interno" | "dp" | "rh" | "vendas" | "logistica" | "frota" | "advogado_externo";

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  responsavel_juridico_interno: "Resp. Jurídico Interno",
  dp: "Departamento Pessoal",
  rh: "Recursos Humanos",
  vendas: "Vendas",
  logistica: "Logística",
  frota: "Frota",
  advogado_externo: "Advogado Externo",
};

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  company_id: string; // "all" = access to all companies
  company_name: string;
}

const mockUsers: MockUser[] = [
  { id: "u1", name: "Ana Jurídico", email: "ana@revalle.com.br", role: "admin", company_id: "all", company_name: "Todas" },
  { id: "u2", name: "João DP", email: "joao.dp@revalle.com.br", role: "dp", company_id: "all", company_name: "Todas" },
  { id: "u3", name: "Maria RH", email: "maria.rh@revalle.com.br", role: "rh", company_id: "c1", company_name: "Revalle Juazeiro" },
  { id: "u4", name: "Dr. Roberto Advogado", email: "roberto@advocacia.com.br", role: "advogado_externo", company_id: "c1", company_name: "Revalle Juazeiro" },
  { id: "u5", name: "Dra. Patrícia Externa", email: "patricia@advocacia.com.br", role: "advogado_externo", company_id: "c2", company_name: "Revalle Bonfim" },
  { id: "u6", name: "Carlos Vendas", email: "carlos@revalle.com.br", role: "vendas", company_id: "c3", company_name: "Revalle Petrolina" },
  { id: "u7", name: "Dr. Marcos Interno", email: "marcos@revalle.com.br", role: "responsavel_juridico_interno", company_id: "all", company_name: "Todas" },
];

export { mockUsers as availableMockUsers };

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  /** Filter helper: returns true if item belongs to user's tenant */
  canAccessCompany: (companyId: string) => boolean;
  hasRole: (roles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  const login = useCallback((userId: string) => {
    const found = mockUsers.find((u) => u.id === userId);
    if (found) setUser(found);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const canAccessCompany = useCallback(
    (companyId: string) => {
      if (!user) return false;
      if (user.company_id === "all") return true;
      return user.company_id === companyId;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles: AppRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, canAccessCompany, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
