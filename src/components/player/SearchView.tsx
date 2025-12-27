import { useState } from "react";
import { Track, sampleTracks } from "@/data/sampleTracks";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchViewProps {
  onPlayTrack: (track: Track, queue: Track[]) => void;
  onAddToQueue: (track: Track) => void;
}

export function SearchView({ onPlayTrack, onAddToQueue }: SearchViewProps) {
  const [query, setQuery] = useState("");
  
  const filteredTracks = query.trim() 
    ? sampleTracks.filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        track.album.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-6">Search</h2>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="pl-10 pr-10 h-12 bg-secondary/50 border-0 focus-visible:ring-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {!query && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Search for your favorite music</p>
            <p className="text-sm mt-1">Find songs, artists, and albums</p>
          </div>
        )}

        {query && filteredTracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No results found for "{query}"</p>
            <p className="text-sm mt-1">Try a different search</p>
          </div>
        )}

        {filteredTracks.length > 0 && (
          <div className="space-y-1">
            {filteredTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => onPlayTrack(track, sampleTracks)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl",
                  "hover:bg-secondary/50 transition-colors text-left"
                )}
              >
                <img 
                  src={track.coverUrl} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist} • {track.album}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue(track);
                  }}
                  className="text-xs"
                >
                  Add to Queue
                </Button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}