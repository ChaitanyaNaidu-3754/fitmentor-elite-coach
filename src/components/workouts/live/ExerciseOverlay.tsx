
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
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fitmentor-black via-fitmentor-black/80 to-transparent p-6 z-20">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold text-[#9b87f5] mb-1 drop-shadow-lg">
            {exercise.name}
          </h3>
          <div className="px-3 py-1.5 bg-[#7E69AB]/80 backdrop-blur-sm rounded-full text-sm font-medium text-white shadow-lg">
            {formattedMuscleGroups}
          </div>
        </div>
        
        {exercise.description && (
          <p className="text-base text-white mb-3 line-clamp-2 drop-shadow-md">
            {exercise.description}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-[#D6BCFA] drop-shadow-lg">{currentRep}</span>
            <span className="text-lg text-white">/ {exercise.repsPerSet} reps</span>
          </div>
          <Progress 
            value={calculateProgress()} 
            className="flex-1 h-3 bg-fitmentor-cream/20"
            indicatorClassName="bg-gradient-to-r from-[#8B5CF6] to-[#D6BCFA]"
          />
        </div>
        
        <div className="mt-3 text-base text-white flex items-center bg-black/30 px-3 py-2 rounded-md backdrop-blur-sm shadow-inner">
          <Clock size={16} className="mr-2 text-[#8B5CF6]" />
          <span>Keep proper form for accurate rep counting</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseOverlay;
