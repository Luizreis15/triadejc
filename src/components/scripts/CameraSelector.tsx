import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CameraDevice } from "./useCameraRecorder";

interface CameraSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameras: CameraDevice[];
  selectedCamera: string;
  onSelectCamera: (deviceId: string) => void;
  isDarkMode?: boolean;
}

export function CameraSelector({
  open,
  onOpenChange,
  cameras,
  selectedCamera,
  onSelectCamera,
  isDarkMode = true,
}: CameraSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isDarkMode ? "bg-zinc-900 text-white border-zinc-700" : "bg-white text-black"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Selecionar Câmera
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 mt-4">
          {cameras.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma câmera encontrada
            </p>
          ) : (
            cameras.map((camera) => (
              <Button
                key={camera.deviceId}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-3 px-4",
                  isDarkMode 
                    ? "hover:bg-white/10" 
                    : "hover:bg-black/5",
                  selectedCamera === camera.deviceId && (
                    isDarkMode 
                      ? "bg-white/10" 
                      : "bg-black/5"
                  )
                )}
                onClick={() => {
                  onSelectCamera(camera.deviceId);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-left truncate">
                    {camera.label}
                  </span>
                  {selectedCamera === camera.deviceId && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
