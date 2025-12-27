import { useState } from "react";
import { Blend } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CrossfadeControlProps {
  duration: number;
  enabled: boolean;
  onDurationChange: (duration: number) => void;
  onToggle: () => void;
}

const presetDurations = [0, 2, 4, 6, 8, 12];

export function CrossfadeControl({
  duration,
  enabled,
  onDurationChange,
  onToggle,
}: CrossfadeControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9",
            enabled
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Blend className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-64 p-3 bg-card border-border"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Crossfade</h3>
            <Button
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={onToggle}
              className="h-7 text-xs"
            >
              {enabled ? "On" : "Off"}
            </Button>
          </div>

          <div className={cn(!enabled && "opacity-50 pointer-events-none")}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Duration</span>
              <span className="text-xs font-medium">{duration}s</span>
            </div>

            <Slider
              value={[duration]}
              min={1}
              max={12}
              step={1}
              onValueChange={([value]) => onDurationChange(value)}
              className="mb-3"
            />

            <div className="flex gap-1.5 flex-wrap">
              {presetDurations.filter(d => d > 0).map((preset) => (
                <button
                  key={preset}
                  onClick={() => onDurationChange(preset)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    duration === preset
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  )}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Smoothly blend between tracks by fading out the current song while fading in the next.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
