import { Pose } from "@/types/pose";
import * as mpDrawing from '@mediapipe/drawing_utils';
import * as mpPose from '@mediapipe/pose';
import { useEffect, useRef, useState } from "react";

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
  const previousPoseRef = useRef<Pose | null>(null);
  const repStateRef = useRef<'up' | 'down'>('up');
  const lastRepTimeRef = useRef<number>(0);
  const poseDetectorRef = useRef<mpPose.Pose | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ 
    state: string,
    feedback: string,
    repCount: number,
    currentAngle: number
  }>({
    state: 'up',
    feedback: 'Get ready to start',
    repCount: 0,
    currentAngle: 0
  });

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializePoseDetector = async () => {
      try {
        const pose = new mpPose.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: true,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseDetectorRef.current = pose;
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    };

    initializePoseDetector();
  }, []);

  // Calculate angle between three points
  const calculateAngle = (a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  // Get exercise-specific configuration
  const getExerciseConfig = (exercise: any) => {
    const name = exercise.name.toLowerCase();
    
    if (name.includes('squat')) {
      return {
        type: 'squat',
        keypoints: {
          joint1: 'leftHip',
          joint2: 'leftKnee',
          joint3: 'leftAnkle'
        },
        thresholds: {
          downAngle: 100,  // More lenient angle for squatting down
          upAngle: 150,    // More lenient angle for standing up
          minConfidence: 0.5
        }
      };
    } else if (name.includes('pushup')) {
      return {
        type: 'pushup',
        keypoints: {
          joint1: 'leftShoulder',
          joint2: 'leftElbow',
          joint3: 'leftWrist'
        },
        thresholds: {
          downAngle: 90,
          upAngle: 160,
          minConfidence: 0.5
        }
      };
    } else if (name.includes('curl')) {
      return {
        type: 'curl',
        keypoints: {
          joint1: 'leftShoulder',
          joint2: 'leftElbow',
          joint3: 'leftWrist'
        },
        thresholds: {
          downAngle: 150,  // Arms down
          upAngle: 60,     // Arms up
          minConfidence: 0.5
        }
      };
    }
    
    // Default to squat configuration
    return {
      type: 'squat',
      keypoints: {
        joint1: 'leftHip',
        joint2: 'leftKnee',
        joint3: 'leftAnkle'
      },
      thresholds: {
        downAngle: 100,
        upAngle: 150,
        minConfidence: 0.5
      }
    };
  };

  // Set up motion detection and pose analysis
  useEffect(() => {
    if (!isActive || isPaused || !videoRef.current || !canvasRef.current || !poseDetectorRef.current) {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
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

    const exerciseConfig = getExerciseConfig(currentExercise);
    
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

    // Start motion detection and pose analysis
    const detect = async () => {
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
      
      try {
        // Get pose landmarks using MediaPipe
        const results = await poseDetectorRef.current!.send({ image: canvas });
        
        if (results.poseLandmarks) {
          // Draw the pose landmarks
          mpDrawing.drawConnectors(
            ctx, 
            results.poseLandmarks, 
            mpPose.POSE_CONNECTIONS,
            { color: '#00FF00', lineWidth: 2 }
          );
          mpDrawing.drawLandmarks(
            ctx, 
            results.poseLandmarks,
            { color: '#FF0000', lineWidth: 1 }
          );

          // Convert MediaPipe landmarks to our format
          const currentPose: Pose = {
            keypoints: {},
            score: 1.0
          };

          results.poseLandmarks.forEach((landmark, index) => {
            const keypointName = Object.keys(mpPose.POSE_LANDMARKS)[index];
            if (keypointName) {
              currentPose.keypoints[keypointName] = {
                x: landmark.x,
                y: landmark.y,
                confidence: landmark.visibility
              };
            }
          });

          // Get the keypoints for the current exercise
          const { keypoints, thresholds } = exerciseConfig;
          const points = [
            currentPose.keypoints[keypoints.joint1],
            currentPose.keypoints[keypoints.joint2],
            currentPose.keypoints[keypoints.joint3]
          ];
          
          // Check if we have all required keypoints with sufficient confidence
          if (points.every(point => point && point.confidence > thresholds.minConfidence)) {
            // Calculate the angle based on exercise type
            const angle = calculateAngle(points[0], points[1], points[2]);
            
            // Update debug info with current angle
            setDebugInfo(prev => ({
              ...prev,
              currentAngle: Math.round(angle)
            }));

            // Process rep counting
            const currentTime = Date.now();
            const timeSinceLastRep = currentTime - lastRepTimeRef.current;
            
            if (repStateRef.current === 'up') {
              if (angle <= thresholds.downAngle) {
                repStateRef.current = 'down';
                setDebugInfo(prev => ({
                  ...prev,
                  state: 'down',
                  feedback: 'Good! Now return to start position'
                }));
              } else {
                setDebugInfo(prev => ({
                  ...prev,
                  feedback: 'Go lower'
                }));
              }
            } else {
              if (angle >= thresholds.upAngle) {
                if (timeSinceLastRep > 1000) { // Minimum 1 second between reps
                  repStateRef.current = 'up';
                  lastRepTimeRef.current = currentTime;
                  onRepDetected();
                  setDebugInfo(prev => ({
                    ...prev,
                    state: 'up',
                    feedback: 'Great rep! Keep going',
                    repCount: prev.repCount + 1
                  }));
                }
              } else {
                setDebugInfo(prev => ({
                  ...prev,
                  feedback: 'Push up higher'
                }));
              }
            }
          } else {
            setDebugInfo(prev => ({
              ...prev,
              feedback: 'Adjust position to be fully visible'
            }));
          }

          // Update detected pose
          onPoseDetected(currentPose);
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
      
      previousPoseRef.current = currentPose;
      requestAnimationFrameRef.current = requestAnimationFrame(detect);
    };
    
    requestAnimationFrameRef.current = requestAnimationFrame(detect);
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    };
  }, [isActive, isPaused, videoRef, onRepDetected, onPoseDetected, currentExercise]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Debug overlay - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded text-sm">
          <div>State: {debugInfo.state}</div>
          <div>Reps: {debugInfo.repCount}</div>
          <div>Angle: {debugInfo.currentAngle}°</div>
          <div>Feedback: {debugInfo.feedback}</div>
        </div>
      )}
    </div>
  );
};

export default MotionDetector;
