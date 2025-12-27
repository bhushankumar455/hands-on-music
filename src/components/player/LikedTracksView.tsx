import { Track } from "@/data/sampleTracks";
import { Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikedTracksViewProps {
  likedTracks: Track[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
}

export function LikedTracksView({ likedTracks, onPlayTrack }: LikedTracksViewProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with gradient */}
      <div className="p-8 player-gradient">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
            <Heart className="h-20 w-20 text-primary-foreground fill-current" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              Playlist
            </p>
            <h1 className="text-4xl font-bold text-primary-foreground mt-2">
              Liked Songs
            </h1>
            <p className="text-primary-foreground/70 mt-4">
              {likedTracks.length} songs
            </p>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-auto p-4">
        {likedTracks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Songs you like will appear here</p>
            <p className="text-sm mt-1">Double-tap or click the heart to save songs</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left py-3 px-4 w-12">#</th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Album</th>
                <th className="text-right py-3 px-4 w-20">
                  <Clock className="h-4 w-4 inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {likedTracks.map((track, index) => (
                <tr 
                  key={track.id}
                  onClick={() => onPlayTrack(track, likedTracks)}
                  className={cn(
                    "group cursor-pointer",
                    "hover:bg-secondary/50 transition-colors"
                  )}
                >
                  <td className="py-3 px-4 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={track.coverUrl} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                    {track.album}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {formatDuration(track.duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}