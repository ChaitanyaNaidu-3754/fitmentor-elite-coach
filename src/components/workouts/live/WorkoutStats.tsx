
import { Progress } from "@/components/ui/progress";

interface WorkoutStatsProps {
  timeElapsed: number;
  caloriesBurned: number;
  currentExercise: number;
  currentRep: number;
  totalExercises: number;
  exercise: any;
  isWorkoutActive: boolean;
}

const WorkoutStats = ({
  timeElapsed,
  caloriesBurned,
  currentExercise,
  currentRep,
  totalExercises,
  exercise,
  isWorkoutActive
}: WorkoutStatsProps) => {
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate exercise progress percentage
  const calculateExerciseProgress = () => {
    if (!isWorkoutActive) return 0;
    const currentExerciseReps = exercise?.repsPerSet || 10;
    return Math.floor((currentRep / currentExerciseReps) * 100);
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-4">Workout Stats</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Time Elapsed</p>
          <p className="text-3xl font-bold text-fitmentor-cream">{formatTime(timeElapsed)}</p>
        </div>
        
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Calories Burned</p>
          <p className="text-3xl font-bold text-fitmentor-cream">{Math.floor(caloriesBurned)}</p>
        </div>
        
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Current Exercise</p>
          <p className="text-xl font-bold text-fitmentor-cream">
            {isWorkoutActive 
              ? exercise?.name || "Exercise"
              : "Not started"
            }
          </p>
        </div>
        
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-2">Exercise Progress</p>
          <Progress value={calculateExerciseProgress()} className="h-2 mb-1" />
          <div className="flex justify-between text-xs text-fitmentor-medium-gray">
            <span>{currentRep} reps</span>
            <span>{exercise?.repsPerSet || 10} reps</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-2">Workout Progress</p>
          <Progress 
            value={Math.floor(((currentExercise) / totalExercises) * 100)} 
            className="h-2 mb-1" 
          />
          <div className="flex justify-between text-xs text-fitmentor-medium-gray">
            <span>Exercise {currentExercise + 1}</span>
            <span>{totalExercises} total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutStats;
