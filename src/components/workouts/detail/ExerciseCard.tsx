
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card className="glass-card border-none overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {exercise.imageUrl && (
          <div className="w-full md:w-1/4 h-48 md:h-auto">
            <img 
              src={exercise.imageUrl} 
              alt={exercise.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
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
