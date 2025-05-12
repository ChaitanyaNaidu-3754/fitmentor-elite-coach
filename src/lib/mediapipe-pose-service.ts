import { Pose } from '@/types/pose';

export class MediaPipePoseService {
  private static instance: MediaPipePoseService;
  private poseDetector: any = null;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): MediaPipePoseService {
    if (!MediaPipePoseService.instance) {
      MediaPipePoseService.instance = new MediaPipePoseService();
    }
    return MediaPipePoseService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Import MediaPipe Pose dynamically
      const poseDetection = await import('@mediapipe/pose');
      const cameraUtils = await import('@mediapipe/camera_utils');
      const drawingUtils = await import('@mediapipe/drawing_utils');

      // Initialize the pose detector
      this.poseDetector = new poseDetection.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      // Configure the pose detector
      this.poseDetector.setOptions({
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing MediaPipe Pose:', error);
      throw new Error('Failed to initialize MediaPipe Pose');
    }
  }

  async detectPose(imageData: ImageData): Promise<Pose | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const results = await this.poseDetector.send({ image: imageData });
      
      if (!results.poseLandmarks) {
        return null;
      }

      // Convert MediaPipe landmarks to our Pose format
      const keypoints: { [key: string]: any } = {};
      
      // Map MediaPipe landmarks to our keypoint format
      const landmarkMapping: { [key: number]: string } = {
        0: 'nose',
        11: 'leftShoulder',
        12: 'rightShoulder',
        13: 'leftElbow',
        14: 'rightElbow',
        15: 'leftWrist',
        16: 'rightWrist',
        23: 'leftHip',
        24: 'rightHip',
        25: 'leftKnee',
        26: 'rightKnee',
        27: 'leftAnkle',
        28: 'rightAnkle'
      };

      results.poseLandmarks.forEach((landmark: any, index: number) => {
        const keypointName = landmarkMapping[index];
        if (keypointName) {
          keypoints[keypointName] = {
            x: landmark.x,
            y: landmark.y,
            confidence: landmark.visibility
          };
        }
      });

      return {
        keypoints,
        score: results.poseWorldLandmarks ? 1.0 : 0.0
      };
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  }

  calculatePoseSimilarity(pose1: Pose, pose2: Pose): number {
    let totalSimilarity = 0;
    let validKeypoints = 0;

    // Compare each keypoint
    Object.keys(pose1.keypoints).forEach(key => {
      const joint1 = pose1.keypoints[key];
      const joint2 = pose2.keypoints[key];

      if (joint1 && joint2) {
        // Calculate Euclidean distance between keypoints
        const dx = joint1.x - joint2.x;
        const dy = joint1.y - joint2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Convert distance to similarity score (0 to 1)
        // Lower distance = higher similarity
        const similarity = Math.max(0, 1 - distance);
        
        totalSimilarity += similarity;
        validKeypoints++;
      }
    });

    // Return average similarity
    return validKeypoints > 0 ? totalSimilarity / validKeypoints : 0;
  }
} 