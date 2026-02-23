import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { mockCompanies } from "@/data/mock";

export type AppRole = "admin" | "responsavel_juridico_interno" | "dp" | "rh" | "vendas" | "logistica" | "frota" | "advogado_externo";

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  responsavel_juridico_interno: "Diretor",
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
  { id: "u1", name: "Thiago", email: "thiago@revalle.com.br", role: "admin", company_id: "all", company_name: "Todas" },
  { id: "u2", name: "Sandra", email: "sandra@revalle.com.br", role: "dp", company_id: "all", company_name: "Todas" },
  { id: "u3", name: "Samilly", email: "samilly@revalle.com.br", role: "rh", company_id: "c1", company_name: "Revalle Juazeiro" },
  { id: "u4", name: "Sullydaiane", email: "sullydaiane@advocacia.com.br", role: "advogado_externo", company_id: "c1", company_name: "Revalle Juazeiro" },
  { id: "u6", name: "David", email: "david@revalle.com.br", role: "vendas", company_id: "c3", company_name: "Revalle Petrolina" },
  { id: "u7", name: "Cintia", email: "cintia@revalle.com.br", role: "responsavel_juridico_interno", company_id: "all", company_name: "Todas" },
];

export { mockUsers as availableMockUsers };

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<Pick<MockUser, "name" | "email">>) => void;
  /** Filter helper: returns true if item belongs to user's tenant */
  canAccessCompany: (companyId: string) => boolean;
  hasRole: (roles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage (prevents login flash)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("siag_user_id");
      if (saved) {
        const found = mockUsers.find((u) => u.id === saved);
        if (found) setUser(found);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback((userId: string) => {
    const found = mockUsers.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem("siag_user_id", found.id);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("siag_user_id");
  }, []);

  const updateUserProfile = useCallback((updates: Partial<Pick<MockUser, "name" | "email">>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUserProfile, canAccessCompany, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
