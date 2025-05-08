
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, CheckCircle2, SkipForward, Camera, CameraOff } from "lucide-react";

interface WorkoutControlsProps {
  isWorkoutActive: boolean;
  isPaused: boolean;
  cameraActive: boolean;
  handleStartWorkout: () => void;
  handlePauseWorkout: () => void;
  handleResetWorkout: () => void;
  handleCameraToggle: () => void;
  handleNextExercise: () => void;
  handleCompleteWorkout: () => void;
  isLastExercise: boolean;
}

const WorkoutControls = ({
  isWorkoutActive,
  isPaused,
  cameraActive,
  handleStartWorkout,
  handlePauseWorkout,
  handleResetWorkout,
  handleCameraToggle,
  handleNextExercise,
  handleCompleteWorkout,
  isLastExercise
}: WorkoutControlsProps) => {
  return (
    <div className="p-6 border-t border-fitmentor-cream/10 flex justify-between items-center">
      {!cameraActive ? (
        <Button 
          onClick={handleCameraToggle}
          className="premium-button"
        >
          <Camera size={16} className="mr-2" />
          Enable Camera
        </Button>
      ) : (
        <>
          {!isWorkoutActive ? (
            <Button 
              onClick={handleStartWorkout}
              className="premium-button"
            >
              <Play size={16} className="mr-2" />
              Start Workout
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                onClick={handlePauseWorkout}
                variant="outline"
                className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
              >
                {isPaused ? (
                  <>
                    <Play size={16} className="mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button 
                onClick={handleNextExercise}
                variant="outline"
                className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
              >
                <SkipForward size={16} className="mr-2" />
                Next Exercise
              </Button>
              <Button 
                onClick={handleResetWorkout}
                variant="outline"
                className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </div>
          )}
          <Button 
            onClick={handleCameraToggle}
            variant="outline"
            className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
          >
            <CameraOff size={16} className="mr-2" />
            Disable Camera
          </Button>
        </>
      )}
      
      {isWorkoutActive && isLastExercise && (
        <Button 
          onClick={handleCompleteWorkout}
          className="ml-3 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle2 size={16} className="mr-2" />
          Complete Workout
        </Button>
      )}
    </div>
  );
};

export default WorkoutControls;
