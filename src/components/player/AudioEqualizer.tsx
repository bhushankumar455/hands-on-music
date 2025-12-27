import { cn } from "@/lib/utils";

interface AudioEqualizerProps {
  audioData: number[];
  isPlaying: boolean;
  className?: string;
}

export function AudioEqualizer({ audioData, isPlaying, className }: AudioEqualizerProps) {
  const displayBars = 32;
  const bars = audioData.slice(0, displayBars);

  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-10", className)}>
      {bars.map((value, index) => {
        // Create a smooth wave effect
        const centerIndex = displayBars / 2;
        const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex;
        const heightMultiplier = 1 - (distanceFromCenter * 0.4);
        
        // Calculate bar height
        const minHeight = 3;
        const maxHeight = 40;
        const height = isPlaying 
          ? Math.max(minHeight, value * maxHeight * heightMultiplier)
          : minHeight + Math.sin((index / displayBars) * Math.PI) * 4;
        
        return (
          <div
            key={index}
            className="rounded-full transition-all duration-100 ease-out bg-primary/80"
            style={{
              width: '3px',
              height: `${height}px`,
              opacity: isPlaying ? 0.7 + value * 0.3 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

// Compact version for mini player
export function MiniEqualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const bars = [audioData[4], audioData[8], audioData[12], audioData[16], audioData[20]];
  
  if (!isPlaying) return null;
  
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((value, index) => (
        <div
          key={index}
          className="w-0.5 rounded-full bg-primary transition-all duration-75"
          style={{
            height: `${Math.max(4, value * 16)}px`,
          }}
        />
      ))}
    </div>
  );
}
