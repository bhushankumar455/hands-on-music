import { useRef, useEffect, useState, useCallback } from "react";
import { Hands, Results as HandResults } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export type GestureType = 
  | "swipe-left" 
  | "swipe-right" 
  | "tap" 
  | "swipe-up" 
  | "swipe-down" 
  | "double-tap" 
  | "pinch"
  | "open-palm"
  | "thumbs-up"
  | "pointing"
  | null;

interface HandPosition {
  x: number;
  y: number;
}

interface GestureZone {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseHandTrackingReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  gesture: GestureType;
  handPosition: HandPosition | null;
  confidence: number;
  currentZone: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

// Gesture zones for visual feedback
const GESTURE_ZONES: GestureZone[] = [
  { name: "left", x: 0, y: 0.2, width: 0.25, height: 0.6 },
  { name: "right", x: 0.75, y: 0.2, width: 0.25, height: 0.6 },
  { name: "top", x: 0.25, y: 0, width: 0.5, height: 0.25 },
  { name: "bottom", x: 0.25, y: 0.75, width: 0.5, height: 0.25 },
  { name: "center", x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
];

export function useHandTracking(onGesture: (gesture: GestureType) => void): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gesture, setGesture] = useState<GestureType>(null);
  const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  
  // Gesture detection state with smoothing
  const gestureHistoryRef = useRef<HandPosition[]>([]);
  const lastGestureTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const fingerStatesRef = useRef<boolean[]>([]);
  const smoothedPositionRef = useRef<HandPosition | null>(null);
  const velocityRef = useRef<HandPosition>({ x: 0, y: 0 });
  const gestureConfidenceRef = useRef<Map<GestureType, number>>(new Map());

  // Smoothing factor for position (0-1, higher = smoother but more lag)
  const SMOOTHING = 0.3;
  const SWIPE_VELOCITY_THRESHOLD = 0.008;
  const SWIPE_MIN_DISTANCE = 0.12;
  const GESTURE_COOLDOWN = 600;

  const getZone = useCallback((x: number, y: number): string | null => {
    for (const zone of GESTURE_ZONES) {
      if (x >= zone.x && x <= zone.x + zone.width && 
          y >= zone.y && y <= zone.y + zone.height) {
        return zone.name;
      }
    }
    return null;
  }, []);

  const smoothPosition = useCallback((current: HandPosition): HandPosition => {
    if (!smoothedPositionRef.current) {
      smoothedPositionRef.current = current;
      return current;
    }
    
    const smoothed = {
      x: smoothedPositionRef.current.x + SMOOTHING * (current.x - smoothedPositionRef.current.x),
      y: smoothedPositionRef.current.y + SMOOTHING * (current.y - smoothedPositionRef.current.y),
    };
    
    // Calculate velocity
    velocityRef.current = {
      x: current.x - smoothedPositionRef.current.x,
      y: current.y - smoothedPositionRef.current.y,
    };
    
    smoothedPositionRef.current = smoothed;
    return smoothed;
  }, []);

  const isFingerExtended = useCallback((landmarks: any[], fingerTip: number, fingerMcp: number): boolean => {
    const tip = landmarks[fingerTip];
    const mcp = landmarks[fingerMcp];
    const wrist = landmarks[0];
    
    // More accurate: compare tip to mcp relative to wrist
    const tipDist = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
    const mcpDist = Math.sqrt(Math.pow(mcp.x - wrist.x, 2) + Math.pow(mcp.y - wrist.y, 2));
    
    return tipDist > mcpDist * 1.1;
  }, []);

  const detectGesture = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    const now = Date.now();
    const timeSinceLastGesture = now - lastGestureTimeRef.current;

    // Key landmarks
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMcp = landmarks[5];
    const palmCenter = landmarks[9];

    // Smooth the index tip position for cursor
    const rawPos = { x: indexTip.x, y: indexTip.y };
    const smoothedPos = smoothPosition(rawPos);
    setHandPosition(smoothedPos);

    // Detect current zone
    const zone = getZone(1 - smoothedPos.x, smoothedPos.y); // Mirror X
    setCurrentZone(zone);

    // Store position history for swipe detection
    gestureHistoryRef.current.push(rawPos);
    if (gestureHistoryRef.current.length > 15) {
      gestureHistoryRef.current.shift();
    }

    // Detect finger states
    const thumbExtended = isFingerExtended(landmarks, 4, 2);
    const indexExtended = isFingerExtended(landmarks, 8, 5);
    const middleExtended = isFingerExtended(landmarks, 12, 9);
    const ringExtended = isFingerExtended(landmarks, 16, 13);
    const pinkyExtended = isFingerExtended(landmarks, 20, 17);
    
