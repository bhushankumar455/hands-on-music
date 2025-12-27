import { Track } from "@/data/sampleTracks";
import { cn } from "@/lib/utils";

interface AlbumArtProps {
  track: Track | null;
  isPlaying: boolean;
  className?: string;
}

export function AlbumArt({ track, isPlaying, className }: AlbumArtProps) {
  if (!track) {
    return (
      <div 
        className={cn(
          "aspect-square rounded-2xl bg-muted flex items-center justify-center",
          className
        )}
      >
        <span className="text-muted-foreground">No track selected</span>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div 
        className={cn(
          "aspect-square rounded-2xl overflow-hidden album-shadow",
          "transition-transform duration-500",
          isPlaying && "animate-pulse-glow"
        )}
      >
        <img
          src={track.coverUrl}
          alt={`${track.album} cover`}
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-700",
            isPlaying ? "scale-105" : "scale-100"
          )}
        />
        
        {/* Gradient overlay */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100",
            "bg-gradient-to-t from-background/80 via-transparent to-transparent",
            "transition-opacity duration-300"
          )}
        />
      </div>

      {/* Spinning vinyl effect behind album art */}
      <div 
        className={cn(
          "absolute -inset-4 -z-10 rounded-full",
          "bg-gradient-to-br from-muted via-secondary to-muted",
          "opacity-50",
          isPlaying && "animate-spin-slow"
        )}
      />
    </div>
  );
}