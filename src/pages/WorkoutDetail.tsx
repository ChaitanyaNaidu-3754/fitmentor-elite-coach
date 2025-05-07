import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Dumbbell, User, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  repsPerSet: number;
  durationSeconds: number | null;
  restSeconds: number;
  sequenceOrder: number;
  muscleGroups: string[];
  imageUrl: string | null;
}

interface WorkoutDetails {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  difficulty_level: string;
  exercise_type: string;
  muscle_groups: string[];
  equipment_needed: string[];
  exercises: Exercise[];
}

const WorkoutDetail = () => {
  const { id } = useParams();
  const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        // Fetch workout data
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .single();

        if (workoutError) throw workoutError;
        
        if (!workoutData) {
          setError("Workout not found");
          setLoading(false);
          return;
        }

        // Fetch exercises for this workout
        const { data: exercisesJunction, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select(`
            id,
            sets,
            reps_per_set,
            duration_seconds,
            rest_seconds,
            sequence_order,
            exercise:exercise_id (
              id,
              name,
              description,
              muscle_groups,
              image_url
            )
          `)
          .eq('workout_id', id)
          .order('sequence_order');

        if (exercisesError) throw exercisesError;

        // Transform the exercise data
        const exercises = exercisesJunction.map(item => ({
          id: item.exercise.id,
          name: item.exercise.name,
          description: item.exercise.description || '',
          sets: item.sets || 3,
          repsPerSet: item.reps_per_set || 10,
          durationSeconds: item.duration_seconds,
          restSeconds: item.rest_seconds || 60,
          sequenceOrder: item.sequence_order,
          muscleGroups: item.exercise.muscle_groups || [],
          imageUrl: item.exercise.image_url
        }));

        // Combine all data
        setWorkout({
          ...workoutData,
          exercises
        });
      } catch (err) {
        console.error("Error fetching workout details:", err);
        setError("Failed to load workout details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkoutDetails();
    }
  }, [id]);

  // Fallback content for when we don't have real data yet
  const sampleExercises = [
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

  // Display either real workout data or fallback sample data
  const displayWorkout = workout || {
    id: id || "1",
    name: "Full Body Power",
    description: "A complete workout targeting all major muscle groups for overall strength and endurance.",
    duration_minutes: 45,
    difficulty_level: "Intermediate",
    exercise_type: "Strength",
    muscle_groups: ["Full Body"],
    equipment_needed: ["None"],
    exercises: sampleExercises
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Loading workout details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-red-400 mb-4">{error}</p>
            <Link to="/workouts">
              <Button className="secondary-button">
                Back to Workouts
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{displayWorkout.name}</h1>
              <p className="text-fitmentor-medium-gray">
                {displayWorkout.description}
              </p>
            </div>
            <Link to={`/live-workout/${displayWorkout.id}`} className="mt-4 md:mt-0">
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
                <p className="text-lg font-medium text-fitmentor-cream">{displayWorkout.duration_minutes} min</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-fitmentor-medium-gray mb-1">Difficulty</p>
              <div className="flex items-center">
                <User size={16} className="mr-2 text-fitmentor-cream" />
                <p className="text-lg font-medium text-fitmentor-cream">{displayWorkout.difficulty_level}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-fitmentor-medium-gray mb-1">Type</p>
              <div className="flex items-center">
                <Dumbbell size={16} className="mr-2 text-fitmentor-cream" />
                <p className="text-lg font-medium text-fitmentor-cream">{displayWorkout.exercise_type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-fitmentor-medium-gray mb-1">Equipment</p>
              <p className="text-lg font-medium text-fitmentor-cream">{displayWorkout.equipment_needed.join(", ")}</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Exercise List</h2>
        <div className="space-y-6">
          {displayWorkout.exercises.map((exercise, index) => (
            <Card key={index} className="glass-card border-none overflow-hidden">
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
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WorkoutDetail;
