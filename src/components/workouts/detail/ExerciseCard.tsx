
import { Card, CardContent } from "@/components/ui/card";

// Default exercise images based on muscle groups
const defaultExerciseImages: Record<string, string> = {
  "chest": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
  "back": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop",
  "shoulders": "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop",
  "legs": "https://images.unsplash.com/photo-1434608519344-49d01f1b1bdf?w=600&h=400&fit=crop",
  "arms": "https://images.unsplash.com/photo-1590507621108-433608c97823?w=600&h=400&fit=crop",
  "abs": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
  "default": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop"
};

// Function to determine image based on muscle groups
const getExerciseImage = (exercise: { imageUrl: string | null, muscleGroups: string[] }): string => {
  if (exercise.imageUrl) return exercise.imageUrl;
  
  // Check if we have a specific image for any of the muscle groups
  for (const group of exercise.muscleGroups) {
    const lowerGroup = group.toLowerCase();
    for (const [key, url] of Object.entries(defaultExerciseImages)) {
      if (lowerGroup.includes(key)) {
        return url;
      }
    }
  }
  
  // If no specific image found, return default
  return defaultExerciseImages.default;
};

// Get start and end position images for form analysis
export const getFormImages = (exercise: { name: string, muscleGroups: string[] }): { start: string, end: string } => {
  // These would normally come from an API or the GitHub repo mentioned
  // For now we'll simulate with muscle group based defaults
  const baseImage = getExerciseImage({ imageUrl: null, muscleGroups: exercise.muscleGroups });
  
  return {
    start: baseImage, // In a real implementation, these would be specific start/end images
    end: baseImage    // from the exercise database
  };
};

interface ExerciseProps {
  index: number;
  exercise: {
    id?: string;
    name: string;
    description: string;
    sets: number;
    repsPerSet: number;
    durationSeconds?: number | null;
    restSeconds: number;
    sequenceOrder?: number;
    muscleGroups: string[];
    imageUrl: string | null;
  };
}

const ExerciseCard = ({ exercise, index }: ExerciseProps) => {
  // Get appropriate image for the exercise
  const exerciseImage = getExerciseImage(exercise);
  
  return (
    <Card className="glass-card border-none overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 h-48 md:h-auto">
          <img 
            src={exerciseImage} 
            alt={exercise.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-6 w-full md:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h3 className="text-xl font-bold text-fitmentor-cream">{index + 1}. {exercise.name}</h3>
            <div className="mt-2 md:mt-0 px-2 py-1 rounded text-xs font-medium bg-fitmentor-dark-gray/80 text-fitmentor-cream">
              {exercise.muscleGroups.join(", ")}
            </div>
          </div>
          
          <p className="text-fitmentor-medium-gray mb-4">{exercise.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-fitmentor-medium-gray">Sets</p>
              <p className="font-medium text-fitmentor-cream">{exercise.sets}</p>
            </div>
            <div>
              <p className="text-sm text-fitmentor-medium-gray">
                {exercise.durationSeconds ? "Duration" : "Reps"}
              </p>
              <p className="font-medium text-fitmentor-cream">
                {exercise.durationSeconds 
                  ? `${exercise.durationSeconds} seconds`
                  : `${exercise.repsPerSet} reps`
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-fitmentor-medium-gray">Rest</p>
              <p className="font-medium text-fitmentor-cream">{exercise.restSeconds} sec</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ExerciseCard;
