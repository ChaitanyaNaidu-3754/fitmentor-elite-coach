
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

const PoseDetectionOverlay = ({ 
  videoRef, 
  isActive, 
  isPaused,
  detectedPose 
}: PoseDetectionOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  
  // Colors for better visibility
  const colors = {
    joint: "#9b87f5",      // Bright purple for better visibility
    connection: "#7E69AB", // Secondary purple
    text: "#FFFFFF",       // White text
    background: "#0000001a" // Semi-transparent background
  };
  
  // Draw the pose skeleton on the canvas
  useEffect(() => {
    if (!isActive || isPaused || !videoRef.current || !canvasRef.current || !detectedPose) {
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (!ctx) return;
    
    // Match canvas size to video
    const resizeCanvas = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
      }
    };
    
    // Define connections between keypoints for skeleton
    const connections = [
      // Upper body
      ['nose', 'leftEye'], ['nose', 'rightEye'],
      ['leftEye', 'leftEar'], ['rightEye', 'rightEar'],
      ['nose', 'neck'],
      // Shoulders
      ['neck', 'leftShoulder'], ['neck', 'rightShoulder'],
      // Arms
      ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
      // Torso
      ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'],
      // Lower body
      ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
      ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
      ['leftHip', 'rightHip']
    ];
    
    // Animation loop to draw the skeleton
    const drawPose = () => {
      if (!ctx || !detectedPose) {
        requestAnimationFrameRef.current = requestAnimationFrame(drawPose);
        return;
      }
      
      resizeCanvas();
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections first (lines)
      ctx.strokeStyle = colors.connection;
      ctx.lineWidth = 3;
      
      connections.forEach(([from, to]) => {
        const fromJoint = detectedPose.keypoints[from];
        const toJoint = detectedPose.keypoints[to];
        
        if (fromJoint && toJoint && fromJoint.confidence > 0.3 && toJoint.confidence > 0.3) {
          ctx.beginPath();
          ctx.moveTo(fromJoint.x, fromJoint.y);
          ctx.lineTo(toJoint.x, toJoint.y);
          ctx.stroke();
        }
      });
      
      // Draw joints (circles) on top
      Object.entries(detectedPose.keypoints).forEach(([name, joint]) => {
        if (joint.confidence > 0.3) {
          // Draw circle
          ctx.fillStyle = colors.joint;
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          // Optional: Draw joint names for debugging
          if (process.env.NODE_ENV === 'development') {
            ctx.fillStyle = colors.text;
            ctx.font = '12px Inter';
            ctx.fillText(name, joint.x + 8, joint.y);
          }
        }
      });
      
      requestAnimationFrameRef.current = requestAnimationFrame(drawPose);
    };
    
    drawPose();
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
    };
  }, [isActive, isPaused, detectedPose, videoRef]);
  
  // Don't render if no pose or inactive
  if (!isActive || !detectedPose) return null;
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
      style={{ transform: 'scaleX(-1)' }} // Mirror to match video
    />
  );
};

export default PoseDetectionOverlay;
