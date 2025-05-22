import { Pose } from "@/types/pose";
import { useEffect, useRef, useState } from "react";

// Import MediaPipe dynamically
let mpPose: any = null;
let mpDrawing: any = null;

// Load MediaPipe libraries
const loadMediaPipe = async () => {
  try {
    const [poseModule, drawingModule] = await Promise.all([
      import('@mediapipe/pose'),
      import('@mediapipe/drawing_utils')
    ]);
    mpPose = poseModule;
    mpDrawing = drawingModule;
    return true;
  } catch (error) {
    console.error('Error loading MediaPipe modules:', error);
    return false;
  }
};

interface MotionDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  isPaused: boolean;
  currentExercise: any;
  onRepDetected: () => void;
  onPoseDetected: (pose: Pose | null) => void;
}

interface Keypoint {
  x: number;
  y: number;
  confidence: number;
}

interface Keypoints {
  [key: string]: Keypoint;
}

interface JointConfig {
  a: string;
  b: string;
  c: string;
  down: number;
  up: number;
}

interface FormCheckConfig {
  a: string;
  b: string;
  c: string;
  maxAngle: number;
}

interface ExerciseConfig {
  primary: JointConfig;
  secondary: JointConfig;
  formChecks: {
    [key: string]: FormCheckConfig;
  };
}

interface PoseResults {
  poseLandmarks: Array<{
    x: number;
    y: number;
    z: number;
    visibility: number;
  }>;
}

// All 33 BlazePose landmarks mapping
const LANDMARK_MAPPING = {
  0: 'nose',
  1: 'left_eye_inner',
  2: 'left_eye',
  3: 'left_eye_outer',
  4: 'right_eye_inner',
  5: 'right_eye',
  6: 'right_eye_outer',
  7: 'left_ear',
  8: 'right_ear',
  9: 'mouth_left',
  10: 'mouth_right',
  11: 'left_shoulder',
  12: 'right_shoulder',
  13: 'left_elbow',
  14: 'right_elbow',
  15: 'left_wrist',
  16: 'right_wrist',
  17: 'left_pinky',
  18: 'right_pinky',
  19: 'left_index',
  20: 'right_index',
  21: 'left_thumb',
  22: 'right_thumb',
  23: 'left_hip',
  24: 'right_hip',
  25: 'left_knee',
  26: 'right_knee',
  27: 'left_ankle',
  28: 'right_ankle',
  29: 'left_heel',
  30: 'right_heel',
  31: 'left_foot_index',
  32: 'right_foot_index'
};

