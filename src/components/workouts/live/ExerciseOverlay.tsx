
import { Progress } from "@/components/ui/progress";

interface ExerciseOverlayProps {
  exercise: {
    name: string;
    repsPerSet: number;
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

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fitmentor-black to-transparent p-6">
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold text-fitmentor-cream mb-1">
          {exercise.name}
        </h3>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-fitmentor-cream">{currentRep}</span>
            <span className="text-fitmentor-medium-gray">/ {exercise.repsPerSet} reps</span>
          </div>
          <Progress value={calculateProgress()} className="flex-1 h-2" />
        </div>
      </div>
    </div>
  );
};

export default ExerciseOverlay;
