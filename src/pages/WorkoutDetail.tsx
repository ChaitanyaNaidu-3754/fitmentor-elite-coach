
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/workouts/detail/LoadingState";
import ErrorState from "@/components/workouts/detail/ErrorState";
import WorkoutHeader from "@/components/workouts/detail/WorkoutHeader";
import ExerciseCard from "@/components/workouts/detail/ExerciseCard";
import { useWorkoutDetail } from "@/hooks/useWorkoutDetail";
import { getSampleWorkout } from "@/data/sampleWorkout";

const WorkoutDetail = () => {
  const { id } = useParams();
  const { workout, loading, error } = useWorkoutDetail(id);
  
  // Display either real workout data or fallback sample data
  const displayWorkout = workout || (id ? getSampleWorkout(id) : null);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen">
          <LoadingState />
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
          <ErrorState error={error} />
        </div>
        <Footer />
      </>
    );
  }

  if (!displayWorkout) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen">
          <ErrorState error="Workout not found" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12">
        <WorkoutHeader workout={displayWorkout} />
        
        <h2 className="text-2xl font-bold mb-6">Exercise List</h2>
        <div className="space-y-6">
          {displayWorkout.exercises.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} index={index} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WorkoutDetail;
