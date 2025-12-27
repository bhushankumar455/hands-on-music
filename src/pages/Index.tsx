import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { NowPlaying } from "@/components/player/NowPlaying";
import { GestureControls } from "@/components/gesture/GestureControls";
import { HandTracking } from "@/components/gesture/HandTracking";
import { GestureFeedback } from "@/components/gesture/GestureFeedback";
import { QueueView } from "@/components/player/QueueView";
import { SearchView } from "@/components/player/SearchView";
import { LikedTracksView } from "@/components/player/LikedTracksView";
import { AudioVisualizer } from "@/components/player/AudioVisualizer";
import { samplePlaylists } from "@/data/sampleTracks";
import { Play, Music, ListMusic, Hand, MousePointer, Search, Heart, List, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GestureType } from "@/hooks/useHandTracking";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type View = "playing" | "playlists" | "queue" | "search" | "liked";

const Index = () => {
  const player = useAudioPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType>(null);
  const [currentView, setCurrentView] = useState<View>("playing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGesture = useCallback((gesture: GestureType) => {
    if (!gesture) return;
    
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 100);

    switch (gesture) {
      case "tap":
        player.togglePlay();
        break;
      case "swipe-left":
        player.previous();
        toast({ title: "Previous Track", description: player.currentTrack?.title });
        break;
      case "swipe-right":
        player.next();
        toast({ title: "Next Track" });
        break;
      case "swipe-up":
        player.setVolume(Math.min(1, player.volume + 0.15));
        toast({ title: "Volume Up", description: `${Math.round(player.volume * 100)}%` });
        break;
      case "swipe-down":
        player.setVolume(Math.max(0, player.volume - 0.15));
        toast({ title: "Volume Down", description: `${Math.round(player.volume * 100)}%` });
        break;
      case "double-tap":
        player.toggleLike();
        toast({ title: player.isLiked ? "Removed from Liked" : "Added to Liked" });
        break;
      case "pinch":
        player.toggleMute();
        toast({ title: player.isMuted ? "Unmuted" : "Muted" });
        break;
      case "open-palm":
        player.pause();
        break;
      case "thumbs-up":
        if (!player.isLiked) player.toggleLike();
        toast({ title: "👍 Great choice!" });
        break;
    }
  }, [player]);

  const navItems = [
    { id: "playing" as View, icon: Play, label: "Now Playing" },
    { id: "playlists" as View, icon: ListMusic, label: "Playlists" },
    { id: "queue" as View, icon: List, label: "Queue" },
    { id: "search" as View, icon: Search, label: "Search" },
    { id: "liked" as View, icon: Heart, label: "Liked Songs" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <GestureFeedback gesture={activeGesture} />
      
      <div className="flex h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
            <Music className="h-5 w-5" />
            GesturePlay
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
            <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
              <Music className="h-6 w-6" />
              GesturePlay
            </h1>
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

          {/* Mini Player with Visualizer */}
          {player.currentTrack && (
            <div className="p-4 border-t border-border space-y-3">
              <AudioVisualizer audioData={player.audioData} isPlaying={player.isPlaying} />
              <div className="flex items-center gap-3">
                <img src={player.currentTrack.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{player.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{player.currentTrack.artist}</p>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {samplePlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => { player.playTrack(playlist.tracks[0], playlist.tracks); setCurrentView("playing"); }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-secondary transition-colors text-left"
                    >
                      <img src={playlist.coverUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h3 className="font-semibold">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground">{playlist.tracks.length} tracks</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentView === "queue" && (
              <QueueView
                queue={player.queue}
                currentIndex={player.queueIndex}
                onPlayTrack={(track) => player.playTrack(track)}
                onRemoveFromQueue={player.removeFromQueue}
              />
            )}
            {currentView === "search" && (
              <SearchView onPlayTrack={player.playTrack} onAddToQueue={player.addToQueue} />
            )}
            {currentView === "liked" && (
              <LikedTracksView likedTracks={player.getLikedTracks()} onPlayTrack={player.playTrack} />
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
                  <MousePointer className="h-4 w-4 mr-2" />Simulate
                </TabsTrigger>
              </TabsList>
              <TabsContent value="camera" className="flex-1 mt-0 overflow-hidden">
                <HandTracking onGesture={handleGesture} isPlaying={player.isPlaying} isLiked={player.isLiked} isMuted={player.isMuted} />
              </TabsContent>
              <TabsContent value="simulate" className="flex-1 mt-0 overflow-hidden">
                <GestureControls onGesture={handleGesture} isPlaying={player.isPlaying} isLiked={player.isLiked} isMuted={player.isMuted} />
              </TabsContent>
            </Tabs>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Index;