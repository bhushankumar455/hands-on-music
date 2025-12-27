import { useState, useCallback, useEffect, useRef } from "react";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { SpotifyNowPlaying } from "@/components/player/SpotifyNowPlaying";
import { GestureControls } from "@/components/gesture/GestureControls";
import { HandTracking } from "@/components/gesture/HandTracking";
import { GestureFeedback } from "@/components/gesture/GestureFeedback";
import { spotifyPlaylistsData, allSpotifyTracks, SpotifyTrack } from "@/data/spotifyTracks";
import { Play, Music, ListMusic, Hand, MousePointer, Search, Heart, List, Menu, X, Headphones, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

type View = "playing" | "playlists" | "queue" | "search" | "liked";

const Index = () => {
  const player = useSpotifyPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType>(null);
  const [currentView, setCurrentView] = useState<View>("playing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGesture = useCallback((gesture: GestureType) => {
    if (!gesture) return;
    
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 100);

    switch (gesture) {
      case "tap":
        player.togglePlay();
        toast({ title: player.isPlaying ? "Paused" : "Playing" });
        break;
      case "swipe-left":
        player.previous();
        toast({ title: "Previous Track" });
        break;
      case "swipe-right":
        player.next();
        toast({ title: "Next Track" });
        break;
      case "swipe-up":
        player.setVolume(Math.min(1, player.volume + 0.15));
        toast({ title: "Volume Up", description: `${Math.round(player.volume * 100 + 15)}%` });
        break;
      case "swipe-down":
        player.setVolume(Math.max(0, player.volume - 0.15));
        toast({ title: "Volume Down", description: `${Math.round(Math.max(0, player.volume * 100 - 15))}%` });
        break;
      case "double-tap":
        player.toggleLike();
        toast({ title: player.isLiked ? "Removed from Liked" : "Added to Liked ❤️" });
        break;
      case "pinch":
        player.toggleMute();
        toast({ title: player.isMuted ? "Unmuted" : "Muted 🔇" });
        break;
      case "open-palm":
        player.pause();
        toast({ title: "Paused ✋" });
        break;
      case "thumbs-up":
        if (!player.isLiked) player.toggleLike();
        toast({ title: "👍 Liked!" });
        break;
    }
  }, [player]);

  // Debounced Spotify search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("spotify-search", {
          body: { query: trimmed, limit: 20 },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setSearchResults(data.tracks || []);
      } catch (err) {
        console.error("Spotify search error:", err);
        setSearchError(err instanceof Error ? err.message : "Search failed");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Local filter for offline tracks (fallback)
  const filteredTracks = searchQuery.trim() 
    ? allSpotifyTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const navItems = [
    { id: "playing" as View, icon: Play, label: "Now Playing" },
    { id: "playlists" as View, icon: ListMusic, label: "Playlists" },
    { id: "queue" as View, icon: List, label: "Queue" },
    { id: "search" as View, icon: Search, label: "Search" },
    { id: "liked" as View, icon: Heart, label: "Liked Songs" },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <GestureFeedback gesture={activeGesture} />
      
      <div className="flex h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            AIMusicPlay
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur pt-16">
            <nav className="p-4 space-y-2">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setCurrentView(id); setMobileMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-colors text-lg",
                    currentView === id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              AIMusicPlay
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Gesture Controlled Music</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  currentView === id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Mini Player */}
          {player.currentTrack && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <img src={player.currentTrack.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{player.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{player.currentTrack.artist}</p>
                </div>
                {player.isPlaying && (
                  <div className="flex items-center gap-0.5">
                    <div className="w-0.5 h-3 bg-primary animate-pulse" />
                    <div className="w-0.5 h-4 bg-primary animate-pulse delay-75" />
                    <div className="w-0.5 h-2 bg-primary animate-pulse delay-150" />
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-16 lg:pt-0">
          <div className="flex-1 overflow-auto">
            {currentView === "playing" && (
              <SpotifyNowPlaying
                currentTrack={player.currentTrack}
                isPlaying={player.isPlaying}
                volume={player.volume}
                isMuted={player.isMuted}
                isShuffled={player.isShuffled}
                repeatMode={player.repeatMode}
                isLiked={player.isLiked}
                embedRef={player.embedRef}
                onTogglePlay={player.togglePlay}
                onNext={player.next}
                onPrevious={player.previous}
                onVolumeChange={player.setVolume}
                onToggleMute={player.toggleMute}
                onToggleShuffle={player.toggleShuffle}
                onToggleRepeat={player.toggleRepeat}
                onToggleLike={player.toggleLike}
              />
            )}
            
            {currentView === "playlists" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Playlists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spotifyPlaylistsData.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => { 
                        player.playTrack(playlist.tracks[0], playlist.tracks); 
                        setCurrentView("playing"); 
                      }}
                      className="group relative overflow-hidden rounded-xl aspect-square"
                    >
                      <img 
                        src={playlist.coverUrl} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-lg">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground">{playlist.tracks.length} songs</p>
                      </div>
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {currentView === "queue" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">Queue</h2>
                <p className="text-muted-foreground mb-6">{player.queue.length - player.queueIndex - 1} songs up next</p>
                
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2">
                    {player.queue.map((track, index) => (
                      <button
                        key={track.id + "-" + index}
                        onClick={() => player.playTrack(track)}
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors",
                          index === player.queueIndex ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"
                        )}
                      >
                        <span className="w-6 text-center text-muted-foreground text-sm">
                          {index === player.queueIndex && player.isPlaying ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <div className="w-0.5 h-3 bg-primary animate-pulse" />
                              <div className="w-0.5 h-4 bg-primary animate-pulse delay-75" />
                            </div>
                          ) : (
                            index + 1
                          )}
                        </span>
                        <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-medium truncate", index === player.queueIndex && "text-primary")}>
                            {track.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {currentView === "search" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">Search Spotify</h2>
                <p className="text-muted-foreground text-sm mb-6">Search any song on Spotify</p>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs, artists, albums..."
                    className="pl-10 pr-10 h-12 bg-secondary/50 border-0"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                  )}
                </div>
                
                {!searchQuery && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Search for any song on Spotify</p>
                    <p className="text-sm mt-2">Type at least 2 characters to search</p>
                  </div>
                )}

                {searchError && (
                  <div className="text-center py-8 text-destructive">
                    <p>{searchError}</p>
                    <p className="text-sm mt-2 text-muted-foreground">Showing local results instead</p>
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && filteredTracks.length === 0 && !searchError && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No results for "{searchQuery}"</p>
                  </div>
                )}

                {/* Spotify API Results */}
                {searchResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify Results
                    </h3>
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="space-y-2">
                        {searchResults.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => { player.playTrack(track, searchResults); setCurrentView("playing"); }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                          >
                            <img src={track.coverUrl} alt="" className="w-14 h-14 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{track.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                              <p className="text-xs text-muted-foreground/60 truncate">{track.album}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Local Results Fallback */}
                {searchResults.length === 0 && filteredTracks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Local Results</h3>
                    <div className="space-y-2">
                      {filteredTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, allSpotifyTracks); setCurrentView("playing"); }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                        >
                          <img src={track.coverUrl} alt="" className="w-14 h-14 rounded object-cover" />
                          <div className="flex-1">
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {currentView === "liked" && (
              <div className="p-6">
                <div className="player-gradient rounded-2xl p-8 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Heart className="h-16 w-16 text-primary-foreground fill-current" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/70 uppercase tracking-wider">Playlist</p>
                      <h2 className="text-3xl font-bold text-primary-foreground">Liked Songs</h2>
                      <p className="text-primary-foreground/70 mt-2">{player.getLikedTracks().length} songs</p>
                    </div>
                  </div>
                </div>
                
                {player.getLikedTracks().length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Songs you like will appear here</p>
                    <p className="text-sm mt-1">Double-tap or thumbs up to like songs</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {player.getLikedTracks().map((track, index) => (
                      <button
                        key={track.id}
                        onClick={() => player.playTrack(track, player.getLikedTracks())}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                      >
                        <span className="w-6 text-center text-muted-foreground">{index + 1}</span>
                        <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gesture Controls Panel */}
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card/50 flex flex-col">
            <Tabs defaultValue="camera" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger value="camera" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                  <Hand className="h-4 w-4 mr-2" />Camera
                </TabsTrigger>
                <TabsTrigger value="simulate" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                  <MousePointer className="h-4 w-4 mr-2" />Touch
                </TabsTrigger>
              </TabsList>
              <TabsContent value="camera" className="flex-1 mt-0 overflow-hidden">
                <div className="h-full">
                  <HandTracking onGesture={handleGesture} isPlaying={player.isPlaying} isLiked={player.isLiked} isMuted={player.isMuted} />
                </div>
              </TabsContent>
              <TabsContent value="simulate" className="flex-1 mt-0 overflow-hidden">
                <div className="h-full">
                  <GestureControls onGesture={handleGesture} isPlaying={player.isPlaying} isLiked={player.isLiked} isMuted={player.isMuted} />
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Index;
