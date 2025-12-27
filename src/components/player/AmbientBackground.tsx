import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  coverUrl?: string;
  isPlaying: boolean;
  audioData?: number[];
}

export function AmbientBackground({ coverUrl, isPlaying, audioData = [] }: AmbientBackgroundProps) {
  const avgLevel = useMemo(() => {
    if (!audioData.length) return 0.3;
    const sum = audioData.reduce((a, b) => a + b, 0);
    return Math.min(0.6, 0.2 + (sum / audioData.length) * 0.4);
  }, [audioData]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          isPlaying ? "opacity-100" : "opacity-50"
        )}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, hsl(262 83% 20% / ${avgLevel}) 0%, transparent 70%)`,
        }}
      />
      
      {/* Album art blur effect */}
      {coverUrl && (
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-1000",
            isPlaying ? "opacity-20 scale-110" : "opacity-10 scale-100"
          )}
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(80px) saturate(1.5)",
          }}
        />
      )}

      {/* Animated orbs */}
      <div 
        className={cn(
          "absolute w-96 h-96 rounded-full transition-all duration-500",
          isPlaying ? "animate-pulse-soft" : ""
        )}
        style={{
          background: `radial-gradient(circle, hsl(262 83% 58% / ${avgLevel * 0.3}) 0%, transparent 70%)`,
          top: "-20%",
          left: "20%",
          transform: `scale(${1 + avgLevel})`,
        }}
      />
      <div 
        className={cn(
          "absolute w-72 h-72 rounded-full transition-all duration-700",
          isPlaying ? "animate-pulse-soft" : ""
        )}
        style={{
          background: `radial-gradient(circle, hsl(280 70% 50% / ${avgLevel * 0.2}) 0%, transparent 70%)`,
          bottom: "10%",
          right: "-10%",
          animationDelay: "500ms",
          transform: `scale(${1 + avgLevel * 0.5})`,
        }}
      />
    </div>
  );
}
