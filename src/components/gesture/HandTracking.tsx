import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useHandTracking, GestureType } from "@/hooks/useHandTracking";
import { Camera, CameraOff, Loader2, Hand, AlertCircle, Play, Pause, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HandTrackingProps {
  onGesture: (gesture: GestureType) => void;
  isPlaying: boolean;
  isLiked: boolean;
  isMuted: boolean;
}

export const HandTracking = forwardRef<HTMLDivElement, HandTrackingProps>(({ 
  onGesture, 
  isPlaying, 
  isLiked, 
  isMuted 
}, ref) => {
  const {
    videoRef,
    canvasRef,
    isTracking,
    isLoading,
    error,
    gesture,
    handPosition,
    startTracking,
    stopTracking,
  } = useHandTracking(onGesture);

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b border-border">
        <h3 className="text-lg font-semibold text-gradient flex items-center justify-center gap-2">
          <Hand className="h-5 w-5" />
          Hand Tracking
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isTracking ? "Show your hand to control playback" : "Enable camera to start"}
        </p>
      </div>

      {/* Video/Canvas Container */}
      <div className="flex-1 relative min-h-[300px] bg-secondary/30 overflow-hidden">
        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        
        {/* Canvas for drawing */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={cn(
            "w-full h-full object-cover",
            !isTracking && "hidden"
          )}
        />

        {/* Overlay when not tracking */}
        {!isTracking && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="p-6 rounded-full bg-secondary/50 border border-border">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground max-w-xs">
              Enable your camera to control music with hand gestures
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading hand tracking...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-background/80">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-center text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Gesture indicator removed - handled by parent component */}

        {/* Hand position cursor */}
        {handPosition && isTracking && (
          <div 
            className="absolute w-4 h-4 rounded-full bg-accent pointer-events-none transition-all duration-75"
            style={{
              left: `${handPosition.x * 100}%`,
              top: `${handPosition.y * 100}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 20px hsl(217 91% 60% / 0.5)",
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 border-t border-border">
        <Button
          onClick={isTracking ? stopTracking : startTracking}
          disabled={isLoading}
          className={cn(
            "w-full",
            isTracking 
              ? "bg-destructive hover:bg-destructive/90" 
              : "player-gradient hover:opacity-90"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : isTracking ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Tracking
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Start Tracking
            </>
          )}
        </Button>

        {/* Gesture Guide */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-primary">🖐️</span>
            <span>Open Palm: Play</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-primary">✊</span>
            <span>Closed Fist: Pause</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-primary">👋</span>
            <span>Swipe L/R: Skip</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-primary">👆</span>
            <span>Swipe U/D: Volume</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-primary">🤏</span>
            <span>Pinch: Mute</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Heart className={cn("h-4 w-4", isLiked ? "text-primary fill-primary" : "text-primary")} />
            <span>Double Fist: Like</span>
          </div>
        </div>
      </div>
    </div>
  );
});

HandTracking.displayName = "HandTracking";