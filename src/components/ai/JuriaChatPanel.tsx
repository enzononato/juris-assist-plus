import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { icon: "📅", text: "Quais processos têm audiência próxima?" },
  { icon: "⏰", text: "Qual o prazo mais urgente?" },
  { icon: "📋", text: "Resuma o processo do Carlos Alberto" },
  { icon: "📝", text: "Quais tarefas estão pendentes?" },
  { icon: "🔒", text: "Existem processos sigilosos?" },
  { icon: "📊", text: "Me dê uma visão geral do escritório" },
];

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("audiência") || lower.includes("audiencia")) {
    return `## 📅 Próximas Audiências

| # | Tipo | Reclamante | Data | Local |
|---|------|-----------|------|-------|
| 1 | Audiência Inicial | Maria Fernanda Oliveira | 25/02/2026 às 10:00 | 2ª Vara do Trabalho – RJ |
| 2 | Audiência de Instrução | Carlos Alberto Silva | 10/03/2026 às 14:00 | 1ª Vara do Trabalho – SP |
| 3 | Audiência de Julgamento | Ricardo Souza | 15/04/2026 às 09:30 | 1ª Vara – Paulo Afonso |

> ⚠️ A audiência de **Maria Fernanda** tem **2 itens pendentes** no checklist pré-audiência. Recomendo revisar antes.

Deseja que eu prepare um resumo completo de algum desses processos?`;
  }

  if (lower.includes("prazo") || lower.includes("urgente") || lower.includes("venc")) {
    return `## ⏰ Prazos Mais Urgentes

### 🔴 Crítico
- **Juntada de documentos** — vence em **20/02/2026**
  - Processo: Maria Fernanda Oliveira
  - Status: \`Pendente\`

### 🟡 Atenção
- **Entrega de docs ao perito** — vence em **22/02/2026**
  - Processo: Carlos Alberto Silva — ✅ Cumprido
- **Manifestação sobre laudo pericial** — vence em **28/02/2026**
  - Processo: Carlos Alberto Silva

### 🟢 Confortável
- **Resposta à notificação** — vence em **05/03/2026**
  - Processo: Pedro Henrique Costa *(⚠️ Sigiloso)*

> 💡 **Dica:** O prazo de juntada vence em **3 dias**. Sugiro priorizar.`;
  }

  if (lower.includes("carlos") || lower.includes("0001234")) {
    return `## 📋 Processo: Carlos Alberto Silva

| Campo | Detalhe |
|-------|---------|
| Nº | \`0001234-56.2024.5.01.0001\` |
| Tema | Horas Extras |
| Status | 🟢 Em Andamento |
| Empresa | Revalle Juazeiro |
| Tribunal | 1ª Vara do Trabalho de Juazeiro |
| Responsável | Thiago |
| Advogada | Sullydaiane |

### Próximos Eventos
- 📅 **Audiência de Instrução** em 10/03/2026
- ⏰ **Manifestação sobre laudo** até 28/02/2026

### Status das Provas
- **3** evidências anexadas
- Checklist de provas: **33%** concluído
- **1** tarefa pendente: *Reunir espelhos de ponto*

> 📌 Recomendo completar as provas antes da audiência de instrução.`;
  }

  if (lower.includes("tarefa") || lower.includes("pendente")) {
    return `## 📝 Tarefas Pendentes (7 de 10)

### 🔴 Prioridade Crítica
1. **Confirmar presença das testemunhas** — 23/02
2. **Preparar contestação para audiência** — 24/02
3. **Preparar recurso ordinário** — 10/03

### 🟠 Prioridade Alta
4. **Reunir espelhos de ponto** — 20/02
5. **Solicitar registros de catraca** — 22/02
6. **Revisar cálculos de verbas rescisórias** — 01/03
7. **Coletar depoimento de testemunha** — 28/02

---

**Resumo:** 3 críticas, 4 altas. A mais urgente vence em **3 dias**.

Deseja que eu detalhe alguma tarefa específica?`;
  }

  if (lower.includes("sigiloso") || lower.includes("sigilo") || lower.includes("restrito")) {
    return `## 🔒 Processos Sigilosos

Existe **1 processo** com nível **Ultra Restrito**:

| Campo | Detalhe |
|-------|---------|
| Reclamante | Pedro Henrique Costa |
| Tema | Assédio Moral |
| Nº | \`0009876-12.2024.5.03.0003\` |
| Empresa | Revalle Petrolina |
| Status | 🆕 Novo |

> ⚠️ Este processo só deve ser acessível por usuários autorizados. Quando o backend estiver ativo, a visibilidade será controlada por RLS + ACL.`;
  }

  if (lower.includes("visão geral") || lower.includes("escritório") || lower.includes("dashboard") || lower.includes("resumo geral")) {
    return `## 📊 Visão Geral do Escritório

| Métrica | Valor |
|---------|-------|
| Processos ativos | **4** |
| Audiências próximas | **3** |
| Prazos pendentes | **4** |
| Tarefas pendentes | **7** |
| Evidências totais | **5** |

### Distribuição por Status
- 🆕 Novos: **1** (Pedro Henrique)
- 🟢 Em Andamento: **2** (Carlos Alberto, Ricardo)
- 🟡 Aguardando Documentos: **1** (Maria Fernanda)

### ⚡ Ações Recomendadas
1. Resolver juntada de documentos (vence em 3 dias)
2. Completar checklist pré-audiência de Maria Fernanda
3. Reunir provas pendentes do processo Carlos Alberto

Posso detalhar qualquer item acima!`;
  }

  if (lower.includes("obrigad") || lower.includes("valeu") || lower.includes("thanks")) {
    return "De nada! 😊 Estou aqui sempre que precisar. Posso ajudar com mais alguma coisa?";
  }

  return `Entendi sua pergunta! No momento estou em **modo demonstração** com dados mock.

Posso ajudar com:
- 📅 **Audiências** próximas
- ⏰ **Prazos** urgentes
- 📋 **Resumo** de processos
- 📝 **Tarefas** pendentes
- 🔒 Processos **sigilosos**
- 📊 **Visão geral** do escritório

> 💡 Quando o Lovable Cloud for ativado, terei acesso ao banco de dados em tempo real.

O que gostaria de saber?`;
}

