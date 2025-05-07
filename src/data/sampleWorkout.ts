
export const sampleExercises = [
  { 
    name: "Push-ups", 
    description: "A bodyweight exercise that targets your chest, shoulders, and triceps.",
    sets: 3,
    repsPerSet: 10,
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    restSeconds: 60
  },
  { 
    name: "Squats", 
    description: "A compound exercise that primarily targets your quadriceps, hamstrings, and glutes.",
    sets: 3,
    repsPerSet: 12,
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    restSeconds: 60
  },
  { 
    name: "Plank", 
    description: "A core exercise that engages multiple muscles simultaneously to improve stability.",
    sets: 3,
    repsPerSet: 1,
    durationSeconds: 60,
    muscleGroups: ["Core", "Shoulders", "Back"],
    imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1562c813c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    restSeconds: 45
  }
];

export const getSampleWorkout = (id: string) => ({
  id: id,
  name: "Full Body Power",
  description: "A complete workout targeting all major muscle groups for overall strength and endurance.",
  duration_minutes: 45,
  difficulty_level: "Intermediate",
  exercise_type: "Strength",
  muscle_groups: ["Full Body"],
  equipment_needed: ["None"],
  exercises: sampleExercises
});
