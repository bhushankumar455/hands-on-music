import { useState, useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { NowPlaying } from "@/components/player/NowPlaying";
import { GestureControls, GestureType } from "@/components/gesture/GestureControls";
import { GestureFeedback } from "@/components/gesture/GestureFeedback";
import { samplePlaylists, Track } from "@/data/sampleTracks";
import { Play, Music, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const player = useAudioPlayer();
  const [activeGesture, setActiveGesture] = useState<GestureType | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleGesture = useCallback((gesture: GestureType) => {
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 100);

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
        player.setVolume(Math.min(1, player.volume + 0.1));
        break;
      case "swipe-down":
        player.setVolume(Math.max(0, player.volume - 0.1));
        break;
      case "double-tap":
        player.toggleLike();
        break;
      case "pinch":
        player.toggleMute();
        break;
    }
  }, [player]);

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <GestureFeedback gesture={activeGesture} />
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
              <Music className="h-6 w-6" />
              GesturePlay
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setShowPlaylist(false)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                !showPlaylist ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              )}
            >
              <Play className="h-5 w-5" />
              Now Playing
            </button>
            <button 
              onClick={() => setShowPlaylist(true)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                showPlaylist ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              )}
            >
              <ListMusic className="h-5 w-5" />
              Playlists
            </button>
          </nav>

          {/* Mini Player */}
          {player.currentTrack && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <img 
                  src={player.currentTrack.coverUrl} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{player.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{player.currentTrack.artist}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Now Playing / Playlist Section */}
          <div className="flex-1 overflow-auto">
            {showPlaylist ? (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Playlists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {samplePlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        player.playTrack(playlist.tracks[0], playlist.tracks);
                        setShowPlaylist(false);
                      }}
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
            ) : (
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
          </div>

          {/* Gesture Controls Panel */}
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/50">
            <GestureControls
              onGesture={handleGesture}
              isPlaying={player.isPlaying}
              isLiked={player.isLiked}
              isMuted={player.isMuted}
            />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Index;