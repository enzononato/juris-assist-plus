import { useState, useRef, useCallback } from "react";
import { Camera, X, RotateCcw, Download, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture?: (dataUrl: string, fileName: string) => void;
  triggerLabel?: string;
  className?: string;
}

export default function CameraCapture({ onCapture, triggerLabel = "Capturar Documento", className }: CameraCaptureProps) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      // Stop existing stream
      if (stream) stream.getTracks().forEach((t) => t.stop());

      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        videoRef.current.play();
      }
      setFacingMode(facing);
    } catch {
      toast({ title: "Câmera indisponível", description: "Permita o acesso à câmera nas configurações do navegador.", variant: "destructive" });
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setPhoto(null);
      setTimeout(() => startCamera(facingMode), 300);
    } else {
      stopCamera();
      setPhoto(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    stopCamera();
  };

  const retake = () => {
    setPhoto(null);
    startCamera(facingMode);
  };

  const confirm = () => {
    if (!photo) return;
    const fileName = `doc_${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;
    onCapture?.(photo, fileName);
    toast({ title: "📸 Foto capturada", description: fileName });
    setOpen(false);
    setPhoto(null);
  };

  const download = () => {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = `doc_${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;
    a.click();
  };

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    startCamera(next);
  };

  const isSupported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  if (!isSupported) {
    return (
      <Button variant="outline" disabled className={cn("gap-2 text-xs", className)}>
        <Camera className="h-4 w-4" />
        Câmera não disponível
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2 text-xs", className)}>
          <Camera className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Capturar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] bg-black overflow-hidden rounded-b-lg">
          {!photo ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {/* Overlay guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white/30 rounded-xl" />
                <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-[10px] font-medium">
                  Posicione o documento dentro da moldura
                </div>
              </div>
              {/* Controls */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30" onClick={flipCamera}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <button className="h-16 w-16 rounded-full border-4 border-white bg-white/20 transition-all hover:bg-white/40 active:scale-90" onClick={takePhoto} />
                <div className="h-10 w-10" /> {/* spacer */}
              </div>
            </>
          ) : (
            <>
              <img src={photo} alt="Captured" className="h-full w-full object-cover" />
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
                <Button size="sm" variant="secondary" className="gap-1.5 rounded-xl" onClick={retake}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Refazer
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5 rounded-xl" onClick={download}>
                  <Download className="h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button size="sm" className="gap-1.5 rounded-xl" style={{ background: "var(--gradient-primary)" }} onClick={confirm}>
                  <Check className="h-3.5 w-3.5" />
                  Usar foto
                </Button>
              </div>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
