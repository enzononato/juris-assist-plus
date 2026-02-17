import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  mockCases,
  mockTasks,
  mockAlerts,
  mockHearings,
  mockDeadlines,
  mockCompanies,
  mockEmployees,
} from "@/data/mock";

/**
 * Returns mock data filtered by the logged-in user's tenant (company_id).
 * Also filters ultra_restrito cases for non-authorized roles.
 */
export function useTenantData() {
  const { user, canAccessCompany, hasRole } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        cases: [],
        tasks: [],
        alerts: [],
        hearings: [],
        deadlines: [],
        companies: [],
        employees: [],
      };
    }

    const canSeeConfidential = hasRole(["admin", "responsavel_juridico_interno"]);

    const cases = mockCases.filter((c) => {
      if (!canAccessCompany(c.company_id)) return false;
      // ACL: hide ultra_restrito from non-authorized users
      if (c.confidentiality === "ultra_restrito" && !canSeeConfidential) return false;
      return true;
    });
    const caseIds = new Set(cases.map((c) => c.id));

    return {
      cases,
      tasks: mockTasks.filter((t) => !t.case_id || caseIds.has(t.case_id)),
      alerts: mockAlerts,
      hearings: mockHearings.filter((h) => caseIds.has(h.case_id)),
      deadlines: mockDeadlines.filter((d) => caseIds.has(d.case_id)),
      companies: user.company_id === "all" ? mockCompanies : mockCompanies.filter((c) => c.id === user.company_id),
      employees: user.company_id === "all" ? mockEmployees : mockEmployees.filter((e) => e.company_id === user.company_id),
    };
  }, [user, canAccessCompany, hasRole]);
}