// Exercise-specific configurations with more precise joint tracking
const EXERCISE_CONFIGS: { [key: string]: ExerciseConfig } = {
  pushups: {
    primary: { a: 'left_shoulder', b: 'left_elbow', c: 'left_wrist', down: 90, up: 160 },
    secondary: { a: 'right_shoulder', b: 'right_elbow', c: 'right_wrist', down: 90, up: 160 },
    formChecks: {}
  },
  squats: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 100, up: 150 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 100, up: 150 },
    formChecks: {}
  },
  plank: {
    primary: { a: 'left_shoulder', b: 'left_hip', c: 'left_ankle', down: 170, up: 170 },
    secondary: { a: 'right_shoulder', b: 'right_hip', c: 'right_ankle', down: 170, up: 170 },
    formChecks: {}
  },
  jumpingjacks: {
    primary: { a: 'left_hip', b: 'left_shoulder', c: 'left_wrist', down: 60, up: 140 },
    secondary: { a: 'right_hip', b: 'right_shoulder', c: 'right_wrist', down: 60, up: 140 },
    formChecks: {}
  },
  dumbbellshoulderpress: {
    primary: { a: 'left_shoulder', b: 'left_elbow', c: 'left_wrist', down: 60, up: 160 },
    secondary: { a: 'right_shoulder', b: 'right_elbow', c: 'right_wrist', down: 60, up: 160 },
    formChecks: {}
  },
  bentoverrows: {
    primary: { a: 'left_shoulder', b: 'left_elbow', c: 'left_wrist', down: 80, up: 160 },
    secondary: { a: 'right_shoulder', b: 'right_elbow', c: 'right_wrist', down: 80, up: 160 },
    formChecks: {}
  },
  chestpress: {
    primary: { a: 'left_shoulder', b: 'left_elbow', c: 'left_wrist', down: 80, up: 160 },
    secondary: { a: 'right_shoulder', b: 'right_elbow', c: 'right_wrist', down: 80, up: 160 },
    formChecks: {}
  },
  tricepdips: {
    primary: { a: 'left_shoulder', b: 'left_elbow', c: 'left_wrist', down: 90, up: 160 },
    secondary: { a: 'right_shoulder', b: 'right_elbow', c: 'right_wrist', down: 90, up: 160 },
    formChecks: {}
  },
  crunches: {
    primary: { a: 'left_hip', b: 'left_shoulder', c: 'left_elbow', down: 60, up: 120 },
    secondary: { a: 'right_hip', b: 'right_shoulder', c: 'right_elbow', down: 60, up: 120 },
    formChecks: {}
  },
  russiantwists: {
    primary: { a: 'left_hip', b: 'left_shoulder', c: 'left_elbow', down: 60, up: 120 },
    secondary: { a: 'right_hip', b: 'right_shoulder', c: 'right_elbow', down: 60, up: 120 },
    formChecks: {}
  },
  bicyclecrunches: {
    primary: { a: 'left_hip', b: 'left_shoulder', c: 'left_elbow', down: 60, up: 120 },
    secondary: { a: 'right_hip', b: 'right_shoulder', c: 'right_elbow', down: 60, up: 120 },
    formChecks: {}
  },
  mountainclimbers: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 80, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 80, up: 160 },
    formChecks: {}
  },
  highknees: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  burpees: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  jumprope: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  jumpinglunges: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  lunges: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  deadlifts: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 160 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 160 },
    formChecks: {}
  },
  calfraises: {
    primary: { a: 'left_ankle', b: 'left_knee', c: 'left_hip', down: 60, up: 120 },
    secondary: { a: 'right_ankle', b: 'right_knee', c: 'right_hip', down: 60, up: 120 },
    formChecks: {}
  },
  glutebridges: {
    primary: { a: 'left_hip', b: 'left_knee', c: 'left_ankle', down: 60, up: 120 },
    secondary: { a: 'right_hip', b: 'right_knee', c: 'right_ankle', down: 60, up: 120 },
    formChecks: {}
  }
};

function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

