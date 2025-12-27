import { useState, useEffect } from "react";
import { Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SleepTimerProps {
  onTimerEnd: () => void;
  isPlaying: boolean;
}

const TIMER_OPTIONS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
];

export function SleepTimer({ onTimerEnd, isPlaying }: SleepTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (remainingSeconds === null || !isPlaying) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          onTimerEnd();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, isPlaying, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = (minutes: number) => {
    setRemainingSeconds(minutes * 60);
    setIsOpen(false);
  };

  const cancelTimer = () => {
    setRemainingSeconds(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 w-9 rounded-full",
          remainingSeconds !== null && "text-primary"
        )}
      >
        <Moon className="h-4 w-4" />
      </Button>

      {remainingSeconds !== null && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1 rounded-full">
          {formatTime(remainingSeconds)}
        </span>
      )}

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-card rounded-xl p-3 shadow-xl min-w-[140px] animate-fade-in">
          <p className="text-xs text-muted-foreground mb-2">Sleep Timer</p>
          <div className="space-y-1">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => startTimer(option.minutes)}
                className="w-full text-left text-sm py-1.5 px-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {option.label}
              </button>
            ))}
            {remainingSeconds !== null && (
              <button
                onClick={cancelTimer}
                className="w-full text-left text-sm py-1.5 px-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
