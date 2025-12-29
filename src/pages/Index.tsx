import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { NowPlaying } from "@/components/player/NowPlaying";
import { GestureControls } from "@/components/gesture/GestureControls";
import { HandTracking } from "@/components/gesture/HandTracking";
import { SleepTimer } from "@/components/player/SleepTimer";
import { SpeedControl } from "@/components/player/SpeedControl";
import { KeyboardShortcutsHelp } from "@/components/player/KeyboardShortcutsHelp";
import { AmbientBackground } from "@/components/player/AmbientBackground";
import { EqualizerPanel, presets } from "@/components/player/EqualizerPanel";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { CrossfadeControl } from "@/components/player/CrossfadeControl";
import { MusicUpload } from "@/components/player/MusicUpload";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { sampleTracks, samplePlaylists, Track } from "@/data/sampleTracks";
import { Play, ListMusic, Hand, MousePointer, Search, Heart, List, Disc3, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type View = "playing" | "playlists" | "queue" | "search" | "liked" | "gestures";

const Index = () => {
  const player = useAudioPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType>(null);
  const [currentView, setCurrentView] = useState<View>("playing");
  const [searchQuery, setSearchQuery] = useState("");
  const [gestureMode, setGestureMode] = useState<"hand" | "mouse">("mouse");
  const [showGesturePanel, setShowGesturePanel] = useState(true);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);

  const allTracks = [...uploadedTracks, ...sampleTracks];

  const handleTrackAdded = (track: Track) => {
    setUploadedTracks(prev => [track, ...prev]);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlay: player.togglePlay,
    onNext: player.next,
    onPrevious: player.previous,
    onVolumeUp: () => player.setVolume(Math.min(1, player.volume + 0.1)),
    onVolumeDown: () => player.setVolume(Math.max(0, player.volume - 0.1)),
    onToggleMute: player.toggleMute,
    onToggleLike: player.toggleLike,
    onToggleShuffle: player.toggleShuffle,
  });

  const handleGesture = useCallback((gesture: GestureType) => {
    if (!gesture) return;
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 800);

    switch (gesture) {
      case "tap": player.togglePlay(); break;
      case "pointing": player.play(); break;
      case "open-palm": player.pause(); break;
      case "swipe-left": player.previous(); break;
      case "swipe-right": player.next(); break;
      case "swipe-up": player.setVolume(Math.min(1, player.volume + 0.15)); break;
      case "swipe-down": player.setVolume(Math.max(0, player.volume - 0.15)); break;
      case "double-tap": player.toggleLike(); break;
      case "pinch": player.toggleMute(); break;
      case "thumbs-up": if (!player.isLiked) player.toggleLike(); break;
    }
  }, [player]);

  const filteredTracks = searchQuery.trim() 
    ? allTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const likedTracks = player.getLikedTracks();

  const navItems = [
    { id: "playing" as View, icon: Disc3, label: "Playing" },
    { id: "search" as View, icon: Search, label: "Search" },
    { id: "playlists" as View, icon: ListMusic, label: "Library" },
    { id: "liked" as View, icon: Heart, label: "Liked" },
    { id: "gestures" as View, icon: Hand, label: "Gesture" },
  ];

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-background text-foreground dark flex flex-col relative">
      {/* Ambient Background */}
      <AmbientBackground 
        coverUrl={player.currentTrack?.coverUrl} 
        isPlaying={player.isPlaying}
        audioData={player.audioData}
      />
      
      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Tablet/Desktop Sidebar */}
        <aside className="w-48 md:w-56 bg-background hidden md:flex flex-col shrink-0">
          <div className="p-3 md:p-4 pt-4 md:pt-5">
            <h1 className="text-base md:text-lg font-bold text-primary flex items-center gap-2">
              <Disc3 className="h-5 w-5" />
              <span className="hidden lg:inline">AIMusicPlay</span>
              <span className="lg:hidden">AMP</span>
            </h1>
          </div>
          
          <nav className="flex-1 px-2 md:px-3 space-y-0.5">
            {navItems.filter(n => n.id !== "gestures").map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={cn(
                  "nav-item w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium",
                  currentView === id 
                    ? "bg-primary/15 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>

          {/* Queue shortcut */}
          <div className="px-2 md:px-3 mb-2">
            <button
              onClick={() => setCurrentView("queue")}
              className={cn(
                "nav-item w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium",
                currentView === "queue" 
                  ? "bg-primary/15 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <List className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
              <span className="truncate">Queue</span>
              <span className="ml-auto text-[10px] md:text-xs bg-secondary px-1.5 md:px-2 py-0.5 rounded-full">
                {player.queue.length}
              </span>
            </button>
          </div>

          {/* Mini Player */}
          {player.currentTrack && (
            <div className="p-2 md:p-3 mt-auto">
              <button 
                onClick={() => setCurrentView("playing")}
                className="w-full flex items-center gap-2 p-1.5 md:p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <img 
                  src={player.currentTrack.coverUrl} 
                  alt="" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover shrink-0" 
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate text-xs md:text-sm">{player.currentTrack.title}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{player.currentTrack.artist}</p>
                </div>
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-auto scrollbar-hide pb-20 md:pb-0">
            {/* Now Playing */}
            {currentView === "playing" && (
              <div className="h-full animate-fade-in relative">
                {/* Extra controls bar */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-0.5 sm:gap-1 z-10">
                  <EqualizerPanel
                    bands={player.eqBands}
                    onBandChange={player.setEQBand}
                    onPresetChange={(preset) => player.setEQPreset(preset.name, preset.bands)}
                    activePreset={player.activeEQPreset}
                  />
                  <CrossfadeControl
                    duration={player.crossfadeDuration}
                    enabled={player.crossfadeEnabled}
                    onDurationChange={player.setCrossfadeDuration}
                    onToggle={player.toggleCrossfade}
                  />
                  <SpeedControl 
                    speed={player.playbackSpeed} 
                    onSpeedChange={player.setPlaybackSpeed} 
                  />
                  <SleepTimer 
                    onTimerEnd={player.pause} 
                    isPlaying={player.isPlaying} 
                  />
                  <KeyboardShortcutsHelp />
                </div>
                
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
                  audioData={player.audioData}
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
            
            {/* Playlists */}
            {currentView === "playlists" && (
              <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">Your Library</h2>
                
                {/* Upload Section */}
                <div className="mb-6">
                  <MusicUpload onTrackAdded={handleTrackAdded} />
                </div>

                {/* Uploaded Tracks */}
                {uploadedTracks.length > 0 && (
                  <>
                    <h3 className="text-lg sm:text-xl font-bold mt-6 mb-3">Your Uploads</h3>
                    <div className="space-y-1 mb-6">
                      {uploadedTracks.map((track, index) => (
                        <button
                          key={track.id}
                          onClick={() => { player.playTrack(track, allTracks); setCurrentView("playing"); }}
                          className="track-item w-full flex items-center gap-3 p-2.5 rounded-xl text-left"
                        >
                          <span className="w-5 text-center text-xs text-muted-foreground">{index + 1}</span>
                          <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <span className="text-xs text-primary">Uploaded</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <h3 className="text-lg sm:text-xl font-bold mb-3">Playlists</h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {samplePlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => { 
                        player.playTrack(playlist.tracks[0], playlist.tracks); 
                        setCurrentView("playing"); 
                      }}
                      className="group relative overflow-hidden rounded-2xl aspect-square bg-secondary play-button"
                    >
                      <img 
                        src={playlist.coverUrl} 
                        alt={playlist.name}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-bold text-sm text-white truncate">{playlist.name}</h3>
                        <p className="text-xs text-white/60">{playlist.tracks.length} tracks</p>
                      </div>
                      <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="h-4 w-4 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* All Tracks Section */}
                <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4">All Tracks</h3>
                <div className="space-y-1">
                  {sampleTracks.slice(0, 20).map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => { player.playTrack(track, allTracks); setCurrentView("playing"); }}
                      className="track-item w-full flex items-center gap-3 p-2.5 rounded-xl text-left"
                    >
                      <span className="w-5 text-center text-xs text-muted-foreground">{index + 1}</span>
                      <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Queue */}
            {currentView === "queue" && (
              <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Queue</h2>
                <p className="text-sm text-muted-foreground mb-5">{player.queue.length} tracks</p>
                
                <div className="space-y-1">
                  {player.queue.map((track, index) => (
                    <button
                      key={track.id + "-" + index}
                      onClick={() => player.playTrack(track)}
                      className={cn(
                        "track-item w-full flex items-center gap-3 p-2.5 rounded-xl text-left",
                        index === player.queueIndex && "bg-primary/10"
                      )}
                    >
                      <span className="w-5 text-center text-xs text-muted-foreground">
                        {index === player.queueIndex && player.isPlaying ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <div className="w-0.5 h-2 bg-primary animate-pulse" />
                            <div className="w-0.5 h-3 bg-primary animate-pulse" />
                          </div>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", index === player.queueIndex && "text-primary")}>
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search */}
            {currentView === "search" && (
              <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">Search</h2>
                
                <div className="relative mb-5">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Songs, artists, albums..."
                    className="pl-10 h-11 bg-secondary border-0 rounded-xl text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  {(searchQuery ? filteredTracks : allTracks.slice(0, 30)).map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => { player.playTrack(track, allTracks); setCurrentView("playing"); }}
                      className="track-item w-full flex items-center gap-3 p-2.5 rounded-xl text-left"
                    >
                      <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                  
                  {searchQuery && filteredTracks.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No results for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Liked */}
            {currentView === "liked" && (
              <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Liked Songs</h2>
                <p className="text-sm text-muted-foreground mb-5">{likedTracks.length} tracks</p>
                
                {likedTracks.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No liked songs yet</p>
                    <p className="text-sm mt-1">Tap the heart icon to save songs</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {likedTracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => { player.playTrack(track, likedTracks); setCurrentView("playing"); }}
                        className="track-item w-full flex items-center gap-3 p-2.5 rounded-xl text-left"
                      >
                        <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <Heart className="h-4 w-4 text-primary shrink-0" fill="currentColor" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gestures */}
            {currentView === "gestures" && (
              <div className="h-full flex flex-col animate-fade-in">
                <div className="p-3 sm:p-4 md:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">Gesture Controls</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Control music with gestures</p>
                </div>
                
                <Tabs value={gestureMode} onValueChange={(v) => setGestureMode(v as "hand" | "mouse")} className="flex-1 flex flex-col px-3 sm:px-4 md:px-6">
                  <TabsList className="w-full max-w-xs h-10 mb-4">
                    <TabsTrigger value="mouse" className="flex-1 gap-2 text-sm">
                      <MousePointer className="h-4 w-4" />
                      Touch
                    </TabsTrigger>
                    <TabsTrigger value="hand" className="flex-1 gap-2 text-sm">
                      <Hand className="h-4 w-4" />
                      Camera
                    </TabsTrigger>
                  </TabsList>
                  
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
        </div>

        {/* Desktop Gesture Panel - only on large screens */}
        <aside className={cn(
          "hidden lg:flex flex-col bg-card/50 transition-all duration-300 shrink-0 relative",
          showGesturePanel ? "w-64 xl:w-72" : "w-0"
        )}>
          {showGesturePanel && (
            <>
              {activeGesture && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/20">
                  <div className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg">
                    {activeGesture.replace("-", " ").toUpperCase()}
                  </div>
                </div>
              )}
              
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-semibold">Gestures</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowGesturePanel(false)}
                >
                  ×
                </Button>
              </div>
              
              <Tabs value={gestureMode} onValueChange={(v) => setGestureMode(v as "hand" | "mouse")} className="flex-1 flex flex-col">
                <div className="px-4">
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
          )}
          
          {!showGesturePanel && (
            <Button 
              variant="ghost" 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full h-12 w-8 rounded-l-lg rounded-r-none bg-card/80"
              onClick={() => setShowGesturePanel(true)}
            >
              <Hand className="h-4 w-4" />
            </Button>
          )}
        </aside>
      </main>

      {/* Mini Player - appears when not on "playing" view */}
      {currentView !== "playing" && player.currentTrack && (
        <div className="md:hidden">
          <MiniPlayer
            currentTrack={player.currentTrack}
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            onTogglePlay={player.togglePlay}
            onNext={player.next}
            onPrevious={player.previous}
            onExpand={() => setCurrentView("playing")}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-card/95 backdrop-blur-xl safe-bottom shrink-0">
        <div className="flex justify-around py-1.5 sm:py-2 px-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={cn(
                "nav-item flex flex-col items-center gap-0.5 py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl min-w-[48px] sm:min-w-[56px]",
                currentView === id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", currentView === id && id === "liked" && "fill-current")} />
              <span className="text-[9px] sm:text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
