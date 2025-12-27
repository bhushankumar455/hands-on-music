import { useState } from "react";
import { Sliders, Music2, Mic2, Headphones, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

export interface EQPreset {
  name: string;
  icon: React.ElementType;
  bands: number[];
}

const defaultBands: EQBand[] = [
  { frequency: 60, gain: 0, label: "60" },
  { frequency: 170, gain: 0, label: "170" },
  { frequency: 310, gain: 0, label: "310" },
  { frequency: 600, gain: 0, label: "600" },
  { frequency: 1000, gain: 0, label: "1K" },
  { frequency: 3000, gain: 0, label: "3K" },
  { frequency: 6000, gain: 0, label: "6K" },
  { frequency: 12000, gain: 0, label: "12K" },
];

const presets: EQPreset[] = [
  { name: "Flat", icon: RotateCcw, bands: [0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Bass Boost", icon: Headphones, bands: [6, 5, 4, 2, 0, 0, 0, 0] },
  { name: "Treble", icon: Zap, bands: [0, 0, 0, 0, 2, 4, 5, 6] },
  { name: "Vocal", icon: Mic2, bands: [-2, -1, 0, 3, 4, 3, 0, -1] },
  { name: "Electronic", icon: Music2, bands: [4, 3, 0, -2, -1, 2, 4, 5] },
];

interface EqualizerPanelProps {
  bands: EQBand[];
  onBandChange: (index: number, gain: number) => void;
  onPresetChange: (preset: EQPreset) => void;
  activePreset: string | null;
}

export function EqualizerPanel({
  bands,
  onBandChange,
  onPresetChange,
  activePreset,
}: EqualizerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
        >
          <Sliders className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="end" 
        className="w-[320px] sm:w-[360px] p-0 bg-card border-border"
      >
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm mb-3">Equalizer</h3>
          
          {/* Presets */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onPresetChange(preset)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-xs",
                  activePreset === preset.name
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <preset.icon className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs truncate w-full text-center">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* EQ Sliders */}
          <div className="flex items-end justify-between gap-1 h-[140px] sm:h-[160px] bg-secondary/30 rounded-xl p-3">
            {bands.map((band, index) => (
              <div 
                key={band.frequency} 
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div className="h-[80px] sm:h-[100px] flex items-center">
                  <Slider
                    orientation="vertical"
                    value={[band.gain]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={([value]) => onBandChange(index, value)}
                    className="h-full"
                  />
                </div>
                <div className="text-center">
                  <div className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">
                    {band.gain > 0 ? `+${band.gain}` : band.gain}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-foreground/80">
                    {band.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* dB Scale indicator */}
          <div className="flex justify-between text-[9px] text-muted-foreground mt-2 px-1">
            <span>+12dB</span>
            <span>0dB</span>
            <span>-12dB</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { defaultBands, presets };
