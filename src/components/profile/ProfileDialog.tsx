import { useState, useRef, useEffect } from "react";
import { Camera, X, User, Mail, Shield, Building2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, roleLabels } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const AVATAR_STORAGE_KEY = "siag_user_avatars";

function getStoredAvatars(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setAvatarUrl(getUserAvatar(user.id));
    }
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

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    removeUserAvatar(user.id);
    setAvatarUrl(null);
    toast({ title: "Foto removida", description: "Sua foto de perfil foi removida." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Meu Perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-card"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold text-primary-foreground shadow-card"
                style={{ background: "var(--gradient-primary)" }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              {avatarUrl ? "Trocar foto" : "Adicionar foto"}
            </Button>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs rounded-xl text-destructive hover:text-destructive"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>
            )}
          </div>

          {/* User info */}
          <div className="w-full space-y-3 mt-2">
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium">Nome</p>
                <p className="text-sm font-semibold truncate">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium">Email</p>
                <p className="text-sm font-semibold truncate">{user.email}</p>
              </div>
            </div>
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
