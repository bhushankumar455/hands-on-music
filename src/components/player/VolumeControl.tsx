import { Volume2, Volume1, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute 
}: VolumeControlProps) {
  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  return (
    <div className="flex items-center gap-2 group">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className="h-8 w-8 text-muted-foreground hover:text-foreground control-button"
      >
        <VolumeIcon className="h-4 w-4" />
      </Button>
      <div className="w-24 opacity-0 group-hover:opacity-100 transition-opacity">
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          max={100}
          step={1}
          onValueChange={(value) => onVolumeChange(value[0] / 100)}
          className={cn(
            "cursor-pointer",
            "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3",
            "[&_[role=slider]]:bg-foreground",
            "[&_[role=slider]]:border-0",
            "[&_.relative]:h-1",
            "[&_.absolute]:bg-primary",
            "[&_.relative>span:first-child]:bg-muted"
          )}
        />
      </div>
    </div>
  );
}