import { useRef, useEffect, useState } from "react";
import { getFormImages } from "@/components/workouts/detail/ExerciseCard";

interface Joint {
  x: number;
  y: number;
  confidence: number;
}

interface Pose {
  keypoints: {
    [key: string]: Joint;
  };
  score: number;
}

interface MotionDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  isPaused: boolean;
  currentExercise: any;
  onRepDetected: () => void;
  onPoseDetected: (pose: Pose | null) => void;
}

const MotionDetector = ({ 
  videoRef, 
  isActive, 
  isPaused, 
  currentExercise,
  onRepDetected,
  onPoseDetected
}: MotionDetectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const previousImageDataRef = useRef<ImageData | null>(null);
  const motionStateRef = useRef<'idle' | 'moving' | 'rep-detected'>('idle');
  const motionThresholdRef = useRef<number>(0);
  const consecutiveFramesAboveThresholdRef = useRef<number>(0);
  const lastRepTimeRef = useRef<number>(0);
  const [detectedPose, setDetectedPose] = useState<Pose | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ movement: number, threshold: number, state: string }>({
    movement: 0,
    threshold: 0,
    state: 'idle'
  });

  // Initialize form analysis by getting reference images
  useEffect(() => {
    if (currentExercise) {
      // In a production app, we would load the start/end position images for the current exercise
      // For now, we'll use a simulated approach based on the exercise properties
      const formImages = getFormImages(currentExercise);
      
      // Dynamically set threshold based on exercise type
      // In a real implementation, this would be more sophisticated
      if (currentExercise.muscleGroups && currentExercise.muscleGroups.some(
        (group: string) => group.toLowerCase().includes('leg') || 
                          group.toLowerCase().includes('squat'))
      ) {
        motionThresholdRef.current = 25; // Higher threshold for large movements
      } else if (currentExercise.muscleGroups && currentExercise.muscleGroups.some(
        (group: string) => group.toLowerCase().includes('arm') || 
                          group.toLowerCase().includes('bicep'))
      ) {
        motionThresholdRef.current = 15; // Medium threshold for arm exercises
      } else {
        motionThresholdRef.current = 20; // Default threshold
      }
    }
  }, [currentExercise]);

  // Simulated pose detection - In a production app, this would use a real pose detection model
  const simulatePoseDetection = (imageData: ImageData): Pose | null => {
    if (!videoRef.current) return null;
    
    const video = videoRef.current;
    const width = video.videoWidth || video.offsetWidth;
    const height = video.videoHeight || video.offsetHeight;
    
    // Create a simulated pose based on motion detection
    // This is a placeholder - in reality, you would use a pose detection model like PoseNet, BlazePose, etc.
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Generate some random movement for demo purposes
    const noise = (pos: number) => pos + (Math.random() * 5 - 2.5);
    const confidence = () => Math.random() * 0.3 + 0.7; // High confidence for demo
    
    const pose: Pose = {
      keypoints: {
        nose: { x: noise(centerX), y: noise(centerY - height * 0.25), confidence: confidence() },
        neck: { x: noise(centerX), y: noise(centerY - height * 0.15), confidence: confidence() },
        leftEye: { x: noise(centerX - width * 0.05), y: noise(centerY - height * 0.26), confidence: confidence() },
        rightEye: { x: noise(centerX + width * 0.05), y: noise(centerY - height * 0.26), confidence: confidence() },
        leftEar: { x: noise(centerX - width * 0.08), y: noise(centerY - height * 0.23), confidence: confidence() },
        rightEar: { x: noise(centerX + width * 0.08), y: noise(centerY - height * 0.23), confidence: confidence() },
        leftShoulder: { x: noise(centerX - width * 0.15), y: noise(centerY - height * 0.10), confidence: confidence() },
        rightShoulder: { x: noise(centerX + width * 0.15), y: noise(centerY - height * 0.10), confidence: confidence() },
        leftElbow: { x: noise(centerX - width * 0.20), y: noise(centerY), confidence: confidence() },
        rightElbow: { x: noise(centerX + width * 0.20), y: noise(centerY), confidence: confidence() },
        leftWrist: { x: noise(centerX - width * 0.25), y: noise(centerY + height * 0.10), confidence: confidence() },
        rightWrist: { x: noise(centerX + width * 0.25), y: noise(centerY + height * 0.10), confidence: confidence() },
        leftHip: { x: noise(centerX - width * 0.10), y: noise(centerY + height * 0.15), confidence: confidence() },
        rightHip: { x: noise(centerX + width * 0.10), y: noise(centerY + height * 0.15), confidence: confidence() },
        leftKnee: { x: noise(centerX - width * 0.10), y: noise(centerY + height * 0.30), confidence: confidence() },
        rightKnee: { x: noise(centerX + width * 0.10), y: noise(centerY + height * 0.30), confidence: confidence() },
        leftAnkle: { x: noise(centerX - width * 0.10), y: noise(centerY + height * 0.45), confidence: confidence() },
        rightAnkle: { x: noise(centerX + width * 0.10), y: noise(centerY + height * 0.45), confidence: confidence() },
      },
      score: 0.9
    };
    
    return pose;
  };

  // Set up motion detection
  useEffect(() => {
    if (!isActive || isPaused || !videoRef.current || !canvasRef.current) {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      
      // Clear pose data when inactive
      setDetectedPose(null);
      onPoseDetected(null);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    // Ensure canvas is the correct size
    const resizeCanvas = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = 640;
        canvas.height = 480;
      }
    };

    // Start motion detection
    const detect = () => {
      if (!video.videoWidth) {
        requestAnimationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Make sure canvas is sized correctly
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        resizeCanvas();
      }
      
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect pose (simulated in this implementation)
      const pose = simulatePoseDetection(currentImageData);
      setDetectedPose(pose);
      onPoseDetected(pose);
      
      // Compare with previous frame if we have one
      if (previousImageDataRef.current) {
        const movementScore = detectMovement(previousImageDataRef.current, currentImageData);
        
        const now = Date.now();
        const timeSinceLastRep = now - lastRepTimeRef.current;
        
        // Update debug info
        setDebugInfo({
          movement: movementScore,
          threshold: motionThresholdRef.current,
          state: motionStateRef.current
        });

        // State machine for rep detection
        switch(motionStateRef.current) {
          case 'idle':
            if (movementScore > motionThresholdRef.current) {
              consecutiveFramesAboveThresholdRef.current++;
              if (consecutiveFramesAboveThresholdRef.current >= 3) {
                motionStateRef.current = 'moving';
              }
            } else {
              consecutiveFramesAboveThresholdRef.current = 0;
            }
            break;
            
          case 'moving':
            if (movementScore < motionThresholdRef.current / 2) {
              // Movement stopped, could be a completed rep
              if (timeSinceLastRep > 1000) { // Prevent counting reps too quickly
                motionStateRef.current = 'rep-detected';
                lastRepTimeRef.current = now;
                
                // Trigger the rep detected callback
                onRepDetected();
                
                // Reset after a short delay
                setTimeout(() => {
                  motionStateRef.current = 'idle';
                }, 500);
              }
            }
            break;
            
          case 'rep-detected':
            // Wait for the timeout to reset to idle
            break;
        }
      }
      
      previousImageDataRef.current = currentImageData;
      requestAnimationFrameRef.current = requestAnimationFrame(detect);
    };
    
    requestAnimationFrameRef.current = requestAnimationFrame(detect);
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, [isActive, isPaused, videoRef, onRepDetected, onPoseDetected]);
  
  // Helper function to detect movement between frames
  const detectMovement = (prev: ImageData, curr: ImageData): number => {
    const prevData = prev.data;
    const currData = curr.data;
    let movement = 0;
    
    // Sample pixels (every 10th pixel) to improve performance
    for (let i = 0; i < prevData.length; i += 40) {
      const rDiff = Math.abs(prevData[i] - currData[i]);
      const gDiff = Math.abs(prevData[i+1] - currData[i+1]);
      const bDiff = Math.abs(prevData[i+2] - currData[i+2]);
      
      if (rDiff + gDiff + bDiff > 100) { // Threshold for pixel change
        movement++;
      }
    }
    
    return movement;
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Optionally render debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded text-xs text-white">
          <div>Movement: {debugInfo.movement}</div>
          <div>Threshold: {debugInfo.threshold}</div>
          <div>State: {debugInfo.state}</div>
        </div>
      )}
    </>
  );
};

export default MotionDetector;
