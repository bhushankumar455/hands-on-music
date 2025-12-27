import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { NowPlaying } from "@/components/player/NowPlaying";
import { GestureControls } from "@/components/gesture/GestureControls";
import { HandTracking } from "@/components/gesture/HandTracking";
import { sampleTracks, samplePlaylists } from "@/data/sampleTracks";
import { Play, ListMusic, Hand, MousePointer, Search, Heart, List, Menu, X, Headphones, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = "playing" | "playlists" | "queue" | "search" | "liked" | "gestures";

const Index = () => {
  const player = useAudioPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType>(null);
  const [currentView, setCurrentView] = useState<View>("playing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gestureMode, setGestureMode] = useState<"hand" | "mouse">("mouse");
  const [showGesturePanel, setShowGesturePanel] = useState(true);

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
    { id: "liked" as View, icon: Heart, label: "Liked" },
    { id: "gestures" as View, icon: Hand, label: "Gestures" },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const likedTracks = player.getLikedTracks();

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">AIMusicPlay</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 bg-card border-b border-border p-2 shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setCurrentView(id); setMobileMenuOpen(false); }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-xs",
                    currentView === id ? "bg-primary/20 text-primary" : "hover:bg-secondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px]",
                currentView === id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="w-56 xl:w-64 bg-card border-r border-border hidden lg:flex flex-col shrink-0">
          <div className="p-4 xl:p-6">
            <h1 className="text-xl xl:text-2xl font-bold text-primary flex items-center gap-2">
              <Headphones className="h-5 w-5 xl:h-6 xl:w-6" />
              AIMusicPlay
            </h1>
            <p className="text-xs text-muted-foreground mt-1 hidden xl:block">Gesture Controlled</p>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navItems.filter(n => n.id !== "gestures").map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  currentView === id ? "bg-primary/15 text-primary font-medium" : "hover:bg-secondary text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Mini Player in Sidebar */}
          {player.currentTrack && (
            <div className="p-3 border-t border-border">
              <button 
                onClick={() => setCurrentView("playing")}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <img src={player.currentTrack.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate text-sm">{player.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{player.currentTrack.artist}</p>
                </div>
                {player.isPlaying && (
                  <div className="flex items-center gap-0.5">
                    <div className="w-0.5 h-2 bg-primary animate-pulse" />
                    <div className="w-0.5 h-3 bg-primary animate-pulse" style={{ animationDelay: "75ms" }} />
                    <div className="w-0.5 h-2 bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                  </div>
                )}
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden pt-14 pb-16 lg:pt-0 lg:pb-0">
          <div className="flex-1 overflow-auto">
            {/* Now Playing View */}
            {currentView === "playing" && (
              <div className="h-full">
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
              </div>
            )}
            
            {/* Playlists View */}
            {currentView === "playlists" && (
              <div className="p-4 lg:p-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Playlists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                  {samplePlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => { 
                        player.playTrack(playlist.tracks[0], playlist.tracks); 
                        setCurrentView("playing"); 
                      }}
                      className="group relative overflow-hidden rounded-xl aspect-square bg-secondary"
                    >
                      <img 
                        src={playlist.coverUrl} 
                        alt={playlist.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3">
                        <h3 className="font-semibold text-sm lg:text-base text-white truncate">{playlist.name}</h3>
                        <p className="text-xs text-white/70">{playlist.tracks.length} songs</p>
                      </div>
                      <div className="absolute top-2 right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Queue View */}
            {currentView === "queue" && (
              <div className="p-4 lg:p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold">Queue</h2>
                  <p className="text-sm text-muted-foreground">{player.queue.length} songs</p>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="space-y-1">
                    {player.queue.map((track, index) => (
                      <button
                        key={track.id + "-" + index}
                        onClick={() => player.playTrack(track)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 lg:p-3 rounded-lg text-left transition-colors",
                          index === player.queueIndex ? "bg-primary/15" : "hover:bg-secondary"
                        )}
                      >
                        <span className="w-6 text-center text-muted-foreground text-xs">
                          {index === player.queueIndex && player.isPlaying ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <div className="w-0.5 h-2 bg-primary animate-pulse" />
                              <div className="w-0.5 h-3 bg-primary animate-pulse" />
                            </div>
                          ) : (
                            index + 1
                          )}
                        </span>
                        <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", index === player.queueIndex && "text-primary")}>
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">{formatDuration(track.duration)}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {/* Search View */}
            {currentView === "search" && (
              <div className="p-4 lg:p-6 h-full flex flex-col">
                <h2 className="text-xl lg:text-2xl font-bold mb-4">Search</h2>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs, artists..."
                    className="pl-9 h-10 bg-secondary border-0"
                  />
                </div>
                
                <ScrollArea className="flex-1">
                  {!searchQuery ? (
                    <div className="space-y-1">
                      {sampleTracks.slice(0, 50).map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, sampleTracks); setCurrentView("playing"); }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                        >
                          <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:block">{formatDuration(track.duration)}</span>
                        </button>
                      ))}
                    </div>
                  ) : filteredTracks.length > 0 ? (
                    <div className="space-y-1">
                      {filteredTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, sampleTracks); setCurrentView("playing"); }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                        >
                          <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:block">{formatDuration(track.duration)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No results for "{searchQuery}"</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            
            {/* Liked Songs View */}
            {currentView === "liked" && (
              <div className="p-4 lg:p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold">Liked Songs</h2>
                  <p className="text-sm text-muted-foreground">{likedTracks.length} songs</p>
                </div>
                
                {likedTracks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <Heart className="h-12 w-12 mb-4 opacity-50" />
                    <p>No liked songs yet</p>
                    <p className="text-sm mt-1">Tap the heart to like songs</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-1">
                      {likedTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, likedTracks); setCurrentView("playing"); }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                        >
                          <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <Heart className="h-4 w-4 text-primary shrink-0" fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Gestures View (Mobile only) */}
            {currentView === "gestures" && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentView("playing")}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-lg font-bold">Gesture Controls</h2>
                </div>
                
                <Tabs value={gestureMode} onValueChange={(v) => setGestureMode(v as "hand" | "mouse")} className="flex-1 flex flex-col">
                  <div className="px-4 py-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="mouse" className="flex-1 gap-2">
                        <MousePointer className="h-4 w-4" />
                        Touch
                      </TabsTrigger>
                      <TabsTrigger value="hand" className="flex-1 gap-2">
                        <Hand className="h-4 w-4" />
                        Camera
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="mouse" className="flex-1 m-0">
                    <GestureControls 
                      onGesture={handleGesture} 
                      isPlaying={player.isPlaying}
                      isLiked={player.isLiked}
                      isMuted={player.isMuted}
                    />
                  </TabsContent>
                  
                  <TabsContent value="hand" className="flex-1 m-0">
                    <HandTracking 
                      onGesture={handleGesture}
                      isPlaying={player.isPlaying}
                      isLiked={player.isLiked}
                      isMuted={player.isMuted}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>

        {/* Desktop Gesture Panel - Collapsible */}
        <aside className={cn(
          "hidden lg:flex flex-col border-l border-border bg-card transition-all duration-300 shrink-0",
          showGesturePanel ? "w-72 xl:w-80" : "w-12"
        )}>
          {showGesturePanel ? (
            <>
              {/* Gesture Feedback Overlay */}
              {activeGesture && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                  <div className="px-6 py-3 rounded-full bg-primary/90 text-primary-foreground font-medium animate-pulse">
                    {activeGesture.replace("-", " ").toUpperCase()}
                  </div>
                </div>
              )}
              
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Gestures</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowGesturePanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs value={gestureMode} onValueChange={(v) => setGestureMode(v as "hand" | "mouse")} className="flex-1 flex flex-col">
                <div className="px-3 py-2">
                  <TabsList className="w-full h-9">
                    <TabsTrigger value="mouse" className="flex-1 gap-1.5 text-xs">
                      <MousePointer className="h-3.5 w-3.5" />
                      Mouse
                    </TabsTrigger>
                    <TabsTrigger value="hand" className="flex-1 gap-1.5 text-xs">
                      <Hand className="h-3.5 w-3.5" />
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
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="h-full w-full flex flex-col items-center justify-center gap-2"
              onClick={() => setShowGesturePanel(true)}
            >
              <Hand className="h-5 w-5" />
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Index;
