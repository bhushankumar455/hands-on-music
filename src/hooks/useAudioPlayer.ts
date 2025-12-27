import { useState, useRef, useEffect, useCallback } from "react";
import { Track, sampleTracks } from "@/data/sampleTracks";

interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  queue: Track[];
  queueIndex: number;
  isLiked: boolean;
  likedTracks: Set<string>;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTrack: sampleTracks[0],
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isShuffled: false,
    repeatMode: "off",
    queue: sampleTracks,
    queueIndex: 0,
    isLiked: false,
    likedTracks: new Set(),
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  // Load track when it changes
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      audioRef.current.src = state.currentTrack.audioUrl;
      audioRef.current.load();
      if (state.isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [state.currentTrack?.id]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
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
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
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
      };
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
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
      };
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setState(prev => ({ 
        ...prev, 
        volume, 
        isMuted: volume === 0 
      }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !state.isMuted;
      audioRef.current.volume = newMuted ? 0 : state.volume;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
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

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    setState(prev => {
      const newQueue = queue || prev.queue;
      const newIndex = newQueue.findIndex(t => t.id === track.id);
      
      return {
        ...prev,
        currentTrack: track,
        queue: newQueue,
        queueIndex: newIndex >= 0 ? newIndex : 0,
        isPlaying: true,
        isLiked: prev.likedTracks.has(track.id),
      };
    });
    
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  }, []);

  return {
    ...state,
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
  };
}