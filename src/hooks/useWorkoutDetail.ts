
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSampleWorkout } from "@/data/sampleWorkout";

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

export const useWorkoutDetail = (id: string | undefined) => {
  const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        if (!id) {
          setError("Workout ID is required");
          setLoading(false);
          return;
        }

        // For numeric IDs, use sample data directly
        // This helps with the default routes like /workout/1
        if (!isNaN(Number(id))) {
          console.log(`Using sample workout data for numeric ID: ${id}`);
          const sampleData = getSampleWorkout(id);
          setWorkout(sampleData);
          setLoading(false);
          return;
        }

        console.log(`Fetching workout with ID: ${id}`);
        // Fetch workout data from Supabase
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .maybeSingle();  // Using maybeSingle instead of single to avoid errors

        if (workoutError) {
          console.error("Error fetching workout:", workoutError);
          const sampleData = getSampleWorkout(id);
          setWorkout(sampleData);
          setLoading(false);
          return;
        }
        
        if (!workoutData) {
          console.log("No workout found, using sample data");
          const sampleData = getSampleWorkout(id);
          setWorkout(sampleData);
          setLoading(false);
          return;
        }

        console.log("Workout found:", workoutData);
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

        if (exercisesError) {
          console.error("Error fetching exercises:", exercisesError);
          // If we get an error fetching exercises, use sample data exercises
          const sampleData = getSampleWorkout(id);
          setWorkout({
            ...workoutData,
            exercises: sampleData.exercises
          });
          setLoading(false);
          return;
        }

        console.log(`Found ${exercisesJunction?.length || 0} exercises`);
        
        // Transform the exercise data
        const exercises = exercisesJunction && exercisesJunction.length > 0 ? 
          exercisesJunction.map(item => ({
            id: item.exercise.id,
            name: item.exercise.name,
            description: item.exercise.description || 'No description available',
            sets: item.sets || 3,
            repsPerSet: item.reps_per_set || 10,
            durationSeconds: item.duration_seconds,
            restSeconds: item.rest_seconds || 60,
            sequenceOrder: item.sequence_order,
            muscleGroups: item.exercise.muscle_groups || [],
            imageUrl: item.exercise.image_url
          })) :
          // If no exercises found, use sample exercises
          getSampleWorkout(id).exercises;

        // Combine all data
        setWorkout({
          ...workoutData,
          exercises
        });
      } catch (err) {
        console.error("Error fetching workout details:", err);
        // Fall back to sample data on any error
        if (id) {
          const sampleData = getSampleWorkout(id);
          setWorkout(sampleData);
        } else {
          setError("Failed to load workout details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id]);

  return { workout, loading, error };
};
