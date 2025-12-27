import { useState, useEffect } from "react";
import { GestureType } from "./GestureControls";
import { cn } from "@/lib/utils";
import { 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Heart,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface GestureFeedbackProps {
  gesture: GestureType | null;
  action?: string;
}

const gestureIcons: Record<GestureType, React.ReactNode> = {
  "swipe-left": <SkipBack className="h-12 w-12" />,
  "swipe-right": <SkipForward className="h-12 w-12" />,
  "tap": <Play className="h-12 w-12" />,
  "swipe-up": <ChevronUp className="h-12 w-12" />,
  "swipe-down": <ChevronDown className="h-12 w-12" />,
  "double-tap": <Heart className="h-12 w-12" />,
  "pinch": <VolumeX className="h-12 w-12" />,
};

const gestureLabels: Record<GestureType, string> = {
  "swipe-left": "Previous Track",
  "swipe-right": "Next Track",
  "tap": "Play/Pause",
  "swipe-up": "Volume Up",
  "swipe-down": "Volume Down",
  "double-tap": "Like",
  "pinch": "Mute/Unmute",
};

export function GestureFeedback({ gesture, action }: GestureFeedbackProps) {
  const [visible, setVisible] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);

  useEffect(() => {
    if (gesture) {
      setCurrentGesture(gesture);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [gesture]);

  if (!visible || !currentGesture) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none z-50",
        "flex items-center justify-center"
      )}
    >
      <div 
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          "p-8 rounded-3xl",
          "bg-background/80 backdrop-blur-lg",
          "border border-primary/20",
          "gesture-glow",
          "animate-slide-up"
        )}
      >
        <div className="text-primary">
          {gestureIcons[currentGesture]}
        </div>
        <span className="text-lg font-semibold text-foreground">
          {gestureLabels[currentGesture]}
        </span>
        {action && (
          <span className="text-sm text-muted-foreground">
            {action}
          </span>
        )}
      </div>
    </div>
  );
}