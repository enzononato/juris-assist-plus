import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Juria**, assistente jurídica especializada em gerar documentos jurídicos trabalhistas de alta qualidade.

## Regras de geração
- Gere documentos completos, prontos para uso, em português jurídico formal
- Use formatação Markdown: títulos, parágrafos, listas numeradas, negrito para termos-chave
- Inclua todos os elementos obrigatórios do tipo de documento solicitado
- Preencha com os dados do processo fornecidos no contexto
- Onde faltar informação, use placeholders claros como [NOME DO JUIZ], [DATA DA AUDIÊNCIA], etc.
- Cite artigos da CLT, CPC e súmulas do TST quando relevante
- Adapte o tom e estrutura ao tipo de documento (petição = formal, notificação = direto, contrato = técnico)

## Tipos de documento que você gera
- Petições iniciais, contestações, réplicas, recursos
- Notificações extrajudiciais
- Contratos de honorários
- Procurações
- Manifestações e pareceres
- Atas e relatórios`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, caseContext, templateContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let userMessage = prompt;
    if (templateContent) {
      userMessage += `\n\n## Template base para referência:\n${templateContent}`;
    }
    if (caseContext) {
      userMessage += `\n\n## Dados do processo:\n${caseContext}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar documento" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
