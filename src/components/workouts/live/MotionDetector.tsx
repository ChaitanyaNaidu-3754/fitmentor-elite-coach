
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
  const previousPoseRef = useRef<Pose | null>(null);
  const motionStateRef = useRef<'start' | 'mid' | 'end'>('start');
  const repProgressRef = useRef<number>(0);
  const lastRepTimeRef = useRef<number>(0);
  const exerciseTemplateRef = useRef<{start: Pose | null, end: Pose | null}>({
    start: null,
    end: null
  });
  const [debugInfo, setDebugInfo] = useState<{ 
    progress: number, 
    similarity: number, 
    state: string 
  }>({
    progress: 0,
    similarity: 0,
    state: 'start'
  });

  // Initialize form analysis by getting reference images and templates
  useEffect(() => {
    if (currentExercise) {
      console.log("Loading exercise template for:", currentExercise.name);
      
      // In a production app, we would load actual pose data from the GitHub repo
      // For now, we'll create simulated templates based on the exercise
      
      // Get form images paths (these would be used to extract pose data in production)
      const formImages = getFormImages(currentExercise);
      console.log("Form images:", formImages);
      
      // Create simulated start and end pose templates based on exercise type
      const startPose = createExerciseTemplate(currentExercise, 'start');
      const endPose = createExerciseTemplate(currentExercise, 'end');
      
      exerciseTemplateRef.current = {
        start: startPose,
        end: endPose
      };
      
      console.log("Exercise templates created");
    }
  }, [currentExercise]);

  // Helper function to create exercise-specific pose templates
  const createExerciseTemplate = (exercise: any, position: 'start' | 'end'): Pose => {
    // This is a simplified simulation - in production, this would extract real pose data from images
    const isLegExercise = exercise.muscleGroups && 
      exercise.muscleGroups.some((g: string) => 
        g.toLowerCase().includes('leg') || 
        g.toLowerCase().includes('squat')
      );
      
    const isArmExercise = exercise.muscleGroups && 
      exercise.muscleGroups.some((g: string) => 
        g.toLowerCase().includes('arm') || 
        g.toLowerCase().includes('bicep') ||
        g.toLowerCase().includes('tricep')
      );
      
    const isChestExercise = exercise.muscleGroups && 
      exercise.muscleGroups.some((g: string) => 
        g.toLowerCase().includes('chest') || 
        g.toLowerCase().includes('pectoral')
      );
    
    // Define a base pose
    const basePose: Pose = {
      keypoints: {
        nose: { x: 0.5, y: 0.2, confidence: 0.9 },
        leftShoulder: { x: 0.4, y: 0.3, confidence: 0.9 },
        rightShoulder: { x: 0.6, y: 0.3, confidence: 0.9 },
        leftElbow: { x: 0.3, y: 0.4, confidence: 0.9 },
        rightElbow: { x: 0.7, y: 0.4, confidence: 0.9 },
        leftWrist: { x: 0.3, y: 0.5, confidence: 0.9 },
        rightWrist: { x: 0.7, y: 0.5, confidence: 0.9 },
        leftHip: { x: 0.45, y: 0.6, confidence: 0.9 },
        rightHip: { x: 0.55, y: 0.6, confidence: 0.9 },
        leftKnee: { x: 0.4, y: 0.75, confidence: 0.9 },
        rightKnee: { x: 0.6, y: 0.75, confidence: 0.9 },
        leftAnkle: { x: 0.4, y: 0.9, confidence: 0.9 },
        rightAnkle: { x: 0.6, y: 0.9, confidence: 0.9 },
      },
      score: 0.9
    };
    
    // Modify the template based on exercise type and position
    if (isLegExercise) {
      // For leg exercises like squats
      if (position === 'start') {
        // Standing position
        basePose.keypoints.leftKnee.y = 0.75;
        basePose.keypoints.rightKnee.y = 0.75;
      } else {
        // Squat position
        basePose.keypoints.leftKnee.y = 0.65;
        basePose.keypoints.rightKnee.y = 0.65;
        basePose.keypoints.leftHip.y = 0.5;
        basePose.keypoints.rightHip.y = 0.5;
      }
    } else if (isArmExercise) {
      // For arm exercises like bicep curls
      if (position === 'start') {
        // Arms down
        basePose.keypoints.leftElbow.y = 0.45;
        basePose.keypoints.rightElbow.y = 0.45;
        basePose.keypoints.leftWrist.y = 0.6;
        basePose.keypoints.rightWrist.y = 0.6;
      } else {
        // Arms up (curled)
        basePose.keypoints.leftElbow.y = 0.4;
        basePose.keypoints.rightElbow.y = 0.4;
        basePose.keypoints.leftWrist.y = 0.3;
        basePose.keypoints.rightWrist.y = 0.3;
      }
    } else if (isChestExercise) {
      // For chest exercises like push-ups
      if (position === 'start') {
        // Top position
        basePose.keypoints.leftElbow.y = 0.4;
        basePose.keypoints.rightElbow.y = 0.4;
      } else {
        // Bottom position
        basePose.keypoints.leftElbow.y = 0.35;
        basePose.keypoints.rightElbow.y = 0.35;
        basePose.keypoints.leftShoulder.y = 0.35;
        basePose.keypoints.rightShoulder.y = 0.35;
      }
    }
    
    return basePose;
  };

  // Set up motion detection and pose analysis
  useEffect(() => {
    if (!isActive || isPaused || !videoRef.current || !canvasRef.current) {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      
      // Clear pose data when inactive
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

    // Start motion detection and pose analysis
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
      
      // Get image data for motion detection
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect pose - in production this would use a real pose detection model
      const currentPose = detectPose(currentImageData, canvas.width, canvas.height);
      
      // Update detected pose
      onPoseDetected(currentPose);
      
      // Process the pose for rep counting if we have valid data
      if (currentPose && exerciseTemplateRef.current.start && exerciseTemplateRef.current.end) {
        processRepCounting(currentPose);
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
  
  // Simulated pose detection function - in production, use a real pose detection library
  const detectPose = (imageData: ImageData, width: number, height: number): Pose => {
    // Create a simulated pose based on templates and add some variance
    // In production, this would be replaced with actual pose detection
    
    let templatePose: Pose | null = null;
    
    // Determine which template to use based on rep progress
    if (repProgressRef.current < 0.5) {
      // Closer to start pose
      templatePose = exerciseTemplateRef.current.start;
    } else {
      // Closer to end pose
      templatePose = exerciseTemplateRef.current.end;
    }
    
    // If no template available, create a default pose
    if (!templatePose) {
      templatePose = {
        keypoints: {
          nose: { x: 0.5, y: 0.2, confidence: 0.9 },
          leftShoulder: { x: 0.4, y: 0.3, confidence: 0.9 },
          rightShoulder: { x: 0.6, y: 0.3, confidence: 0.9 },
          leftElbow: { x: 0.3, y: 0.4, confidence: 0.9 },
          rightElbow: { x: 0.7, y: 0.4, confidence: 0.9 },
          leftWrist: { x: 0.3, y: 0.5, confidence: 0.9 },
          rightWrist: { x: 0.7, y: 0.5, confidence: 0.9 },
          leftHip: { x: 0.45, y: 0.6, confidence: 0.9 },
          rightHip: { x: 0.55, y: 0.6, confidence: 0.9 },
          leftKnee: { x: 0.4, y: 0.75, confidence: 0.9 },
          rightKnee: { x: 0.6, y: 0.75, confidence: 0.9 },
          leftAnkle: { x: 0.4, y: 0.9, confidence: 0.9 },
          rightAnkle: { x: 0.6, y: 0.9, confidence: 0.9 },
        },
        score: 0.9
      };
    }
    
    // Add some randomness to simulate real-world detection variance
    const addNoise = (value: number): number => {
      return value + (Math.random() * 0.05 - 0.025);
    };
    
    // Create a new pose with some random variance
    const simulatedPose: Pose = {
      keypoints: {},
      score: 0.9
    };
    
    // Apply noise and convert normalized coordinates to pixel coordinates
    Object.keys(templatePose.keypoints).forEach(key => {
      const joint = templatePose!.keypoints[key];
      
      // Add noise to the normalized position
      const noisyX = addNoise(joint.x);
      const noisyY = addNoise(joint.y);
      
      // Convert normalized coordinates to pixel coordinates
      simulatedPose.keypoints[key] = {
        x: noisyX * width,
        y: noisyY * height,
        confidence: joint.confidence * (0.9 + Math.random() * 0.1)
      };
    });
    
    return simulatedPose;
  };

  // Process pose for rep counting using template matching
  const processRepCounting = (currentPose: Pose) => {
    const startTemplate = exerciseTemplateRef.current.start;
    const endTemplate = exerciseTemplateRef.current.end;
    
    if (!startTemplate || !endTemplate) return;
    
    // Calculate similarity to start and end poses
    const startSimilarity = calculatePoseSimilarity(currentPose, startTemplate);
    const endSimilarity = calculatePoseSimilarity(currentPose, endTemplate);
    
    // Determine rep progress (0 = at start pose, 1 = at end pose)
    // This is a simplified approximation for the demo
    const totalSimilarity = startSimilarity + endSimilarity;
    let progress = 0;
    
    if (totalSimilarity > 0) {
      progress = endSimilarity / totalSimilarity;
    }
    
    // Update rep progress
    repProgressRef.current = progress;
    
    // Rep state machine
    const now = Date.now();
    const timeSinceLastRep = now - lastRepTimeRef.current;
    
    // Update debug info
    setDebugInfo({
      progress: progress,
      similarity: Math.max(startSimilarity, endSimilarity),
      state: motionStateRef.current
    });

    // State machine for rep detection
    switch(motionStateRef.current) {
      case 'start':
        if (progress > 0.6) {
          // Moving toward end position
          motionStateRef.current = 'mid';
        }
        break;
        
      case 'mid':
        if (progress > 0.85) {
          // Reached end position
          motionStateRef.current = 'end';
        } else if (progress < 0.3) {
          // Went back to start position without completing rep
          motionStateRef.current = 'start';
        }
        break;
        
      case 'end':
        if (progress < 0.3) {
          // Returned to start position after reaching end position
          // Complete rep if enough time has passed since last rep
          if (timeSinceLastRep > 500) { // Prevent counting reps too quickly
            lastRepTimeRef.current = now;
            motionStateRef.current = 'start';
            
            // Trigger the rep detected callback
            onRepDetected();
            console.log("Rep detected!");
          }
        }
        break;
    }
  };

  // Calculate similarity between two poses
  const calculatePoseSimilarity = (pose1: Pose, pose2: Pose): number => {
    // This is a simplified similarity calculation for the demo
    // In production, use a more sophisticated algorithm considering joint angles and relative positions
    
    let totalDistance = 0;
    let jointCount = 0;
    
    // Calculate the total distance between corresponding joints
    Object.keys(pose1.keypoints).forEach(key => {
      if (pose2.keypoints[key]) {
        // Normalize coordinates to 0-1 range for comparison
        const x1 = pose1.keypoints[key].x / (canvasRef.current?.width || 1);
        const y1 = pose1.keypoints[key].y / (canvasRef.current?.height || 1);
        
        const x2 = pose2.keypoints[key].x;
        const y2 = pose2.keypoints[key].y;
        
        // Calculate Euclidean distance
        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        totalDistance += distance;
        jointCount++;
      }
    });
    
    // Calculate average distance (lower is more similar)
    const avgDistance = jointCount > 0 ? totalDistance / jointCount : 1;
    
    // Convert to similarity score (higher is more similar)
    const similarity = Math.max(0, 1 - avgDistance * 4);
    
    return similarity;
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded text-xs text-white">
          <div>Progress: {debugInfo.progress.toFixed(2)}</div>
          <div>Similarity: {debugInfo.similarity.toFixed(2)}</div>
          <div>State: {debugInfo.state}</div>
        </div>
      )}
    </>
  );
};

export default MotionDetector;
