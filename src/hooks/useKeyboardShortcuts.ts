import { useEffect, useCallback } from "react";

interface KeyboardShortcutsProps {
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleMute: () => void;
  onToggleLike: () => void;
  onToggleShuffle: () => void;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onNext,
  onPrevious,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  onToggleLike,
  onToggleShuffle,
}: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          onTogglePlay();
          break;
        case "ArrowRight":
          if (event.shiftKey) {
            onNext();
          }
          break;
        case "ArrowLeft":
          if (event.shiftKey) {
            onPrevious();
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          onVolumeUp();
          break;
        case "ArrowDown":
          event.preventDefault();
          onVolumeDown();
          break;
        case "KeyM":
          onToggleMute();
          break;
        case "KeyL":
          onToggleLike();
          break;
        case "KeyS":
          onToggleShuffle();
          break;
      }
    },
    [onTogglePlay, onNext, onPrevious, onVolumeUp, onVolumeDown, onToggleMute, onToggleLike, onToggleShuffle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const KEYBOARD_SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "Shift + →", action: "Next Track" },
  { key: "Shift + ←", action: "Previous Track" },
  { key: "↑", action: "Volume Up" },
  { key: "↓", action: "Volume Down" },
  { key: "M", action: "Mute / Unmute" },
  { key: "L", action: "Like Track" },
  { key: "S", action: "Shuffle" },
];
