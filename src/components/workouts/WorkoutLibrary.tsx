
import { useState } from "react";
import WorkoutCard, { WorkoutCardProps } from "./WorkoutCard";
import WorkoutFilters from "./WorkoutFilters";

// Sample workout data for demonstration
const sampleWorkouts: WorkoutCardProps[] = [
  {
    id: "1",
    title: "Full Body Power",
    duration: 45,
    level: "Intermediate",
    category: "Strength",
    muscleGroups: ["Full Body"],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "2",
    title: "Upper Body Blast",
    duration: 30,
    level: "Advanced",
    category: "Strength",
    muscleGroups: ["Chest", "Back", "Shoulders"],
    imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "3",
    title: "Core Crusher",
    duration: 20,
    level: "Beginner",
    category: "Strength",
    muscleGroups: ["Core"],
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "4",
    title: "HIIT Cardio",
    duration: 25,
    level: "Intermediate",
    category: "Cardio",
    muscleGroups: ["Full Body"],
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1746&q=80"
  },
  {
    id: "5",
    title: "Lower Body Focus",
    duration: 40,
    level: "Beginner",
    category: "Strength",
    muscleGroups: ["Legs", "Glutes"],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: "6",
    title: "Flexibility Flow",
    duration: 35,
    level: "Beginner",
    category: "Flexibility",
    muscleGroups: ["Full Body"],
    imageUrl: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  }
];

const WorkoutLibrary = () => {
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutCardProps[]>(sampleWorkouts);
  
  const handleFilterChange = (filters: any) => {
    // Filter the workouts based on the selected filters
    let filtered = [...sampleWorkouts];
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(workout => 
        workout.title.toLowerCase().includes(query) || 
        workout.muscleGroups.some((group: string) => group.toLowerCase().includes(query))
      );
    }
    
    // Filter by exercise type
    if (filters.exerciseType) {
      filtered = filtered.filter(workout => 
        workout.category.toLowerCase() === filters.exerciseType.toLowerCase()
      );
    }
    
    // Filter by fitness level
    if (filters.fitnessLevel) {
      filtered = filtered.filter(workout => 
        workout.level.toLowerCase() === filters.fitnessLevel.toLowerCase()
      );
    }
    
    // Filter by duration
    if (filters.duration && filters.duration.length === 2) {
      filtered = filtered.filter(workout => 
        workout.duration >= filters.duration[0] && workout.duration <= filters.duration[1]
      );
    }
    
    // Filter by muscle group
    if (filters.muscleGroup) {
      filtered = filtered.filter(workout => 
        workout.muscleGroups.some((group: string) => 
          group.toLowerCase() === filters.muscleGroup.toLowerCase()
        )
      );
    }
    
    setFilteredWorkouts(filtered);
  };

  return (
    <div>
      <WorkoutFilters onFilterChange={handleFilterChange} />
      
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <h3 className="text-xl font-semibold text-fitmentor-cream mb-2">No workouts found</h3>
          <p className="text-fitmentor-medium-gray">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout, index) => (
            <WorkoutCard key={workout.id} {...workout} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;
