import {
  mockCases,
  mockTasks,
  mockHearings,
  mockDeadlines,
  mockAlerts,
  statusLabels,
  type Case,
  type Task,
  type Hearing,
  type Deadline,
} from "@/data/mock";

/**
 * Build a compact text summary of the current system data
 * to inject as context into the Juria AI system prompt.
 */
export function buildJuriaContext(filteredCases?: Case[]): string {
  const cases = filteredCases ?? mockCases;
  const caseIds = new Set(cases.map((c) => c.id));

  const tasks = mockTasks.filter((t) => !t.case_id || caseIds.has(t.case_id));
  const hearings = mockHearings.filter((h) => caseIds.has(h.case_id));
  const deadlines = mockDeadlines.filter((d) => caseIds.has(d.case_id));
  const alerts = mockAlerts.filter((a) => !a.treated);

  const lines: string[] = [];

  // Cases summary
  lines.push(`### Processos (${cases.length} total)`);
  if (cases.length > 0) {
    lines.push("| Nº | Reclamante | Tema | Status | Responsável | Valor |");
    lines.push("|---|---|---|---|---|---|");
    cases.forEach((c) => {
      const valor = c.amount != null ? `R$ ${c.amount.toLocaleString("pt-BR")}` : "N/I";
      lines.push(`| ${c.case_number} | ${c.employee} | ${c.theme} | ${statusLabels[c.status]} | ${c.responsible} | ${valor} |`);
    });
  }

  // Upcoming deadlines
  const pendingDeadlines = deadlines.filter((d) => d.status === "pendente");
  if (pendingDeadlines.length > 0) {
    lines.push(`\n### ⏰ Prazos Pendentes (${pendingDeadlines.length})`);
    pendingDeadlines.forEach((d) => {
      lines.push(`- **${d.title}** — Processo ${d.case_number} (${d.employee}) — Vence: ${new Date(d.due_at).toLocaleDateString("pt-BR")}`);
    });
  }

  // Upcoming hearings
  const upcomingHearings = hearings.filter((h) => h.status === "agendada");
  if (upcomingHearings.length > 0) {
    lines.push(`\n### 📅 Audiências Agendadas (${upcomingHearings.length})`);
    upcomingHearings.forEach((h) => {
      lines.push(`- **${h.type}** — Processo ${h.case_number} (${h.employee}) — ${new Date(h.date).toLocaleDateString("pt-BR")} às ${h.time} — ${h.court}`);
    });
  }

  // Open tasks
  const openTasks = tasks.filter((t) => t.status === "aberta" || t.status === "em_andamento");
  if (openTasks.length > 0) {
    lines.push(`\n### 📋 Tarefas Abertas (${openTasks.length})`);
    openTasks.slice(0, 15).forEach((t) => {
      const caseRef = t.case_number ? ` — Processo ${t.case_number}` : "";
      lines.push(`- **${t.title}**${caseRef} — Responsáveis: ${t.assignees.join(", ")} — Prazo: ${new Date(t.due_at).toLocaleDateString("pt-BR")} — Prioridade: ${t.priority}`);
    });
  }

  // Active alerts
  if (alerts.length > 0) {
    lines.push(`\n### ⚠️ Alertas Ativos (${alerts.length})`);
    alerts.slice(0, 10).forEach((a) => {
      lines.push(`- [${a.severity.toUpperCase()}] ${a.title}: ${a.description}`);
    });
  }

  // Stats
  const stats = {
    total: cases.length,
    em_andamento: cases.filter((c) => c.status === "em_andamento").length,
    audiencia_marcada: cases.filter((c) => c.status === "audiencia_marcada").length,
    encerrado: cases.filter((c) => c.status === "encerrado").length,
  };
  lines.push(`\n### 📊 Resumo`);
  lines.push(`- Total de processos: ${stats.total}`);
  lines.push(`- Em andamento: ${stats.em_andamento}`);
  lines.push(`- Com audiência marcada: ${stats.audiencia_marcada}`);
  lines.push(`- Encerrados: ${stats.encerrado}`);
  lines.push(`- Prazos pendentes: ${pendingDeadlines.length}`);
  lines.push(`- Tarefas abertas: ${openTasks.length}`);

  return lines.join("\n");
}

/**
 * Build context for a specific case (used in ProcessoAIResumoTab)
 */
