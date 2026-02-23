import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import JuriaChatPanel from "./JuriaChatPanel";

export default function JuriaChatButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-20 sm:right-4 sm:w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <JuriaChatPanel onClose={() => setOpen(false)} pathname={location.pathname} />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95",
          "bottom-[76px] right-4 sm:bottom-6 sm:right-6",
          open && "rotate-90"
        )}
        aria-label={open ? "Fechar Juria" : "Abrir Juria"}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </>
  );
}
