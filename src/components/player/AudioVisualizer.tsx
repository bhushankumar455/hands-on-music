import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioData: number[];
  isPlaying: boolean;
  variant?: "bars" | "wave" | "circle";
}

export function AudioVisualizer({ audioData, isPlaying, variant = "bars" }: AudioVisualizerProps) {
  if (variant === "bars") {
    return (
      <div className="flex items-end justify-center gap-[2px] h-16 w-full px-4">
        {audioData.map((value, index) => (
          <div
            key={index}
            className={cn(
              "w-1 rounded-full transition-all duration-75",
              "bg-gradient-to-t from-primary to-accent"
            )}
            style={{
              height: `${Math.max(4, isPlaying ? value * 100 : 4)}%`,
              opacity: isPlaying ? 0.5 + value * 0.5 : 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "wave") {
    const pathData = audioData.reduce((path, value, index) => {
      const x = (index / (audioData.length - 1)) * 100;
      const y = 50 - value * 40;
      return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, "");

    return (
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
          </linearGradient>
        </defs>
        <path
          d={pathData || "M 0 50 L 100 50"}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          className={cn(
            "transition-all duration-75",
            !isPlaying && "opacity-30"
          )}
        />
      </svg>
    );
  }

  // Circle variant
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {audioData.slice(0, 16).map((value, index) => {
          const angle = (index / 16) * Math.PI * 2;
          const baseRadius = 40;
          const radius = baseRadius + (isPlaying ? value * 20 : 0);
          
          return (
            <div
              key={index}
              className="absolute w-1 rounded-full bg-gradient-to-r from-primary to-accent"
              style={{
                height: `${10 + (isPlaying ? value * 30 : 0)}px`,
                transform: `rotate(${angle}rad) translateY(-${radius}px)`,
                opacity: isPlaying ? 0.5 + value * 0.5 : 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}