export function buildCaseContext(caso: Case): string {
  const hearings = mockHearings.filter((h) => h.case_id === caso.id);
  const deadlines = mockDeadlines.filter((d) => d.case_id === caso.id);
  const tasks = mockTasks.filter((t) => t.case_id === caso.id);

  const lines: string[] = [];
  lines.push(`### Processo: ${caso.case_number}`);
  lines.push(`- **Reclamante**: ${caso.employee}`);
  lines.push(`- **Reclamada**: ${caso.company} (${caso.branch})`);
  lines.push(`- **Tema**: ${caso.theme}`);
  lines.push(`- **Status**: ${statusLabels[caso.status]}`);
  lines.push(`- **Vara/Tribunal**: ${caso.court}`);
  lines.push(`- **Responsável**: ${caso.responsible}`);
  lines.push(`- **Advogado**: ${caso.lawyer}`);
  lines.push(`- **Ajuizado em**: ${new Date(caso.filed_at).toLocaleDateString("pt-BR")}`);
  if (caso.amount != null) lines.push(`- **Valor da causa**: R$ ${caso.amount.toLocaleString("pt-BR")}`);
  lines.push(`- **Sigilo**: ${caso.confidentiality}`);

  if (hearings.length > 0) {
    lines.push(`\n#### Audiências (${hearings.length})`);
    hearings.forEach((h) => {
      lines.push(`- ${h.type} — ${new Date(h.date).toLocaleDateString("pt-BR")} às ${h.time} — Status: ${h.status} — ${h.court}`);
    });
  }

  if (deadlines.length > 0) {
    lines.push(`\n#### Prazos (${deadlines.length})`);
    deadlines.forEach((d) => {
      lines.push(`- ${d.title} — Vence: ${new Date(d.due_at).toLocaleDateString("pt-BR")} — Status: ${d.status}`);
    });
  }

  if (tasks.length > 0) {
    lines.push(`\n#### Tarefas (${tasks.length})`);
    tasks.forEach((t) => {
      lines.push(`- ${t.title} — Status: ${t.status} — Responsáveis: ${t.assignees.join(", ")}`);
    });
  }

  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────────
// Dynamic suggestions & contextual welcome
// ──────────────────────────────────────────────────────────────

interface DynamicSuggestion {
  icon: string;
  text: string;
}

/**
 * Generate dynamic suggestions based on actual system data + current route.
 */
export function buildDynamicSuggestions(
  cases: Case[],
  tasks: Task[],
  hearings: Hearing[],
  deadlines: Deadline[],
  pathname: string,
): DynamicSuggestion[] {
  const now = new Date();
  const suggestions: DynamicSuggestion[] = [];

  // Deadline within 3 days
  const urgentDeadlines = deadlines.filter((d) => {
    if (d.status !== "pendente") return false;
    const diff = (new Date(d.due_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  if (urgentDeadlines.length > 0) {
    suggestions.push({ icon: "⏰", text: "Quais prazos vencem esta semana?" });
  }

  // Upcoming hearing
  const nextHearing = hearings.find((h) => h.status === "agendada" && new Date(h.date) >= now);
  if (nextHearing) {
    suggestions.push({ icon: "📅", text: `Me prepare para a audiência de ${nextHearing.employee}` });
  }

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => (t.status === "aberta" || t.status === "em_andamento") && new Date(t.due_at) < now);
  if (overdueTasks.length > 0) {
    suggestions.push({ icon: "🚨", text: "Quais tarefas estão atrasadas?" });
  }

  // Route-specific suggestions
  if (pathname.startsWith("/agenda")) {
    suggestions.push({ icon: "🗓️", text: "Resuma minha semana" });
    suggestions.push({ icon: "📆", text: "Quais compromissos tenho amanhã?" });
  } else if (pathname.startsWith("/processos") && pathname.split("/").length <= 2) {
    suggestions.push({ icon: "⚖️", text: "Quais os processos de maior risco?" });
  } else if (pathname.startsWith("/dashboard") || pathname === "/") {
    suggestions.push({ icon: "📊", text: "Me dê uma visão geral do escritório" });
    suggestions.push({ icon: "⚠️", text: "Quais alertas precisam de atenção?" });
  } else if (pathname.startsWith("/tarefas")) {
    suggestions.push({ icon: "📋", text: "Quais tarefas estão pendentes?" });
  }

  // Fixed fallback suggestions if we have fewer than 4
  const fixed: DynamicSuggestion[] = [
    { icon: "📋", text: "Resuma os processos em andamento" },
    { icon: "📊", text: "Me dê uma visão geral do escritório" },
    { icon: "⏰", text: "Qual o prazo mais urgente?" },
    { icon: "⚖️", text: "Quais os processos de maior risco?" },
  ];

  // Remove duplicates by text
  const seen = new Set(suggestions.map((s) => s.text));
  for (const f of fixed) {
    if (suggestions.length >= 6) break;
    if (!seen.has(f.text)) {
      suggestions.push(f);
      seen.add(f.text);
    }
  }

  return suggestions.slice(0, 6);
}

/**
 * Build a contextual welcome message based on real data (no AI call).
 */
export function buildWelcomeMessage(
  cases: Case[],
  tasks: Task[],
  hearings: Hearing[],
  deadlines: Deadline[],
): string {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const pendingDeadlines = deadlines.filter((d) => d.status === "pendente");
  const upcomingHearings = hearings.filter((h) => h.status === "agendada");
  const openTasks = tasks.filter((t) => t.status === "aberta" || t.status === "em_andamento");

  const parts: string[] = [`${greeting}! 👋`];
  const stats: string[] = [];

  if (cases.length > 0) stats.push(`**${cases.length}** processo${cases.length > 1 ? "s" : ""}`);
  if (pendingDeadlines.length > 0) stats.push(`**${pendingDeadlines.length}** prazo${pendingDeadlines.length > 1 ? "s" : ""} pendente${pendingDeadlines.length > 1 ? "s" : ""}`);
  if (upcomingHearings.length > 0) stats.push(`**${upcomingHearings.length}** audiência${upcomingHearings.length > 1 ? "s" : ""} agendada${upcomingHearings.length > 1 ? "s" : ""}`);
  if (openTasks.length > 0) stats.push(`**${openTasks.length}** tarefa${openTasks.length > 1 ? "s" : ""} aberta${openTasks.length > 1 ? "s" : ""}`);

  if (stats.length > 0) {
    parts.push(`Você tem ${stats.join(", ")}.`);
  } else {
    parts.push("Tudo tranquilo por aqui — nenhum prazo ou tarefa pendente no momento.");
  }

  parts.push("\nComo posso ajudar?");

  return parts.join(" ");
}