// Simulate typing with progressive reveal
function useTypingEffect(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 2; // 2 chars at a time for speed
      if (i >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function AssistantMessage({ content, isLatest }: { content: string; isLatest: boolean }) {
  const { displayed, done } = useTypingEffect(content, isLatest ? 8 : 0);
  const [copied, setCopied] = useState(false);
  const text = isLatest && !done ? displayed : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex gap-2.5 justify-start animate-in fade-in duration-200">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="max-w-[88%] space-y-1">
        <div className="rounded-2xl rounded-tl-md bg-card border px-3.5 py-2.5 shadow-sm">
          <div className="prose prose-sm max-w-none text-xs leading-relaxed text-foreground
            prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
            prose-h2:text-sm prose-h3:text-xs
            prose-p:my-1 prose-p:text-xs
            prose-table:text-[11px] prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
            prose-th:bg-muted/50 prose-th:font-semibold prose-th:text-left
            prose-table:border prose-table:rounded-lg prose-table:overflow-hidden
            prose-tr:border-b prose-tr:border-border/50
            prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:rounded-lg prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:text-xs
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
            prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1
            prose-hr:border-border/50 prose-hr:my-2
          ">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          {isLatest && !done && (
            <span className="inline-block h-4 w-0.5 bg-primary animate-pulse ml-0.5" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export default function JuriaChatPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-[520px] max-h-[80svh] flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-md">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">Juria</h3>
          <p className="text-[10px] text-muted-foreground">Assistente jurídica • Online</p>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={clearChat} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Limpar chat">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5">
            <Sparkles className="h-3 w-3 text-warning" />
            <span className="text-[10px] font-semibold text-warning">Demo</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-5 pt-6 text-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                <Sparkles className="h-3.5 w-3.5 text-warning" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold">Olá! Sou a Juria 👋</p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                Sua assistente jurídica inteligente. Pergunte sobre processos, prazos, audiências e tarefas.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-start gap-2 rounded-xl border bg-card px-3 py-2.5 text-left text-[11px] text-foreground transition-all hover:bg-accent/50 hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
                >
                  <span className="text-sm mt-px">{s.icon}</span>
                  <span className="leading-tight">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex gap-2.5 justify-end animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-xs text-primary-foreground shadow-sm">
                {msg.content}
              </div>
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <AssistantMessage
              key={i}
              content={msg.content}
              isLatest={i === messages.length - 1}
            />
          )
        )}

        {isTyping && (
          <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-card border px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions after conversation */}
      {messages.length > 0 && !isTyping && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-1.5 border-t bg-muted/30 scrollbar-hide">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s.text}
              onClick={() => sendMessage(s.text)}
              className="shrink-0 rounded-full border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors whitespace-nowrap"
            >
              {s.icon} {s.text.slice(0, 30)}…
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t bg-card px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte à Juria..."
          className="flex-1 rounded-xl border-0 bg-muted px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 transition-shadow"
          disabled={isTyping}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl shadow-sm"
          disabled={!input.trim() || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
