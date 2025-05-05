
import { Clock, Dumbbell, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface WorkoutCardProps {
  id: string;
  title: string;
  duration: number;
  level: string;
  category: string;
  muscleGroups: string[];
  imageUrl?: string;
}

const WorkoutCard = ({
  id,
  title,
  duration,
  level,
  category,
  muscleGroups,
  imageUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
}: WorkoutCardProps) => {
  return (
    <Card className="glass-card border-none overflow-hidden group hover:shadow-[0_0_15px_rgba(188,171,174,0.2)] transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-fitmentor-black to-transparent opacity-80"></div>
        <div className="absolute bottom-4 left-4 flex items-center">
          <span className="px-2 py-1 rounded text-xs font-medium bg-fitmentor-cream text-fitmentor-black">
            {level}
          </span>
          <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-fitmentor-dark-gray/80 text-fitmentor-cream">
            {category}
          </span>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-fitmentor-cream">{title}</h3>
        
        <div className="flex items-center text-fitmentor-medium-gray mb-4">
          <Clock size={16} />
          <span className="ml-2 text-sm">{duration} min</span>
          <span className="mx-2">•</span>
          <Dumbbell size={16} />
          <span className="ml-2 text-sm">{muscleGroups.join(", ")}</span>
        </div>
        
        <Link to={`/workout/${id}`}>
          <Button className="w-full secondary-button group-hover:border-fitmentor-cream/40 flex items-center justify-between">
            <span>View Workout</span>
            <ChevronRight size={16} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
