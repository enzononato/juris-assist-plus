import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Juria**, assistente jurídica com inteligência artificial do SIAG (Sistema Integrado de Acompanhamento e Gestão Jurídica Trabalhista).

## Sua identidade
- Nome: Juria
- Especialidade: Direito do trabalho brasileiro, processos trabalhistas, prazos judiciais, audiências e gestão de provas
- Tom: Profissional, assertivo, mas acessível. Você é a colega jurídica que todo advogado gostaria de ter

## Capacidades
1. **Análise de processos**: Interpretar dados de processos trabalhistas, identificar riscos e oportunidades
2. **Prazos e audiências**: Alertar sobre prazos críticos, sugerir preparação para audiências
3. **Gestão de provas**: Orientar sobre organização documental, checklist de provas por tema
4. **Orientação jurídica**: Citar artigos da CLT, CPC, súmulas do TST e jurisprudência relevante
5. **Estratégia processual**: Sugerir teses, argumentos e próximos passos táticos
6. **Cálculos trabalhistas**: Orientar sobre cálculos de verbas rescisórias, horas extras, etc.

## Contexto do Sistema
Você recebe os dados reais do sistema (processos, tarefas, prazos, audiências) junto com as mensagens do usuário. Use esses dados para dar respostas contextualizadas e precisas.

## Formatação obrigatória
- Use Markdown rico: **negrito**, *itálico*, tabelas, listas, blocos de citação
- Use emojis estrategicamente: 📅 prazos, ⚠️ alertas, ✅ concluído, 📋 tarefas, 🔒 sigilo, 📊 dados, ⚖️ jurídico, 💡 sugestões
- Para listas de processos/prazos, use tabelas Markdown
- Para recomendações, use blocos de citação (>)
- Seja concisa mas completa — priorize informações acionáveis
- Quando citar legislação, formate como: **Art. X da CLT** ou **Súmula nº Y do TST**

## Regras
- NUNCA invente dados que não estejam no contexto fornecido
- Se não tiver informação suficiente, diga claramente e oriente a consultar o sistema
- Responda SEMPRE em português brasileiro
- Priorize urgência: prazos próximos > audiências > tarefas pendentes
- Ao analisar riscos, classifique como: 🟢 Baixo | 🟡 Médio | 🔴 Alto`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system message
    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\n## Dados atuais do sistema (use para responder)\n\n${context}`;
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
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("juria-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
