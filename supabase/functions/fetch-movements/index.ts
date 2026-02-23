import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// DataJud public API key (published by CNJ)
const DATAJUD_API_KEY =
  "APIKey cDZHYzlZa0JadVREZDR4cUY2TjdiSmo4ZkRlK0pGa1VrPUJic3VydURpNjNEZVVBPQ==";

// Map court names to DataJud endpoint aliases
function getCourtAlias(court: string | null): string[] {
  if (!court) return ["api_publica_tst"];
  const lower = court.toLowerCase();
  // TRT aliases
  const trtMatch = lower.match(/trt[-\s]*(\d{1,2})/);
  if (trtMatch) return [`api_publica_trt${trtMatch[1]}`];
  if (lower.includes("tst")) return ["api_publica_tst"];
  // Default: try TST and TRT-2 (SP)
  return ["api_publica_tst", "api_publica_trt2"];
}

interface DataJudHit {
  _source: {
    numeroProcesso: string;
    movimentos?: Array<{
      codigo?: number;
      nome?: string;
      dataHora?: string;
      complementosTabelados?: Array<{ nome?: string; valor?: string; descricao?: string }>;
    }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Accept optional case_id to sync a single case, or sync all
    const body = req.method === "POST" ? await req.json() : {};
    const singleCaseId = body.case_id as string | undefined;

    // Fetch cases to sync
    let query = supabase
      .from("cases")
      .select("id, case_number, court")
      .neq("status", "encerrado");

    if (singleCaseId) {
      query = query.eq("id", singleCaseId);
    }

    const { data: cases, error: casesError } = await query.limit(50);
    if (casesError) throw casesError;
    if (!cases || cases.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No cases to sync" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalNew = 0;
    const results: Array<{ case_id: string; case_number: string; new_movements: number; error?: string }> = [];

    for (const c of cases) {
      try {
        const aliases = getCourtAlias(c.court);
        let hits: DataJudHit[] = [];

        // Remove formatting from case number (keep only digits and dots as CNJ format)
        const cleanNumber = c.case_number.replace(/[^\\d.-]/g, "");

        for (const alias of aliases) {
          const url = `https://api-publica.datajud.cnj.jus.br/${alias}/_search`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: DATAJUD_API_KEY,
            },
            body: JSON.stringify({
              query: { match: { numeroProcesso: cleanNumber } },
              size: 1,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.hits?.hits?.length > 0) {
              hits = data.hits.hits;
              break;
            }
          }
        }

        if (hits.length === 0) {
          results.push({ case_id: c.id, case_number: c.case_number, new_movements: 0 });
          continue;
        }

        const movements = hits[0]._source.movimentos ?? [];
        let newCount = 0;

        for (const mov of movements) {
          if (!mov.nome || !mov.dataHora) continue;

          const externalId = `${mov.codigo ?? "m"}_${mov.dataHora}`;
          const complementos = (mov.complementosTabelados ?? [])
            .map((c) => c.descricao || c.valor || c.nome)
            .filter(Boolean)
            .join("; ");

          const { error: insertError } = await supabase.from("case_movements").insert({
            case_id: c.id,
            movement_date: mov.dataHora,
            title: mov.nome,
            description: complementos || null,
            source: "datajud",
            external_id: externalId,
            court: c.court,
          });

          // Ignore unique constraint violations (already exists)
          if (!insertError) newCount++;
        }

        // Update sync log
        await supabase.from("case_sync_log").upsert(
          {
            case_id: c.id,
            last_synced_at: new Date().toISOString(),
            last_status: "ok",
            movements_count: movements.length,
          },
          { onConflict: "case_id" }
        );

        // If new movements found, create alerts
        if (newCount > 0) {
          await supabase.from("alerts").insert({
            type: "publicacao",
            severity: "info",
            title: `${newCount} novo(s) andamento(s) no processo ${c.case_number}`,
            description: `Foram encontrados ${newCount} novos andamentos no DataJud para o processo ${c.case_number}.`,
            case_id: c.id,
            case_number: c.case_number,
            event_date: new Date().toISOString(),
          });

          // Also add to timeline
          await supabase.from("timeline_events").insert({
            case_id: c.id,
            type: "comentario",
            title: `${newCount} andamento(s) capturado(s) do DataJud`,
            description: `Sincronização automática detectou ${newCount} novos andamentos processuais.`,
            user_name: "Sistema (DataJud)",
          });
        }

        totalNew += newCount;
        results.push({ case_id: c.id, case_number: c.case_number, new_movements: newCount });
      } catch (err) {
        results.push({
          case_id: c.id,
          case_number: c.case_number,
          new_movements: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({ synced: cases.length, total_new_movements: totalNew, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fetch-movements error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
