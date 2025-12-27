import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SpotifyTrack, allSpotifyTracks, hindiTracks } from "@/data/spotifyTracks";

type RepeatMode = "off" | "all" | "one";

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { width: string | number; height: string | number; uri: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
};

type SpotifyEmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume?: (volume: number) => void;
  getVolume?: () => number;
  seek?: (positionMs: number) => void;
  addListener: (event: string, cb: (e: any) => void) => void;
  destroy?: () => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyIframeApi?: SpotifyIFrameAPI;
  }
}

const SPOTIFY_IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

let spotifyIframeApiPromise: Promise<SpotifyIFrameAPI> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.__spotifyIframeApi) return Promise.resolve(window.__spotifyIframeApi);
  if (spotifyIframeApiPromise) return spotifyIframeApiPromise;

  spotifyIframeApiPromise = new Promise((resolve) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyIframeApi = api;
      previous?.(api);
      resolve(api);
    };

    // Inject script once
    if (!document.querySelector(`script[src=\"${SPOTIFY_IFRAME_API_SRC}\"]`)) {
      const script = document.createElement("script");
      script.src = SPOTIFY_IFRAME_API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return spotifyIframeApiPromise;
}

export function useSpotifyPlayer() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(hindiTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<SpotifyTrack[]>(hindiTracks);
  const [queueIndex, setQueueIndex] = useState(0);

  const embedRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const lastNonZeroVolumeRef = useRef(0.7);

  const isLiked = currentTrack ? likedTracks.has(currentTrack.id) : false;

  const currentSpotifyUri = useMemo(() => {
    if (!currentTrack) return null;
    return `spotify:track:${currentTrack.spotifyUri}`;
  }, [currentTrack]);

  const initController = useCallback(async () => {
    if (!embedRef.current || !currentSpotifyUri) return;

    const api = await loadSpotifyIframeApi();

    // Clear container before recreating controller
    embedRef.current.innerHTML = "";

    api.createController(
      embedRef.current,
      {
        width: "100%",
        height: 152,
        uri: currentSpotifyUri,
      },
      (controller) => {
        controllerRef.current = controller;

        const applyVolume = () => {
          try {
            controller.setVolume?.(isMuted ? 0 : volume);
          } catch {
            // Some embed versions don't expose setVolume; ignore.
          }
        };

        controller.addListener("playback_update", (e: any) => {
          // Known fields per Spotify docs: position (ms), duration (ms), isPaused (bool)
          const paused = !!e?.data?.isPaused;
          setIsPlaying(!paused);
        });

        // Apply current volume when ready (and try once immediately)
        controller.addListener("ready", applyVolume);
        applyVolume();
      }
    );
  }, [currentSpotifyUri, isMuted, volume]);

  useEffect(() => {
    // Create / recreate controller whenever the selected track changes
    // (embed API cannot be safely controlled via ref on React component)
    initController();
  }, [initController]);

  const toggleLike = useCallback(() => {
    if (!currentTrack) return;
    setLikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(currentTrack.id)) next.delete(currentTrack.id);
      else next.add(currentTrack.id);
      return next;
    });
  }, [currentTrack]);

  const getLikedTracks = useCallback(() => {
    return allSpotifyTracks.filter((track) => likedTracks.has(track.id));
  }, [likedTracks]);

  const playTrack = useCallback((track: SpotifyTrack, newQueue?: SpotifyTrack[]) => {
    setCurrentTrack(track);
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(Math.max(0, newQueue.findIndex((t) => t.id === track.id)));
    } else {
      setQueueIndex((prev) => prev); // keep existing
    }

    // If controller already exists, load immediately; otherwise initController will run
    controllerRef.current?.loadUri(`spotify:track:${track.spotifyUri}`);
  }, []);

  const togglePlay = useCallback(() => {
    controllerRef.current?.togglePlay();
  }, []);

  const pause = useCallback(() => {
    controllerRef.current?.pause();
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
    const track = queue[nextIndex];
    setCurrentTrack(track);
    controllerRef.current?.loadUri(`spotify:track:${track.spotifyUri}`);
  }, [queue, queueIndex, isShuffled, repeatMode]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;

    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    const track = queue[prevIndex];
    setCurrentTrack(track);
    controllerRef.current?.loadUri(`spotify:track:${track.spotifyUri}`);
  }, [queue, queueIndex]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);

    if (clamped > 0) {
      lastNonZeroVolumeRef.current = clamped;
      setIsMuted(false);
    }

    controllerRef.current?.setVolume?.(isMuted ? 0 : clamped);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const targetVol = next ? 0 : (volume > 0 ? volume : lastNonZeroVolumeRef.current);
      controllerRef.current?.setVolume?.(targetVol);
      return next;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
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
    embedRef,

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
