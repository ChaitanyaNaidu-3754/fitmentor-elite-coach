
import { useEffect, useRef } from "react";

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

interface PoseDetectionOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  isPaused: boolean;
  detectedPose: Pose | null;
}

// This component has been disabled as requested
const PoseDetectionOverlay = ({ 
  videoRef, 
  isActive, 
  isPaused,
  detectedPose 
}: PoseDetectionOverlayProps) => {
  // Component is now empty, returning null regardless of props
  return null;
};

export default PoseDetectionOverlay;
