import { cn } from "@/lib/utils";

interface AudioEqualizerProps {
  audioData: number[];
  isPlaying: boolean;
  className?: string;
}

export function AudioEqualizer({ audioData, isPlaying, className }: AudioEqualizerProps) {
  // Use fewer bars for mobile, more for desktop
  const displayBars = 24;
  const bars = audioData.slice(0, displayBars);

  return (
    <div className={cn("flex items-end justify-center gap-[2px] h-16", className)}>
      {bars.map((value, index) => {
        // Create a smooth curve effect - middle bars are taller
        const centerIndex = displayBars / 2;
        const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex;
        const heightMultiplier = 1 - (distanceFromCenter * 0.3);
        
        // Calculate bar height
        const minHeight = 4;
        const maxHeight = 64;
        const height = isPlaying 
          ? Math.max(minHeight, value * maxHeight * heightMultiplier)
          : minHeight + Math.sin((index / displayBars) * Math.PI) * 8;

        // Color gradient from primary to accent
        const hue = 262 + (index / displayBars) * 20;
        
        return (
          <div
            key={index}
            className="rounded-full transition-all duration-75 ease-out"
            style={{
              width: '6px',
              height: `${height}px`,
              background: isPlaying 
                ? `linear-gradient(to top, hsl(${hue}, 83%, 58%), hsl(${hue + 15}, 70%, 65%))`
                : 'hsl(var(--muted))',
              opacity: isPlaying ? 0.9 + value * 0.1 : 0.4,
              transform: isPlaying ? `scaleY(${0.8 + value * 0.2})` : 'scaleY(1)',
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
