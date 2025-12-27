import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { NowPlaying } from "@/components/player/NowPlaying";
import { GestureControls } from "@/components/gesture/GestureControls";
import { HandTracking } from "@/components/gesture/HandTracking";
import { sampleTracks, samplePlaylists } from "@/data/sampleTracks";
import { Play, ListMusic, Hand, MousePointer, Search, Heart, List, Menu, X, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = "playing" | "playlists" | "queue" | "search" | "liked";

const Index = () => {
  const player = useAudioPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType>(null);
  const [currentView, setCurrentView] = useState<View>("playing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gestureMode, setGestureMode] = useState<"hand" | "mouse">("mouse");

  const handleGesture = useCallback((gesture: GestureType) => {
    if (!gesture) return;
    
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 800);

    switch (gesture) {
      case "tap":
        player.togglePlay();
        break;
      case "swipe-left":
        player.previous();
        break;
      case "swipe-right":
        player.next();
        break;
      case "swipe-up":
        player.setVolume(Math.min(1, player.volume + 0.15));
        break;
      case "swipe-down":
        player.setVolume(Math.max(0, player.volume - 0.15));
        break;
      case "double-tap":
        player.toggleLike();
        break;
      case "pinch":
        player.toggleMute();
        break;
      case "open-palm":
        player.pause();
        break;
      case "thumbs-up":
        if (!player.isLiked) player.toggleLike();
        break;
    }
  }, [player]);

  // Local search filter
  const filteredTracks = searchQuery.trim() 
    ? sampleTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
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

  const likedTracks = player.getLikedTracks();

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="flex h-screen">
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
              <NowPlaying
                currentTrack={player.currentTrack}
                isPlaying={player.isPlaying}
                currentTime={player.currentTime}
                duration={player.duration}
                volume={player.volume}
                isMuted={player.isMuted}
                isShuffled={player.isShuffled}
                repeatMode={player.repeatMode}
                isLiked={player.isLiked}
                onTogglePlay={player.togglePlay}
                onNext={player.next}
                onPrevious={player.previous}
                onSeek={player.seek}
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
                  {samplePlaylists.map((playlist) => (
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
                <h2 className="text-2xl font-bold mb-2">Search</h2>
                <p className="text-muted-foreground text-sm mb-6">Search your music library</p>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs, artists, albums..."
                    className="pl-10 h-12 bg-secondary/50 border-0"
                  />
                </div>
                
                {!searchQuery && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Search for songs in your library</p>
                  </div>
                )}
                
                {searchQuery && filteredTracks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No results for "{searchQuery}"</p>
                  </div>
                )}

                {filteredTracks.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-2">
                      {filteredTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, sampleTracks); setCurrentView("playing"); }}
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
                )}

                {/* Browse All */}
                {!searchQuery && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Browse All Songs</h3>
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      <div className="space-y-2">
                        {sampleTracks.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => { player.playTrack(track, sampleTracks); setCurrentView("playing"); }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                          >
                            <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{track.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
            
            {currentView === "liked" && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">Liked Songs</h2>
                <p className="text-muted-foreground mb-6">{likedTracks.length} songs</p>
                
                {likedTracks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No liked songs yet</p>
                    <p className="text-sm mt-2">Double-tap or use the heart button to like songs</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      {likedTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, likedTracks); setCurrentView("playing"); }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                        >
                          <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
                          <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>

          {/* Gesture Control Panel */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/50 relative">
            {/* Gesture Feedback - only in this panel */}
            {activeGesture && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 animate-pulse">
                  <span className="text-lg font-semibold text-primary">
                    {activeGesture.replace("-", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            <Tabs value={gestureMode} onValueChange={(v) => setGestureMode(v as "hand" | "mouse")} className="h-full flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold mb-3">Gesture Controls</h2>
                <TabsList className="w-full">
                  <TabsTrigger value="mouse" className="flex-1 gap-2">
                    <MousePointer className="h-4 w-4" />
                    Mouse
                  </TabsTrigger>
                  <TabsTrigger value="hand" className="flex-1 gap-2">
                    <Hand className="h-4 w-4" />
                    Hand
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="mouse" className="flex-1 m-0 overflow-auto">
                <GestureControls 
                  onGesture={handleGesture} 
                  isPlaying={player.isPlaying}
                  isLiked={player.isLiked}
                  isMuted={player.isMuted}
                />
              </TabsContent>
              
              <TabsContent value="hand" className="flex-1 m-0 overflow-auto">
                <HandTracking 
                  onGesture={handleGesture}
                  isPlaying={player.isPlaying}
                  isLiked={player.isLiked}
                  isMuted={player.isMuted}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
