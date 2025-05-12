import { Pose } from '@/types/pose';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export interface ExercisePoseData {
  startPose: Pose;
  endPose: Pose;
  startImage: string;
  endImage: string;
}

export class ExercisePoseService {
  private static instance: ExercisePoseService;
  private poseCache: Map<string, ExercisePoseData> = new Map();

  private constructor() {}

  static getInstance(): ExercisePoseService {
    if (!ExercisePoseService.instance) {
      ExercisePoseService.instance = new ExercisePoseService();
    }
    return ExercisePoseService.instance;
  }

  async getExercisePoseData(exerciseName: string): Promise<ExercisePoseData> {
    // Check cache first
    if (this.poseCache.has(exerciseName)) {
      return this.poseCache.get(exerciseName)!;
    }

    try {
      // Fetch start and end images
      const startImageUrl = `${GITHUB_BASE_URL}/${exerciseName}/0.jpg`;
      const endImageUrl = `${GITHUB_BASE_URL}/${exerciseName}/1.jpg`;

      // Load images and extract pose data
      const [startPose, endPose] = await Promise.all([
        this.extractPoseFromImage(startImageUrl),
        this.extractPoseFromImage(endImageUrl)
      ]);

      const poseData: ExercisePoseData = {
        startPose,
        endPose,
        startImage: startImageUrl,
        endImage: endImageUrl
      };

      // Cache the results
      this.poseCache.set(exerciseName, poseData);

      return poseData;
    } catch (error) {
      console.error('Error fetching exercise pose data:', error);
      throw new Error(`Failed to load pose data for exercise: ${exerciseName}`);
    }
  }

  private async extractPoseFromImage(imageUrl: string): Promise<Pose> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw image to canvas
      ctx.drawImage(imageBitmap, 0, 0);
      
      // Get image data for pose detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use MediaPipe Pose to detect pose in the image
      // This is a placeholder - you'll need to implement the actual pose detection
      const pose = await this.detectPoseInImage(imageData);
      
      return pose;
    } catch (error) {
      console.error('Error extracting pose from image:', error);
      throw new Error('Failed to extract pose from image');
    }
  }

  private async detectPoseInImage(imageData: ImageData): Promise<Pose> {
    // This is where you'll integrate MediaPipe Pose
    // For now, return a placeholder pose
    return {
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

  clearCache() {
    this.poseCache.clear();
  }
} 