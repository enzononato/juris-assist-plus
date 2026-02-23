import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Bot, User, Sparkles, Copy, Check, RotateCcw, Scale, Zap, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";
import { buildJuriaContext, buildDynamicSuggestions, buildWelcomeMessage } from "@/lib/buildJuriaContext";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/contexts/AuthContext";
import { mockCases } from "@/data/mock";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string for serialization
}

const STORAGE_KEY_PREFIX = "juria_chat_";
const MAX_STORED_MESSAGES = 50;

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function loadMessages(userId: string): Message[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return parsed.slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

function saveMessages(userId: string, messages: Message[]) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {}
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/juria-chat`;

async function streamChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  context: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!resp.ok) {
    let errorMsg = "Erro ao conectar com a Juria";
    try {
      const data = await resp.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    onError(errorMsg);
    return;
  }

  if (!resp.body) {
    onError("Sem resposta da IA");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush remaining
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}

// Regex for Brazilian case numbers: XXXXXXX-XX.XXXX.X.XX.XXXX
const CASE_NUMBER_REGEX = /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/g;

function AssistantMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find case IDs for clickable links
  const caseNumberToId = useMemo(() => {
    const map = new Map<string, string>();
    mockCases.forEach((c) => map.set(c.case_number, c.id));
    return map;
  }, []);

  // Process content to make case numbers clickable
  const processedContent = useMemo(() => {
    return content.replace(CASE_NUMBER_REGEX, (match) => {
      const id = caseNumberToId.get(match);
      if (id) return `[${match}](/processos/${id})`;
      return match;
    });
  }, [content, caseNumberToId]);

  return (
    <div className="group flex gap-2.5 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-sm">
        <Scale className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
      <div className="max-w-[88%] space-y-1">
        <div className="rounded-2xl rounded-tl-md bg-card border border-border/60 px-3.5 py-2.5 shadow-sm">
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
            prose-a:text-primary prose-a:underline prose-a:cursor-pointer
          ">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith("/")) {
                    return (
                      <button
                        onClick={() => navigate(href)}
                        className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
                      >
                        {children}
                      </button>
                    );
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary/60 animate-pulse">Escrevendo...</span>
            </div>
          )}
        </div>
        {!isStreaming && content.length > 20 && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  pathname: string;
}

export default function JuriaChatPanel({ onClose, pathname }: Props) {
  const { user } = useAuth();
  const { cases, tasks, hearings, deadlines } = useTenantData();
  const userId = user?.id ?? "anonymous";

  // Load persisted messages
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(userId));
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages on change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(userId, messages);
    }
  }, [messages, userId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-focus textarea
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Dynamic suggestions
  const suggestions = useMemo(
    () => buildDynamicSuggestions(cases, tasks, hearings, deadlines, pathname),
    [cases, tasks, hearings, deadlines, pathname],
  );

  // Welcome message (shown when no history)
  const welcomeMessage = useMemo(
    () => buildWelcomeMessage(cases, tasks, hearings, deadlines),
    [cases, tasks, hearings, deadlines],
  );

  // Context stats for badge
  const contextStats = useMemo(
    () => ({ cases: cases.length, tasks: tasks.length }),
    [cases, tasks],
  );

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const context = buildJuriaContext(cases);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar, timestamp: new Date().toISOString() }];
      });
    };

    streamChat({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      context,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsStreaming(false),
      onError: (msg) => {
        toast({ title: "Erro na Juria", description: msg, variant: "destructive" });
        setIsStreaming(false);
      },
    });
  }, [isStreaming, messages, cases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(getStorageKey(userId));
    } catch {}
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-[540px] max-h-[80svh] flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-card to-card/80 px-4 py-3">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-md ring-2 ring-primary/20">
            <Scale className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold">Juria</h3>
            <div className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5">
              <Zap className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold text-primary">PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] text-muted-foreground">Assistente jurídica trabalhista</p>
            <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-medium text-muted-foreground border-border/60 gap-0.5">
              <Database className="h-2.5 w-2.5" />
              {contextStats.cases}p · {contextStats.tasks}t
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={clearChat} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Nova conversa">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5">
            <Sparkles className="h-3 w-3 text-success" />
            <span className="text-[10px] font-semibold text-success">IA</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {showWelcome && (
          <div className="flex flex-col items-center gap-5 pt-4 text-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 shadow-lg shadow-primary/5">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/20">
                <Sparkles className="h-3.5 w-3.5 text-success" />
              </div>
            </div>
            {/* Contextual welcome message */}
            <div className="max-w-[320px]">
              <div className="prose prose-sm text-xs text-muted-foreground leading-relaxed text-center prose-strong:text-foreground">
                <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-start gap-2 rounded-xl border bg-card px-3 py-2.5 text-left text-[11px] text-foreground transition-all hover:bg-accent/50 hover:border-primary/20 hover:shadow-sm active:scale-[0.98] duration-150"
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
            <div key={i} className="flex gap-2.5 justify-end animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-xs text-primary-foreground shadow-sm whitespace-pre-wrap">
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
              isStreaming={isStreaming && i === messages.length - 1}
            />
          )
        )}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-sm">
              <Scale className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-card border px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">Analisando dados...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions after conversation */}
      {messages.length > 0 && !isStreaming && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-1.5 border-t bg-muted/20 scrollbar-hide">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s.text}
              onClick={() => sendMessage(s.text)}
              className="shrink-0 rounded-full border bg-card px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-150 whitespace-nowrap hover:shadow-sm"
            >
              {s.icon} {s.text.length > 30 ? s.text.slice(0, 30) + "…" : s.text}
            </button>
          ))}
        </div>
      )}

      {/* Input — expandable textarea */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t bg-card px-3 py-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte à Juria..."
          rows={1}
          className="flex-1 resize-none rounded-xl border-0 bg-muted px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 transition-shadow duration-200 max-h-[120px]"
          disabled={isStreaming}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl shadow-sm transition-transform active:scale-95"
          disabled={!input.trim() || isStreaming}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
