import { useState, useRef, useCallback } from "react";
import { YouTubeTrack, allYouTubeTracks } from "@/data/youtubeTracks";

interface YouTubePlayerState {
  isPlaying: boolean;
  currentTrack: YouTubeTrack | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  queue: YouTubeTrack[];
  queueIndex: number;
  isLiked: boolean;
  likedTracks: Set<string>;
  recentlyPlayed: YouTubeTrack[];
  isReady: boolean;
}

export function useYouTubePlayer() {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<YouTubePlayerState>({
    isPlaying: false,
    currentTrack: allYouTubeTracks[0],
    currentTime: 0,
    duration: 0,
    volume: 70,
    isMuted: false,
    isShuffled: false,
    repeatMode: "off",
    queue: allYouTubeTracks,
    queueIndex: 0,
    isLiked: false,
    likedTracks: new Set(),
    recentlyPlayed: [],
    isReady: false,
  });

  const setPlayerRef = useCallback((player: any) => {
    playerRef.current = player;
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const duration = playerRef.current.getDuration() || 0;
        setState(prev => ({ ...prev, currentTime, duration }));
      }
    }, 1000);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const onReady = useCallback((event: any) => {
    playerRef.current = event.target;
    event.target.setVolume(state.volume);
    setState(prev => ({ ...prev, isReady: true }));
  }, [state.volume]);

  const onStateChange = useCallback((event: any) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === 1) {
      setState(prev => ({ ...prev, isPlaying: true }));
      startProgressTracking();
    } else if (event.data === 2) {
      setState(prev => ({ ...prev, isPlaying: false }));
      stopProgressTracking();
    } else if (event.data === 0) {
      // Video ended
      stopProgressTracking();
      handleNext();
    }
  }, [startProgressTracking, stopProgressTracking]);

  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const handleNext = useCallback(() => {
    setState(prev => {
      let nextIndex: number;
      
      if (prev.repeatMode === "one") {
        if (playerRef.current) {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
        }
        return prev;
      }
      
      if (prev.isShuffled) {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else {
        nextIndex = (prev.queueIndex + 1) % prev.queue.length;
      }

      const nextTrack = prev.queue[nextIndex];
      return {
        ...prev,
        queueIndex: nextIndex,
        currentTrack: nextTrack,
        isLiked: prev.likedTracks.has(nextTrack.id),
        currentTime: 0,
      };
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (playerRef.current && playerRef.current.getCurrentTime() > 3) {
      playerRef.current.seekTo(0);
      return;
    }

    setState(prev => {
      const prevIndex = prev.queueIndex === 0 
        ? prev.queue.length - 1 
        : prev.queueIndex - 1;
      const prevTrack = prev.queue[prevIndex];
      
      return {
        ...prev,
        queueIndex: prevIndex,
        currentTrack: prevTrack,
        isLiked: prev.likedTracks.has(prevTrack.id),
        currentTime: 0,
      };
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const vol = Math.round(volume * 100);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
    setState(prev => ({ 
      ...prev, 
      volume: vol, 
      isMuted: vol === 0 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (state.isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(state.volume);
      } else {
        playerRef.current.mute();
      }
    }
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted, state.volume]);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(prev => {
      const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  const toggleLike = useCallback(() => {
    setState(prev => {
      if (!prev.currentTrack) return prev;
      
      const newLikedTracks = new Set(prev.likedTracks);
      if (prev.isLiked) {
        newLikedTracks.delete(prev.currentTrack.id);
      } else {
        newLikedTracks.add(prev.currentTrack.id);
      }
      
      return {
        ...prev,
        isLiked: !prev.isLiked,
        likedTracks: newLikedTracks,
      };
    });
  }, []);

  const playTrack = useCallback((track: YouTubeTrack, queue?: YouTubeTrack[]) => {
    setState(prev => {
      const newQueue = queue || prev.queue;
      const newIndex = newQueue.findIndex(t => t.id === track.id);
      
      const newRecent = [track, ...prev.recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 10);
      
      return {
        ...prev,
        currentTrack: track,
        queue: newQueue,
        queueIndex: newIndex >= 0 ? newIndex : 0,
        isPlaying: true,
        isLiked: prev.likedTracks.has(track.id),
        currentTime: 0,
        recentlyPlayed: newRecent,
      };
    });
  }, []);

  const addToQueue = useCallback((track: YouTubeTrack) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
      queueIndex: index < prev.queueIndex ? prev.queueIndex - 1 : prev.queueIndex,
    }));
  }, []);

  const getLikedTracks = useCallback(() => {
    return allYouTubeTracks.filter(track => state.likedTracks.has(track.id));
  }, [state.likedTracks]);

  return {
    ...state,
    volume: state.volume / 100, // Normalize to 0-1 for UI
    setPlayerRef,
    onReady,
    onStateChange,
    play,
    pause,
    togglePlay,
    next: handleNext,
    previous: handlePrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    playTrack,
    addToQueue,
    removeFromQueue,
    getLikedTracks,
  };
}