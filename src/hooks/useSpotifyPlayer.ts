import { useState, useCallback, useRef } from "react";
import { SpotifyTrack, allSpotifyTracks, hindiTracks } from "@/data/spotifyTracks";

export function useSpotifyPlayer() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(hindiTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<SpotifyTrack[]>(hindiTracks);
  const [queueIndex, setQueueIndex] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isLiked = currentTrack ? likedTracks.has(currentTrack.id) : false;

  const toggleLike = useCallback(() => {
    if (!currentTrack) return;
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentTrack.id)) {
        newSet.delete(currentTrack.id);
      } else {
        newSet.add(currentTrack.id);
      }
      return newSet;
    });
  }, [currentTrack]);

  const getLikedTracks = useCallback(() => {
    return allSpotifyTracks.filter(track => likedTracks.has(track.id));
  }, [likedTracks]);

  const playTrack = useCallback((track: SpotifyTrack, newQueue?: SpotifyTrack[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(newQueue.findIndex(t => t.id === track.id));
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex: number;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (repeatMode === "one") {
      nextIndex = queueIndex;
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    
    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  }, [queue, queueIndex, isShuffled, repeatMode]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;
    
    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  }, [queue, queueIndex]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  return {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isLiked,
    queue,
    queueIndex,
    iframeRef,
    
    playTrack,
    togglePlay,
    pause,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    getLikedTracks,
  };
}