    fingerStatesRef.current = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended];

    // Count extended fingers
    const extendedCount = fingerStatesRef.current.filter(Boolean).length;
    setConfidence(Math.min(100, extendedCount * 20 + 20));

    // Cooldown check
    if (timeSinceLastGesture < GESTURE_COOLDOWN) return;

    // Calculate pinch distance (thumb to index)
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    // === GESTURE DETECTION ===

    // 1. PINCH: Thumb and index close together
    if (pinchDistance < 0.06 && !middleExtended && !ringExtended) {
      setGesture("pinch");
      onGesture("pinch");
      lastGestureTimeRef.current = now;
      gestureHistoryRef.current = [];
      return;
    }

    // 2. THUMBS UP: Only thumb extended, pointing up
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      if (thumbTip.y < wrist.y - 0.1) {
        setGesture("thumbs-up");
        onGesture("thumbs-up");
        lastGestureTimeRef.current = now;
        return;
      }
    }

    // 3. POINTING: Only index finger extended (PLAY gesture)
    if (!thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      const prevGesture = gestureConfidenceRef.current.get("pointing") || 0;
      gestureConfidenceRef.current.set("pointing", prevGesture + 1);
      
      if (prevGesture >= 4) {
        setGesture("pointing");
        onGesture("pointing");
        lastGestureTimeRef.current = now;
        gestureConfidenceRef.current.set("pointing", 0);
        return;
      }
    } else {
      gestureConfidenceRef.current.set("pointing", 0);
    }

    // 4. OPEN PALM: All fingers extended (PAUSE gesture)
    if (extendedCount >= 4) {
      const prevGesture = gestureConfidenceRef.current.get("open-palm") || 0;
      gestureConfidenceRef.current.set("open-palm", prevGesture + 1);
      
      if (prevGesture >= 5) {
        setGesture("open-palm");
        onGesture("open-palm");
        lastGestureTimeRef.current = now;
        gestureConfidenceRef.current.set("open-palm", 0);
        return;
      }
    } else {
      gestureConfidenceRef.current.set("open-palm", 0);
    }

    // 5. SWIPE DETECTION with velocity
    if (gestureHistoryRef.current.length >= 10) {
      const history = gestureHistoryRef.current;
      const first = history[0];
      const last = history[history.length - 1];
      
      const deltaX = last.x - first.x;
      const deltaY = last.y - first.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Calculate average velocity
      let avgVelocityX = 0;
      let avgVelocityY = 0;
      for (let i = 1; i < history.length; i++) {
        avgVelocityX += Math.abs(history[i].x - history[i-1].x);
        avgVelocityY += Math.abs(history[i].y - history[i-1].y);
      }
      avgVelocityX /= history.length;
      avgVelocityY /= history.length;

      // Horizontal swipe
      if (Math.abs(deltaX) > SWIPE_MIN_DISTANCE && 
          Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
          avgVelocityX > SWIPE_VELOCITY_THRESHOLD) {
        const swipeGesture = deltaX > 0 ? "swipe-left" : "swipe-right"; // Mirrored
        setGesture(swipeGesture);
        onGesture(swipeGesture);
        lastGestureTimeRef.current = now;
        gestureHistoryRef.current = [];
        return;
      }

      // Vertical swipe
      if (Math.abs(deltaY) > SWIPE_MIN_DISTANCE && 
          Math.abs(deltaY) > Math.abs(deltaX) * 1.5 &&
          avgVelocityY > SWIPE_VELOCITY_THRESHOLD) {
        const swipeGesture = deltaY > 0 ? "swipe-down" : "swipe-up";
        setGesture(swipeGesture);
        onGesture(swipeGesture);
        lastGestureTimeRef.current = now;
        gestureHistoryRef.current = [];
        return;
      }
    }

    // 6. FIST / TAP: No fingers extended (toggle play/pause)
    if (extendedCount <= 1 && !thumbExtended) {
      const timeSinceLastTap = now - lastTapTimeRef.current;
      
      if (timeSinceLastTap < 500 && timeSinceLastTap > 100) {
        tapCountRef.current++;
        if (tapCountRef.current >= 2) {
          setGesture("double-tap");
          onGesture("double-tap");
          tapCountRef.current = 0;
          lastGestureTimeRef.current = now;
          return;
        }
      } else if (timeSinceLastTap > 500) {
        tapCountRef.current = 1;
        lastTapTimeRef.current = now;
        
        setTimeout(() => {
          if (tapCountRef.current === 1 && Date.now() - lastTapTimeRef.current > 450) {
            setGesture("tap");
            onGesture("tap");
            lastGestureTimeRef.current = Date.now();
          }
          tapCountRef.current = 0;
        }, 500);
      }
    }
  }, [onGesture, smoothPosition, getZone, isFingerExtended]);

  const drawGestureZones = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    GESTURE_ZONES.forEach(zone => {
      const isActive = currentZone === zone.name;
      ctx.fillStyle = isActive ? "hsla(262, 83%, 58%, 0.15)" : "hsla(0, 0%, 100%, 0.03)";
      ctx.strokeStyle = isActive ? "hsla(262, 83%, 58%, 0.5)" : "hsla(0, 0%, 100%, 0.1)";
      ctx.lineWidth = isActive ? 2 : 1;
      
      const x = zone.x * width;
      const y = zone.y * height;
      const w = zone.width * width;
      const h = zone.height * height;
      
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 10);
      ctx.fill();
      ctx.stroke();
      
      // Zone label
      ctx.fillStyle = isActive ? "hsla(262, 83%, 70%, 0.8)" : "hsla(0, 0%, 100%, 0.3)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(zone.name.toUpperCase(), x + w/2, y + h/2);
    });
    
    ctx.restore();
  }, [currentZone]);

  const onResults = useCallback((results: HandResults) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current;
    
    if (!canvas || !ctx || !video) return;

    // Clear and draw video frame (mirrored)
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw gesture zones
    drawGestureZones(ctx, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      ctx.save();
      
      // Draw skeleton with gradient
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17]
      ];

      // Glow effect for hand
      ctx.shadowColor = "hsl(262, 83%, 58%)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "hsl(262, 83%, 58%)";
      ctx.lineWidth = 3;
      
      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        ctx.beginPath();
        ctx.moveTo((1 - startPoint.x) * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo((1 - endPoint.x) * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });

      ctx.shadowBlur = 0;

      // Draw landmarks with different sizes for fingertips
      const fingertips = [4, 8, 12, 16, 20];
      landmarks.forEach((landmark, index) => {
        const x = (1 - landmark.x) * canvas.width;
        const y = landmark.y * canvas.height;
        
        const isFingertip = fingertips.includes(index);
        const isIndex = index === 8;
        
        // Outer glow for fingertips
        if (isFingertip) {
          ctx.beginPath();
          ctx.arc(x, y, isIndex ? 18 : 12, 0, 2 * Math.PI);
          ctx.fillStyle = `hsla(${isIndex ? 217 : 262}, 83%, 60%, 0.2)`;
          ctx.fill();
        }
        
        // Main point
        ctx.beginPath();
        ctx.arc(x, y, isFingertip ? (isIndex ? 10 : 7) : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isIndex 
          ? "hsl(217, 91%, 60%)" 
          : isFingertip 
            ? "hsl(262, 83%, 70%)" 
            : "hsl(262, 83%, 50%)";
        ctx.fill();
        
        // Inner highlight
        if (isFingertip) {
          ctx.beginPath();
          ctx.arc(x - 2, y - 2, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "hsla(0, 0%, 100%, 0.5)";
          ctx.fill();
        }
      });

      ctx.restore();

      // Detect gestures
      detectGesture(landmarks);
    } else {
      setHandPosition(null);
      setCurrentZone(null);
      setConfidence(0);
    }
  }, [detectGesture, drawGestureZones]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const hands = new Hands({
        // IMPORTANT: Pin to the installed @mediapipe/hands version to avoid WASM/JS mismatches
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (e) {
                // Prevent unhandled promise rejections from MediaPipe WASM aborts
                // (errors are surfaced via startTracking catch on next start attempt)
              }
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        cameraRef.current = camera;
        setIsTracking(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start camera");
      console.error("Hand tracking error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isTracking, onResults]);

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsTracking(false);
    setHandPosition(null);
    setGesture(null);
    setConfidence(0);
    setCurrentZone(null);
    smoothedPositionRef.current = null;
    gestureHistoryRef.current = [];
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  useEffect(() => {
    if (gesture) {
      const timer = setTimeout(() => setGesture(null), 600);
      return () => clearTimeout(timer);
    }
  }, [gesture]);

  return {
    videoRef,
    canvasRef,
    isTracking,
    isLoading,
    error,
    gesture,
    handPosition,
    confidence,
    currentZone,
    startTracking,
    stopTracking,
  };
}