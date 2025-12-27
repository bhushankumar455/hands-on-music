import { useState } from "react";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 w-9 rounded-full",
          speed !== 1 && "text-primary"
        )}
      >
        <span className="text-xs font-bold">{speed}x</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-card rounded-xl p-3 shadow-xl min-w-[100px] animate-fade-in">
          <p className="text-xs text-muted-foreground mb-2">Speed</p>
          <div className="space-y-1">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSpeedChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-center text-sm py-1.5 px-2 rounded-lg transition-colors",
                  speed === option
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
