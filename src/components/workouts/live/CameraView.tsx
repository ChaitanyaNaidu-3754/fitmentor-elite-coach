import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import ExerciseOverlay from "./ExerciseOverlay";
import MotionDetector from "./MotionDetector";

interface CameraViewProps {
  cameraActive: boolean;
  isWorkoutActive: boolean;
  isPaused: boolean;
  currentExercise: any;
  currentRep: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraPermission: boolean | null;
  startStopCamera: () => void;
  onRepDetected: () => void;
}

const CameraView = ({
  cameraActive,
  isWorkoutActive,
  isPaused,
  currentExercise,
  currentRep,
  videoRef,
  cameraPermission,
  startStopCamera,
  onRepDetected
}: CameraViewProps) => {
  const [detectedPose, setDetectedPose] = useState<any>(null);

  return (
    <div className="relative flex-grow bg-fitmentor-black flex items-center justify-center">
      {/* Video element - Always render but conditionally display */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        style={{ transform: 'scaleX(-1)', minHeight: '400px' }}
        onLoadedMetadata={() => {
          console.log('Video metadata loaded:', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState
          });
        }}
        onError={(e) => {
          console.error('Video element error:', e);
        }}
      />

      {/* Motion detection component */}
      {cameraActive && (
        <MotionDetector
          videoRef={videoRef}
          isActive={isWorkoutActive}
          isPaused={isPaused}
          currentExercise={currentExercise}
          onRepDetected={onRepDetected}
          onPoseDetected={setDetectedPose}
        />
      )}

      {/* Camera disabled state */}
      {!cameraActive && (
        <div className="text-center p-10">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-dark-gray mb-4">
            <Camera size={32} className="text-fitmentor-cream" />
          </div>
          <h3 className="text-xl font-bold mb-2">Camera access required</h3>
          <p className="text-fitmentor-medium-gray mb-4">
            Enable your camera to get real-time form feedback and rep counting
          </p>
          <Button onClick={startStopCamera} className="secondary-button">
            Enable Camera
          </Button>
          {cameraPermission === false && (
            <div className="mt-4 p-3 border border-red-400 rounded bg-red-400/10">
              <p className="text-red-400 text-sm">
                Camera permission denied. Please check your browser settings and allow camera access.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise info overlay when workout is active */}
      {cameraActive && currentExercise && (
        <ExerciseOverlay
          exercise={currentExercise}
          currentRep={currentRep}
          isWorkoutActive={isWorkoutActive}
        />
      )}
    </div>
  );
};

export default CameraView;
