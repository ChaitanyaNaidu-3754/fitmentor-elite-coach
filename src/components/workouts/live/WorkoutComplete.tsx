
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface WorkoutCompleteProps {
  timeElapsed: number;
  caloriesBurned: number;
  handleResetWorkout: () => void;
}

const WorkoutComplete = ({
  timeElapsed,
  caloriesBurned,
  handleResetWorkout
}: WorkoutCompleteProps) => {
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="glass-card p-10 max-w-lg w-full text-center animate-fade-in">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-cream/20 mb-6">
          <CheckCircle2 size={48} className="text-fitmentor-cream" />
        </div>
        <h2 className="text-3xl font-bold text-fitmentor-cream mb-4">Workout Complete!</h2>
        <p className="text-fitmentor-medium-gray mb-6">You've successfully completed your workout session.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-4">
            <p className="text-sm text-fitmentor-medium-gray">Duration</p>
            <p className="text-2xl font-bold text-fitmentor-cream">{formatTime(timeElapsed)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-fitmentor-medium-gray">Calories</p>
            <p className="text-2xl font-bold text-fitmentor-cream">{Math.floor(caloriesBurned)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="premium-button w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={handleResetWorkout} className="w-full border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
            Start Another Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutComplete;
