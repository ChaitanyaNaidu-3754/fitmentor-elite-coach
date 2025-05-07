
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Dumbbell, User, Play } from "lucide-react";

interface WorkoutHeaderProps {
  workout: {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    difficulty_level: string;
    exercise_type: string;
    muscle_groups: string[];
    equipment_needed: string[];
  };
}

const WorkoutHeader = ({ workout }: WorkoutHeaderProps) => {
  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{workout.name}</h1>
          <p className="text-fitmentor-medium-gray">
            {workout.description}
          </p>
        </div>
        <Link to={`/live-workout/${workout.id}`} className="mt-4 md:mt-0">
          <Button className="premium-button flex items-center">
            <Play size={16} className="mr-2" />
            Start Workout
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 glass-card p-6">
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Duration</p>
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-fitmentor-cream" />
            <p className="text-lg font-medium text-fitmentor-cream">{workout.duration_minutes} min</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Difficulty</p>
          <div className="flex items-center">
            <User size={16} className="mr-2 text-fitmentor-cream" />
            <p className="text-lg font-medium text-fitmentor-cream">{workout.difficulty_level}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Type</p>
          <div className="flex items-center">
            <Dumbbell size={16} className="mr-2 text-fitmentor-cream" />
            <p className="text-lg font-medium text-fitmentor-cream">{workout.exercise_type}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-1">Equipment</p>
          <p className="text-lg font-medium text-fitmentor-cream">{workout.equipment_needed.join(", ")}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHeader;
