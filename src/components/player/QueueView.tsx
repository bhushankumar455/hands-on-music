import { Track } from "@/data/sampleTracks";
import { cn } from "@/lib/utils";
import { X, GripVertical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueueViewProps {
  queue: Track[];
  currentIndex: number;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
}

export function QueueView({ queue, currentIndex, onPlayTrack, onRemoveFromQueue }: QueueViewProps) {
  const upNext = queue.slice(currentIndex + 1);
  const currentTrack = queue[currentIndex];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold">Queue</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {upNext.length} tracks coming up
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Now Playing */}
          {currentTrack && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Now Playing
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <img 
                  src={currentTrack.coverUrl} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <div className="w-0.5 h-3 bg-primary-foreground animate-pulse" />
                    <div className="w-0.5 h-4 bg-primary-foreground animate-pulse delay-75" />
                    <div className="w-0.5 h-2 bg-primary-foreground animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Up Next */}
          {upNext.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Up Next
              </h3>
              <div className="space-y-1">
                {upNext.map((track, index) => (
                  <div 
                    key={track.id + "-" + (currentIndex + 1 + index)}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-6 flex justify-center">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                    </div>
                    <img 
                      src={track.coverUrl} 
                      alt="" 
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onPlayTrack(track)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveFromQueue(currentIndex + 1 + index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upNext.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No tracks in queue</p>
              <p className="text-sm mt-1">Add tracks from the library</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}