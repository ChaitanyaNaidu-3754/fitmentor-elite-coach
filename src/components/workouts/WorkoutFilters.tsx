
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Clock } from "lucide-react";

interface WorkoutFiltersProps {
  onFilterChange: (filters: any) => void;
}

const WorkoutFilters = ({ onFilterChange }: WorkoutFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [duration, setDuration] = useState([15, 60]);
  const [muscleGroup, setMuscleGroup] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const filters = {
      searchQuery,
      exerciseType,
      fitnessLevel,
      duration,
      muscleGroup
    };
    
    onFilterChange(filters);
  }, [searchQuery, exerciseType, fitnessLevel, duration, muscleGroup, onFilterChange]);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fitmentor-medium-gray" />
          <Input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-10"
          />
        </div>
        
        <Button 
          variant="outline" 
          className="md:w-auto border-fitmentor-cream/20 text-fitmentor-cream hover:bg-fitmentor-dark-gray/80 hover:border-fitmentor-cream/40"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} className="mr-2" />
          Filters
        </Button>
      </div>
      
      {showFilters && (
        <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in">
          <div>
            <label className="text-sm font-medium text-fitmentor-cream mb-2 block">
              Exercise Type
            </label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger className="premium-input">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-fitmentor-cream mb-2 block">
              Fitness Level
            </label>
            <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
              <SelectTrigger className="premium-input">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-fitmentor-cream mb-2 block">
              Muscle Group
            </label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger className="premium-input">
                <SelectValue placeholder="All muscles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All muscles</SelectItem>
                <SelectItem value="chest">Chest</SelectItem>
                <SelectItem value="back">Back</SelectItem>
                <SelectItem value="legs">Legs</SelectItem>
                <SelectItem value="shoulders">Shoulders</SelectItem>
                <SelectItem value="arms">Arms</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="fullbody">Full Body</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-fitmentor-cream mb-2 flex items-center">
              <Clock size={16} className="mr-2" />
              Duration (minutes)
            </label>
            <div className="px-2">
              <Slider
                defaultValue={duration}
                min={5}
                max={90}
                step={5}
                onValueChange={(value) => setDuration(value as number[])}
                className="mt-6"
              />
              <div className="flex justify-between mt-2 text-xs text-fitmentor-medium-gray">
                <span>{duration[0]} min</span>
                <span>{duration[1]} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutFilters;
