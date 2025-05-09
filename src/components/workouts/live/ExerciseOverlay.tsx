
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface ExerciseOverlayProps {
  exercise: {
    name: string;
    repsPerSet: number;
    description?: string;
    muscleGroups?: string[];
  } | null;
  currentRep: number;
  isWorkoutActive: boolean;
}

const ExerciseOverlay = ({ 
  exercise, 
  currentRep, 
  isWorkoutActive 
}: ExerciseOverlayProps) => {
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!isWorkoutActive || !exercise) return 0;
    return Math.floor((currentRep / exercise.repsPerSet) * 100);
  };
  
  if (!isWorkoutActive || !exercise) return null;

  // Format muscle groups for display
  const formattedMuscleGroups = exercise.muscleGroups 
    ? exercise.muscleGroups.join(', ')
    : 'Full body';

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fitmentor-black to-transparent p-6">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-fitmentor-cream mb-1">
            {exercise.name}
          </h3>
          <div className="px-2 py-1 bg-fitmentor-cream/20 rounded-full text-xs text-fitmentor-cream">
            {formattedMuscleGroups}
          </div>
        </div>
        
        {exercise.description && (
          <p className="text-sm text-fitmentor-medium-gray mb-3 line-clamp-2">
            {exercise.description}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-fitmentor-cream">{currentRep}</span>
            <span className="text-fitmentor-medium-gray">/ {exercise.repsPerSet} reps</span>
          </div>
          <Progress 
            value={calculateProgress()} 
            className="flex-1 h-2 bg-fitmentor-cream/20"
            indicatorClassName="bg-gradient-to-r from-fitmentor-light-green to-fitmentor-cream"
          />
        </div>
        
        <div className="mt-2 text-sm text-fitmentor-cream/70 flex items-center">
          <Clock size={14} className="mr-1" />
          <span>Keep proper form for accurate rep counting</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseOverlay;
