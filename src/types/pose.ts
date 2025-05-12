export interface Joint {
  x: number;
  y: number;
  confidence: number;
}

export interface Pose {
  keypoints: {
    [key: string]: Joint;
  };
  score: number;
} 