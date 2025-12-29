import { useState, useEffect } from "react";
import { GestureType } from "@/hooks/useHandTracking";
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
  ChevronDown,
  Hand,
  ThumbsUp,
  Pointer
} from "lucide-react";

interface GestureFeedbackProps {
  gesture: GestureType;
  action?: string;
}

type NonNullGesture = Exclude<GestureType, null>;

const gestureIcons: Record<NonNullGesture, React.ReactNode> = {
  "swipe-left": <SkipBack className="h-12 w-12" />,
  "swipe-right": <SkipForward className="h-12 w-12" />,
  "tap": <Play className="h-12 w-12" />,
  "swipe-up": <ChevronUp className="h-12 w-12" />,
  "swipe-down": <ChevronDown className="h-12 w-12" />,
  "double-tap": <Heart className="h-12 w-12" />,
  "pinch": <VolumeX className="h-12 w-12" />,
  "open-palm": <Pause className="h-12 w-12" />,
  "thumbs-up": <ThumbsUp className="h-12 w-12" />,
  "pointing": <Play className="h-12 w-12" />,
};

const gestureLabels: Record<NonNullGesture, string> = {
  "swipe-left": "Previous Track",
  "swipe-right": "Next Track",
  "tap": "Play/Pause",
  "swipe-up": "Volume Up",
  "swipe-down": "Volume Down",
  "double-tap": "Like",
  "pinch": "Mute/Unmute",
  "open-palm": "Pause",
  "thumbs-up": "Great!",
  "pointing": "Play",
};

export function GestureFeedback({ gesture, action }: GestureFeedbackProps) {
  const [visible, setVisible] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<NonNullGesture | null>(null);

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