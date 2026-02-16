import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quais processos têm audiência próxima?",
  "Qual o prazo mais urgente?",
  "Resuma o processo do Carlos Alberto",
  "Quais tarefas estão pendentes?",
];

// Mock responses based on keywords
function getMockResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("audiência") || lower.includes("audiencia")) {
    return "📅 **Próximas audiências:**\n\n1. **Audiência Inicial** – Maria Fernanda Oliveira\n   - 25/02/2026 às 10:00\n   - 2ª Vara do Trabalho do RJ\n   - ⚠️ Checklist pré-audiência com 2 itens pendentes\n\n2. **Audiência de Instrução** – Carlos Alberto Silva\n   - 10/03/2026 às 14:00\n   - 1ª Vara do Trabalho de SP\n\n3. **Audiência de Julgamento** – Ricardo Souza\n   - 15/04/2026 às 09:30\n   - 1ª Vara do Trabalho de Paulo Afonso";
  }

  if (lower.includes("prazo") || lower.includes("urgente") || lower.includes("venc")) {
    return "⏰ **Prazos mais urgentes:**\n\n1. 🔴 **Juntada de documentos** – vence em 20/02/2026\n   - Processo: Maria Fernanda Oliveira\n   - Status: Pendente\n\n2. 🟡 **Entrega de docs ao perito** – vence em 22/02/2026\n   - Processo: Carlos Alberto Silva\n   - Status: Cumprido ✓\n\n3. 🟡 **Manifestação sobre laudo pericial** – vence em 28/02/2026\n   - Processo: Carlos Alberto Silva\n\n4. 🟢 **Resposta à notificação** – vence em 05/03/2026\n   - Processo: Pedro Henrique Costa (⚠️ Sigiloso)";
  }

  if (lower.includes("carlos") || lower.includes("0001234")) {
    return "📋 **Resumo: Carlos Alberto Silva**\n\n- **Nº:** 0001234-56.2024.5.01.0001\n- **Tema:** Horas Extras\n- **Status:** Em Andamento\n- **Empresa:** Revalle Juazeiro\n- **Tribunal:** 1ª Vara do Trabalho de Juazeiro\n- **Responsável:** Ana Jurídico\n- **Advogado:** Dr. Roberto Advogado\n\n**Próximos eventos:**\n- Audiência de Instrução em 10/03/2026\n- Prazo para manifestação em 28/02/2026\n\n**Tarefas pendentes:** 1 (Reunir espelhos de ponto)\n**Provas:** 3 evidências anexadas, checklist de provas 33% concluído";
  }

  if (lower.includes("tarefa") || lower.includes("pendente")) {
    return "📝 **Tarefas pendentes (7 de 10):**\n\n🔴 **Críticas:**\n- Confirmar presença das testemunhas (23/02)\n- Preparar contestação para audiência (24/02)\n- Preparar recurso ordinário (10/03)\n\n🟠 **Altas:**\n- Reunir espelhos de ponto (20/02)\n- Solicitar registros de catraca (22/02)\n- Revisar cálculos de verbas rescisórias (01/03)\n- Coletar depoimento de testemunha (28/02)\n\nDeseja que eu detalhe alguma tarefa específica?";
  }

  if (lower.includes("sigiloso") || lower.includes("sigilo") || lower.includes("restrito")) {
    return "🔒 **Processos Sigilosos:**\n\nExiste **1 processo** com nível **Ultra Restrito**:\n\n- **Pedro Henrique Costa** – Assédio Moral\n- Nº: 0009876-12.2024.5.03.0003\n- Empresa: Revalle Petrolina\n- Status: Novo\n\n⚠️ Este processo só deve ser acessível por usuários autorizados (ACL). Quando o backend estiver ativo, a visibilidade será controlada por RLS.";
  }

  return "Entendi sua pergunta. No momento estou operando em modo de demonstração com dados mock. Quando o Lovable Cloud for ativado, terei acesso completo ao banco de dados para responder com dados em tempo real.\n\nPosso ajudar com:\n- 📅 Audiências próximas\n- ⏰ Prazos urgentes\n- 📋 Resumo de processos\n- 📝 Tarefas pendentes\n- 🔒 Processos sigilosos\n\nO que gostaria de saber?";
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

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getMockResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-[500px] max-h-[80svh] flex-col rounded-t-2xl border bg-card shadow-2xl sm:rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Juria</h3>
          <p className="text-[10px] text-muted-foreground">Assistente jurídica do SIAG</p>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-warning" />
          <span className="text-[10px] font-medium text-muted-foreground">Demo</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Olá! Sou a Juria 👋</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sua assistente jurídica. Pergunte sobre processos, prazos, audiências e tarefas.
              </p>
            </div>
            <div className="grid w-full gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              )}
            >
              <div className="whitespace-pre-wrap text-xs leading-relaxed">
                {msg.content.split("**").map((part, idx) =>
                  idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                )}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte à Juria..."
          className="flex-1 rounded-lg border-0 bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isTyping}
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg"
          disabled={!input.trim() || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
