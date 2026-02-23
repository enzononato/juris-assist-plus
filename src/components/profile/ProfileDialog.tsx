import { useState, useRef, useEffect } from "react";
import { Camera, User, Mail, Shield, Building2, Trash2, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth, roleLabels } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const AVATAR_STORAGE_KEY = "siag_user_avatars";
const PROFILE_OVERRIDES_KEY = "siag_profile_overrides";

// ─── Avatar helpers ───────────────────────────────────────────────────────────
function getStoredAvatars(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || "{}"); } catch { return {}; }
}

export function getUserAvatar(userId: string): string | null {
  return getStoredAvatars()[userId] || null;
}

function setUserAvatar(userId: string, dataUrl: string) {
  const avatars = getStoredAvatars();
  avatars[userId] = dataUrl;
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
}

function removeUserAvatar(userId: string) {
  const avatars = getStoredAvatars();
  delete avatars[userId];
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
}

// ─── Profile override helpers ─────────────────────────────────────────────────
interface ProfileOverride {
  name?: string;
  email?: string;
}

function getProfileOverrides(): Record<string, ProfileOverride> {
  try { return JSON.parse(localStorage.getItem(PROFILE_OVERRIDES_KEY) || "{}"); } catch { return {}; }
}

export function getProfileOverride(userId: string): ProfileOverride | null {
  return getProfileOverrides()[userId] || null;
}

function saveProfileOverride(userId: string, override: ProfileOverride) {
  const all = getProfileOverrides();
  all[userId] = { ...all[userId], ...override };
  localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(all));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Editable field ───────────────────────────────────────────────────────────
function EditableField({
  icon: Icon,
  label,
  value,
  onSave,
  type = "text",
  maxLength = 100,
  editable = true,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onSave: (val: string) => void;
  type?: string;
  maxLength?: number;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const validate = (v: string): string | null => {
    const trimmed = v.trim();
    if (!trimmed) return "Campo obrigatório";
    if (trimmed.length > maxLength) return `Máximo de ${maxLength} caracteres`;
    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "E-mail inválido";
    return null;
  };

  const handleSave = () => {
    const err = validate(draft);
    if (err) { setError(err); return; }
    onSave(draft.trim());
    setEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
    setError("");
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 group">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
        {editing ? (
          <div className="space-y-1">
            <Input
              ref={inputRef}
              type={type}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              className="h-8 text-sm font-semibold px-2 rounded-lg"
              maxLength={maxLength}
            />
            {error && <p className="text-[10px] text-destructive font-medium">{error}</p>}
          </div>
        ) : (
          <p className="text-sm font-semibold truncate">{value}</p>
        )}
      </div>
      {editable && (
        editing ? (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-success hover:text-success" onClick={handleSave}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground" onClick={handleCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )
      )}
    </div>
  );
}

// ─── Profile Dialog ───────────────────────────────────────────────────────────
export default function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) setAvatarUrl(getUserAvatar(user.id));
  }, [user, open]);

  if (!user) return null;

  const initials = getInitials(user.name);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem (JPG, PNG, etc.)", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo de 2MB permitido.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUrl(dataUrl);
      setUserAvatar(user.id, dataUrl);
      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi salva." });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    removeUserAvatar(user.id);
    setAvatarUrl(null);
    toast({ title: "Foto removida", description: "Sua foto de perfil foi removida." });
  };

  const handleSaveName = (name: string) => {
    saveProfileOverride(user.id, { name });
    updateUserProfile({ name });
    toast({ title: "Nome atualizado!", description: `Seu nome foi alterado para "${name}".` });
  };

  const handleSaveEmail = (email: string) => {
    saveProfileOverride(user.id, { email });
    updateUserProfile({ email });
    toast({ title: "E-mail atualizado!", description: `Seu e-mail foi alterado para "${email}".` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Meu Perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Avatar */}
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-card" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold text-primary-foreground shadow-card" style={{ background: "var(--gradient-primary)" }}>
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Photo actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" />
              {avatarUrl ? "Trocar foto" : "Adicionar foto"}
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs rounded-xl text-destructive hover:text-destructive" onClick={handleRemovePhoto}>
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>
            )}
          </div>

          {/* Editable fields */}
          <div className="w-full space-y-3 mt-2">
            <EditableField icon={User} label="Nome" value={user.name} onSave={handleSaveName} maxLength={60} />
            <EditableField icon={Mail} label="Email" value={user.email} onSave={handleSaveEmail} type="email" maxLength={255} />
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium">Papel</p>
                <Badge variant="outline" className="text-[10px] mt-0.5">{roleLabels[user.role]}</Badge>
              </div>
            </div>
            {user.company_id !== "all" && (
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium">Empresa</p>
                  <p className="text-sm font-semibold truncate">{user.company_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
