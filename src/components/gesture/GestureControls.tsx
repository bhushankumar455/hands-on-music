import { useState, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";

// Re-export for convenience
export type { GestureType } from "@/hooks/useHandTracking";

interface GestureControlsProps {
  onGesture: (gesture: GestureType) => void;
  isPlaying: boolean;
  isLiked: boolean;
  isMuted: boolean;
}

type SimulatedGesture = "swipe-left" | "swipe-right" | "tap" | "swipe-up" | "swipe-down" | "double-tap" | "pinch" | "pointing" | "open-palm";

interface GestureButton {
  gesture: SimulatedGesture;
  icon: React.ReactNode;
  label: string;
  position: string;
  description: string;
}

export function GestureControls({ 
  onGesture, 
  isPlaying, 
  isLiked,
  isMuted 
}: GestureControlsProps) {
  const [activeGesture, setActiveGesture] = useState<SimulatedGesture | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleGesture = useCallback((gesture: SimulatedGesture, event?: React.MouseEvent) => {
    setActiveGesture(gesture);
    
    // Add ripple effect
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Date.now();
      setRipples(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
    
    onGesture(gesture);
    
    setTimeout(() => setActiveGesture(null), 300);
  }, [onGesture]);

  const gestureButtons: GestureButton[] = [
    {
      gesture: "swipe-left",
      icon: <ChevronLeft className="h-8 w-8" />,
      label: "Previous",
      position: "left-4 top-1/2 -translate-y-1/2",
      description: "Swipe Left",
    },
    {
      gesture: "swipe-right",
      icon: <ChevronRight className="h-8 w-8" />,
      label: "Next",
      position: "right-4 top-1/2 -translate-y-1/2",
      description: "Swipe Right",
    },
    {
      gesture: "swipe-up",
      icon: <ChevronUp className="h-8 w-8" />,
      label: "Vol +",
      position: "top-4 left-1/2 -translate-x-1/2",
      description: "Swipe Up",
    },
    {
      gesture: "swipe-down",
      icon: <ChevronDown className="h-8 w-8" />,
      label: "Vol -",
      position: "bottom-20 left-1/2 -translate-x-1/2",
      description: "Swipe Down",
    },
  ];

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gradient">Gesture Controls</h3>
        <p className="text-sm text-muted-foreground">
          Tap or click the zones to control playback
        </p>
      </div>

      {/* Gesture Zone */}
      <div className="flex-1 relative gesture-zone m-4 rounded-2xl min-h-[300px]">
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute w-16 h-16 rounded-full bg-primary/30 animate-gesture-ripple pointer-events-none"
            style={{
              left: ripple.x - 32,
              top: ripple.y - 32,
            }}
          />
        ))}

        {/* Center area - Play and Pause buttons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
          {/* Play button - Two Fingers */}
          <button
            onClick={(e) => handleGesture("pointing", e)}
            className={cn(
              "w-20 h-20 rounded-full",
              "bg-primary/10 hover:bg-primary/20",
              "border-2 border-primary/30 hover:border-primary/50",
              "flex flex-col items-center justify-center gap-1",
              "transition-all duration-200",
              activeGesture === "pointing" && "scale-90 bg-primary/30 gesture-glow"
            )}
          >
            <Play className="h-8 w-8 text-primary ml-1" />
            <span className="text-[10px] text-muted-foreground">Play ✌️</span>
          </button>

          {/* Pause button - Closed Fist */}
          <button
            onClick={(e) => handleGesture("tap", e)}
            className={cn(
              "w-20 h-20 rounded-full",
              "bg-primary/10 hover:bg-primary/20",
              "border-2 border-primary/30 hover:border-primary/50",
              "flex flex-col items-center justify-center gap-1",
              "transition-all duration-200",
              activeGesture === "tap" && "scale-90 bg-primary/30 gesture-glow"
            )}
          >
            <Pause className="h-8 w-8 text-primary" />
            <span className="text-[10px] text-muted-foreground">Pause ✊</span>
          </button>
        </div>

        {/* Directional gesture buttons */}
        {gestureButtons.map((btn) => (
          <button
            key={btn.gesture}
            onClick={(e) => handleGesture(btn.gesture, e)}
            className={cn(
              "absolute p-4 rounded-xl",
              "bg-secondary/50 hover:bg-secondary",
              "border border-border/50 hover:border-primary/30",
              "flex flex-col items-center gap-1",
              "transition-all duration-200",
              btn.position,
              activeGesture === btn.gesture && "scale-90 bg-primary/20 gesture-glow"
            )}
          >
            <span className="text-foreground">{btn.icon}</span>
            <span className="text-xs text-muted-foreground">{btn.label}</span>
          </button>
        ))}

        {/* Double tap - Like button */}
        <button
          onClick={(e) => handleGesture("double-tap", e)}
          className={cn(
            "absolute bottom-4 left-4",
            "p-3 rounded-xl",
            "bg-secondary/50 hover:bg-secondary",
            "border border-border/50 hover:border-primary/30",
            "flex flex-col items-center gap-1",
            "transition-all duration-200",
            activeGesture === "double-tap" && "scale-90 bg-primary/20 gesture-glow"
          )}
        >
          <Heart className={cn("h-6 w-6", isLiked ? "text-primary fill-primary" : "text-foreground")} />
          <span className="text-xs text-muted-foreground">Double Tap</span>
        </button>

        {/* Pinch - Mute button */}
        <button
          onClick={(e) => handleGesture("pinch", e)}
          className={cn(
            "absolute bottom-4 right-4",
            "p-3 rounded-xl",
            "bg-secondary/50 hover:bg-secondary",
            "border border-border/50 hover:border-primary/30",
            "flex flex-col items-center gap-1",
            "transition-all duration-200",
            activeGesture === "pinch" && "scale-90 bg-primary/20 gesture-glow"
          )}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-foreground" />
          ) : (
            <Volume2 className="h-6 w-6 text-foreground" />
          )}
          <span className="text-xs text-muted-foreground">Pinch</span>
        </button>
      </div>

      {/* Gesture Legend */}
      <div className="p-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Track</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <span>Next Track</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronUp className="h-4 w-4" />
          <span>Volume Up</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span>Volume Down</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>Like Track</span>
        </div>
      </div>
    </div>
  );
}