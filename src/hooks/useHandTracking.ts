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
  | null;

interface HandPosition {
  x: number;
  y: number;
}

interface UseHandTrackingReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  gesture: GestureType;
  handPosition: HandPosition | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

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
  
  // Gesture detection state
  const lastPositionRef = useRef<HandPosition | null>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const gestureHistoryRef = useRef<HandPosition[]>([]);

  const detectGesture = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    const indexTip = landmarks[8]; // Index finger tip
    const thumbTip = landmarks[4]; // Thumb tip
    const wrist = landmarks[0]; // Wrist
    const palmBase = landmarks[9]; // Middle finger base (palm center)

    const currentPos: HandPosition = { x: indexTip.x, y: indexTip.y };
    setHandPosition(currentPos);

    const now = Date.now();
    const timeSinceLastGesture = now - lastGestureTimeRef.current;
    
    // Store position history for swipe detection
    gestureHistoryRef.current.push(currentPos);
    if (gestureHistoryRef.current.length > 10) {
      gestureHistoryRef.current.shift();
    }

    // Cooldown between gestures
    if (timeSinceLastGesture < 500) return;

    // Calculate pinch distance
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    // Pinch detection
    if (pinchDistance < 0.05) {
      setGesture("pinch");
      onGesture("pinch");
      lastGestureTimeRef.current = now;
      gestureHistoryRef.current = [];
      return;
    }

    // Check for swipe gestures using position history
    if (gestureHistoryRef.current.length >= 8) {
      const first = gestureHistoryRef.current[0];
      const last = gestureHistoryRef.current[gestureHistoryRef.current.length - 1];
      
      const deltaX = last.x - first.x;
      const deltaY = last.y - first.y;
      const swipeThreshold = 0.15;

      if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        const swipeGesture = deltaX > 0 ? "swipe-left" : "swipe-right"; // Inverted for mirror
        setGesture(swipeGesture);
        onGesture(swipeGesture);
        lastGestureTimeRef.current = now;
        gestureHistoryRef.current = [];
        return;
      }

      if (Math.abs(deltaY) > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
        const swipeGesture = deltaY > 0 ? "swipe-down" : "swipe-up";
        setGesture(swipeGesture);
        onGesture(swipeGesture);
        lastGestureTimeRef.current = now;
        gestureHistoryRef.current = [];
        return;
      }
    }

    // Closed fist detection (tap) - all fingers closed
    const indexMcp = landmarks[5];
    const indexClosed = indexTip.y > indexMcp.y;
    const middleTip = landmarks[12];
    const middleMcp = landmarks[9];
    const middleClosed = middleTip.y > middleMcp.y;
    
    if (indexClosed && middleClosed) {
      const timeSinceLastTap = now - lastTapTimeRef.current;
      
      if (timeSinceLastTap < 400) {
        tapCountRef.current++;
        if (tapCountRef.current >= 2) {
          setGesture("double-tap");
          onGesture("double-tap");
          tapCountRef.current = 0;
          lastGestureTimeRef.current = now;
        }
      } else {
        tapCountRef.current = 1;
        setTimeout(() => {
          if (tapCountRef.current === 1 && Date.now() - lastTapTimeRef.current > 350) {
            setGesture("tap");
            onGesture("tap");
            lastGestureTimeRef.current = Date.now();
          }
          tapCountRef.current = 0;
        }, 400);
      }
      lastTapTimeRef.current = now;
    }

    lastPositionRef.current = currentPos;
  }, [onGesture]);

  const onResults = useCallback((results: HandResults) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current;
    
    if (!canvas || !ctx || !video) return;

    // Clear and draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mirror the video
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw hand landmarks
      ctx.save();
      
      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm
      ];

      ctx.strokeStyle = "hsl(262, 83%, 58%)";
      ctx.lineWidth = 2;
      
      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        ctx.beginPath();
        ctx.moveTo((1 - startPoint.x) * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo((1 - endPoint.x) * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });

      // Draw points
      landmarks.forEach((landmark, index) => {
        const x = (1 - landmark.x) * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, index === 8 ? 8 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = index === 8 ? "hsl(217, 91%, 60%)" : "hsl(262, 83%, 70%)";
        ctx.fill();
        
        // Glow effect on index tip
        if (index === 8) {
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.fillStyle = "hsla(217, 91%, 60%, 0.3)";
          ctx.fill();
        }
      });

      ctx.restore();

      // Detect gestures
      detectGesture(landmarks);
    } else {
      setHandPosition(null);
    }
  }, [detectGesture]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      // Initialize camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
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
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Clear gesture after display
  useEffect(() => {
    if (gesture) {
      const timer = setTimeout(() => setGesture(null), 500);
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
    startTracking,
    stopTracking,
  };
}