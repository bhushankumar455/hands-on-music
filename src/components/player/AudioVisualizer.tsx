import { useState, useEffect, useRef } from "react";
import { Waves, BarChart3, Circle, Sparkles, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type VisualizerTheme = "bars" | "wave" | "circular" | "particles" | "mirror";

interface VisualizerThemeOption {
  id: VisualizerTheme;
  name: string;
  icon: React.ElementType;
}

const themes: VisualizerThemeOption[] = [
  { id: "bars", name: "Bars", icon: BarChart3 },
  { id: "wave", name: "Wave", icon: Waves },
  { id: "circular", name: "Circular", icon: Circle },
  { id: "particles", name: "Particles", icon: Sparkles },
  { id: "mirror", name: "Mirror", icon: Radio },
];

interface AudioVisualizerProps {
  audioData: number[];
  isPlaying: boolean;
  theme?: VisualizerTheme;
  onThemeChange?: (theme: VisualizerTheme) => void;
  className?: string;
  showThemeSelector?: boolean;
}

// Bars Visualizer
function BarsVisualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const displayBars = 32;
  const bars = audioData.slice(0, displayBars);

  return (
    <div className="flex items-end justify-center gap-[3px] h-16">
      {bars.map((value, index) => {
        const centerIndex = displayBars / 2;
        const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex;
        const heightMultiplier = 1 - distanceFromCenter * 0.3;
        const minHeight = 4;
        const maxHeight = 64;
        const height = isPlaying
          ? Math.max(minHeight, value * maxHeight * heightMultiplier)
          : minHeight + Math.sin((index / displayBars) * Math.PI) * 6;

        return (
          <div
            key={index}
            className="rounded-full transition-all duration-75 ease-out"
            style={{
              width: "4px",
              height: `${height}px`,
              background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.5))`,
              opacity: isPlaying ? 0.7 + value * 0.3 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

// Wave Visualizer
function WaveVisualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "hsla(262, 83%, 58%, 0.8)");
    gradient.addColorStop(0.5, "hsla(280, 70%, 50%, 0.9)");
    gradient.addColorStop(1, "hsla(262, 83%, 58%, 0.8)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const sliceWidth = width / (audioData.length - 1);

    audioData.forEach((value, index) => {
      const x = index * sliceWidth;
      const y = isPlaying
        ? height / 2 + (value - 0.5) * height * 0.8
        : height / 2 + Math.sin((index / audioData.length) * Math.PI * 2) * 8;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw a subtle fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, "hsla(262, 83%, 58%, 0.2)");
    fillGradient.addColorStop(1, "hsla(262, 83%, 58%, 0)");
    ctx.fillStyle = fillGradient;
    ctx.fill();
  }, [audioData, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={64}
      className="w-full h-16"
    />
  );
}

// Circular Visualizer
function CircularVisualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    const bars = audioData.slice(0, 64);
    const angleStep = (Math.PI * 2) / bars.length;

    bars.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const barHeight = isPlaying ? value * 25 + 5 : 8;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsla(262, 83%, 58%, ${0.5 + value * 0.5})`);
      gradient.addColorStop(1, `hsla(280, 70%, 50%, ${0.3 + value * 0.7})`);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "hsla(262, 83%, 58%, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [audioData, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={140}
      className="w-full h-[140px]"
    />
  );
}

// Particles Visualizer
function ParticlesVisualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);

  useEffect(() => {
    if (!isPlaying) {
      setParticles([]);
      return;
    }

    const avgValue = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    
    setParticles(prev => {
      const newParticles = prev
        .map(p => ({
          ...p,
          y: p.y - 1.5,
          opacity: p.opacity - 0.015,
        }))
        .filter(p => p.opacity > 0);

      if (avgValue > 0.15 && newParticles.length < 40) {
        const count = Math.floor(avgValue * 4);
        for (let i = 0; i < count; i++) {
          newParticles.push({
            x: 20 + Math.random() * 60,
            y: 80 + Math.random() * 20,
            size: 2 + avgValue * 6,
            opacity: 0.6 + avgValue * 0.4,
          });
        }
      }

      return newParticles;
    });
  }, [audioData, isPlaying]);

  return (
    <div className="relative w-full h-24 overflow-hidden">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary))`,
            transition: "all 50ms linear",
          }}
        />
      ))}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/30"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mirror Visualizer
function MirrorVisualizer({ audioData, isPlaying }: { audioData: number[]; isPlaying: boolean }) {
  const displayBars = 16;
  const bars = audioData.slice(0, displayBars);

  return (
    <div className="flex flex-col items-center justify-center h-16 gap-0.5">
      {/* Top half */}
      <div className="flex items-end justify-center gap-[4px] h-8">
        {bars.map((value, index) => {
          const height = isPlaying
            ? Math.max(2, value * 32)
            : 2 + Math.sin((index / displayBars) * Math.PI) * 3;

          return (
            <div
              key={`top-${index}`}
              className="rounded-t-sm transition-all duration-75"
              style={{
                width: "6px",
                height: `${height}px`,
                background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.4))`,
                opacity: isPlaying ? 0.8 + value * 0.2 : 0.3,
              }}
            />
          );
        })}
      </div>
      {/* Bottom half (mirrored) */}
      <div className="flex items-start justify-center gap-[4px] h-8">
        {bars.map((value, index) => {
          const height = isPlaying
            ? Math.max(2, value * 32)
            : 2 + Math.sin((index / displayBars) * Math.PI) * 3;

          return (
            <div
              key={`bottom-${index}`}
              className="rounded-b-sm transition-all duration-75"
              style={{
                width: "6px",
                height: `${height}px`,
                background: `linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary) / 0.2))`,
                opacity: isPlaying ? 0.5 + value * 0.2 : 0.2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Theme Selector
export function VisualizerThemeSelector({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: VisualizerTheme;
  onThemeChange: (theme: VisualizerTheme) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
        >
          <Waves className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-48 p-2 bg-card border-border">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">Visualizer Style</p>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                currentTheme === theme.id
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-secondary text-foreground"
              )}
            >
              <theme.icon className="h-4 w-4" />
              {theme.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AudioVisualizer({
  audioData,
  isPlaying,
  theme = "bars",
  onThemeChange,
  className,
  showThemeSelector = false,
}: AudioVisualizerProps) {
  const renderVisualizer = () => {
    switch (theme) {
      case "wave":
        return <WaveVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case "circular":
        return <CircularVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case "particles":
        return <ParticlesVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case "mirror":
        return <MirrorVisualizer audioData={audioData} isPlaying={isPlaying} />;
      case "bars":
      default:
        return <BarsVisualizer audioData={audioData} isPlaying={isPlaying} />;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {showThemeSelector && onThemeChange && (
        <div className="absolute -top-8 right-0">
          <VisualizerThemeSelector currentTheme={theme} onThemeChange={onThemeChange} />
        </div>
      )}
      <div className="flex items-center justify-center">
        {renderVisualizer()}
      </div>
    </div>
  );
}
