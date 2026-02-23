import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    const in3days = new Date(today);
    in3days.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().slice(0, 10);
    const in3daysStr = in3days.toISOString().slice(0, 10);

    // Fetch pending entries with due_date <= 3 days from now
    const { data: entries, error: fetchErr } = await supabase
      .from("financial_entries")
      .select("id, description, amount, due_date, case_id, cases(case_number, employee_name)")
      .eq("status", "pendente")
      .not("due_date", "is", null)
      .lte("due_date", in3daysStr);

    if (fetchErr) throw fetchErr;
    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get existing untreated financial alerts to avoid duplicates
    const { data: existing } = await supabase
      .from("alerts")
      .select("description")
      .eq("type", "financeiro")
      .eq("treated", false);

    const existingDescs = new Set((existing ?? []).map((a: any) => a.description));

    const alertsToInsert = entries
      .filter((e: any) => {
        const desc = `financeiro:${e.id}`;
        return !existingDescs.has(desc);
      })
      .map((e: any) => {
        const dueDate = new Date(e.due_date + "T00:00:00");
        const isOverdue = dueDate < today;
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);

        const severity = isOverdue ? "urgente" : diffDays <= 1 ? "atencao" : "info";
        const statusText = isOverdue
          ? `VENCIDO há ${Math.abs(diffDays)} dia(s)`
          : `vence em ${diffDays} dia(s)`;

        const amount = Number(e.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        return {
          type: "financeiro",
          severity,
          title: `Lançamento financeiro ${statusText}`,
          description: `financeiro:${e.id}`,
          case_id: e.case_id,
          case_number: e.cases?.case_number ?? null,
          employee_name: e.cases?.employee_name ?? null,
          event_date: e.due_date,
        };
      });

    if (alertsToInsert.length === 0) {
      return new Response(JSON.stringify({ created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await supabase
      .from("alerts")
      .insert(alertsToInsert);

    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ created: alertsToInsert.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("financial-alerts error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
