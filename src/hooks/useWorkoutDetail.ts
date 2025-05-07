
import { useState, useEffect } from "react";
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

export const useWorkoutDetail = (id: string | undefined) => {
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

  return { workout, loading, error };
};