function calculateDistance(a: Keypoint, b: Keypoint): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export default function MotionDetector({
  videoRef, isActive, isPaused, currentExercise, onRepDetected, onPoseDetected
}: MotionDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const poseRef = useRef<mpPose.Pose | null>(null);
  const repState = useRef('up');
  const lastRepTime = useRef(0);
  const [isPoseLoaded, setIsPoseLoaded] = useState(false);
  const [debug, setDebug] = useState({
    state: 'up',
    repCount: 0,
    angle: 0,
    feedback: '',
    formFeedback: [],
    exercise: '',
    downThreshold: 0,
    upThreshold: 0
  });

  // Update exercise info when exercise changes
  useEffect(() => {
    if (currentExercise && currentExercise.name) {
      const ex = currentExercise.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const config = EXERCISE_CONFIGS[ex] || EXERCISE_CONFIGS.squats;
      setDebug(d => ({
        ...d,
        exercise: ex,
        downThreshold: config.primary.down + 20,
        upThreshold: config.primary.up - 20,
      }));
      
      // Reset the rep state for the new exercise
      repState.current = 'up';
    }
  }, [currentExercise]);

  // Initialize MediaPipe Pose
  useEffect(() => {
    let isMounted = true;
    let pose: any = null;

    async function initPose() {
      try {
        console.log('Loading MediaPipe modules...');
        const loaded = await loadMediaPipe();
        if (!loaded) {
          throw new Error('Failed to load MediaPipe modules');
        }

        console.log('Starting MediaPipe Pose initialization...');
        pose = new mpPose.Pose({
          locateFile: (file: string) => {
            const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`;
            console.log('Loading MediaPipe file:', url);
            return url;
          }
        });

        console.log('Setting MediaPipe Pose options...');
        pose.setOptions({
          modelComplexity: 1, // Changed from 2 to 1 for better performance
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results: any) => {
          console.log('MediaPipe Pose results received:', results.poseLandmarks ? 'Landmarks detected' : 'No landmarks');
          const canvas = canvasRef.current;
          if (!canvas) {
            console.log('Canvas reference not found');
            return;
          }
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            console.log('Could not get canvas context');
            return;
          }

          // Draw video frame
          if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          }

          if (results.poseLandmarks) {
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

            // --- Optimized Rep Counting Logic ---
            const keypoints: Keypoints = {};
            results.poseLandmarks.forEach((lm, i) => {
              const name = LANDMARK_MAPPING[i];
              if (name) {
                keypoints[name] = {
                  x: lm.x,
                  y: lm.y,
                  confidence: lm.visibility
                };
              }
            });

            const ex = (currentExercise?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const config = EXERCISE_CONFIGS[ex] || EXERCISE_CONFIGS.squats;
            const primary = config.primary;
            const a = keypoints[primary.a];
            const b = keypoints[primary.b];
            const c = keypoints[primary.c];

            // Loosen confidence and angle requirements
            if (a && b && c && a.confidence > 0.3 && b.confidence > 0.3 && c.confidence > 0.3) {
              const angle = calculateAngle(a, b, c);
              const downThreshold = primary.down + 20;
              const upThreshold = primary.up - 20;
              setDebug(d => ({
                ...d,
                angle: Math.round(angle),
                state: repState.current,
                exercise: ex,
                downThreshold,
                upThreshold
              }));
              console.log(
                `Exercise: ${ex}, Angle: ${angle}, State: ${repState.current}, Down: ${downThreshold}, Up: ${upThreshold}`
              );
              const now = Date.now();
              if (repState.current === 'up' && angle <= downThreshold) {
                repState.current = 'down';
                setDebug(d => ({
                  ...d,
                  state: 'down',
                  feedback: 'Now return up'
                }));
              } else if (repState.current === 'down' && angle >= upThreshold) {
                if (now - lastRepTime.current > 400) {
                  repState.current = 'up';
                  lastRepTime.current = now;
                  setDebug(d => ({
                    ...d,
                    state: 'up',
                    repCount: d.repCount + 1,
                    feedback: 'Rep counted!'
                  }));
                  onRepDetected();
                }
              }
            }

            onPoseDetected({ keypoints, score: 1.0 });
          } else {
            console.log('No pose landmarks detected');
          }
        });

        poseRef.current = pose;
        if (isMounted) setIsPoseLoaded(true);
        console.log('MediaPipe Pose initialized successfully');
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    }

    initPose();

    return () => {
      isMounted = false;
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [videoRef]);

  // Main detection loop
  useEffect(() => {
    if (!isActive || isPaused || !videoRef.current || !canvasRef.current || !isPoseLoaded) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }
    
    let running = true;

    const detect = async () => {
      if (!running) return;
      if (poseRef.current && videoRef.current && videoRef.current.readyState >= 2) {
        await poseRef.current.send({ image: videoRef.current });
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    requestRef.current = requestAnimationFrame(detect);
    
    return () => {
      running = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, isPaused, videoRef, isPoseLoaded]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 z-10"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-sm z-50">
        <div>State: {debug.state}</div>
        <div>Reps: {debug.repCount}</div>
        <div>Angle: {debug.angle}°</div>
        <div>Feedback: {debug.feedback}</div>
        {debug.formFeedback.map((feedback, i) => (
          <div key={i} className="text-yellow-400">{feedback}</div>
        ))}
        <div>Exercise: {debug.exercise}</div>
        <div>Down: {debug.downThreshold} Up: {debug.upThreshold}</div>
      </div>
    </div>
  );
}
