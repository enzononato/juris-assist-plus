import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export const CHART_COLORS = [
  "hsl(230, 65%, 48%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(210, 80%, 52%)",
  "hsl(270, 50%, 55%)",
];

export function KPICard({ icon, label, value, sub, color, bg, trend, delay = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  return (
    <div
      className="rounded-xl border bg-card p-4 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${delay * 80}ms` }}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl [&>svg]:h-4.5 [&>svg]:w-4.5", bg, color)}>{icon}</div>
        {trend && (
          <span className={cn("text-[10px] font-bold", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/70">{sub}</p>
    </div>
  );
}

export function ChartCard({ title, icon, children, className, delay = 0 }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-4 shadow-soft hover:shadow-card transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500", className)}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
