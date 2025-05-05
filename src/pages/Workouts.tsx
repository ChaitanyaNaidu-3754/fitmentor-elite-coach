
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WorkoutLibrary from "@/components/workouts/WorkoutLibrary";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Workouts = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Workout Library</h1>
            <p className="text-fitmentor-medium-gray">
              Discover professionally designed workouts to achieve your fitness goals
            </p>
          </div>
          <Link to="/live-workout" className="mt-4 md:mt-0">
            <Button className="premium-button">
              Start Live Workout
            </Button>
          </Link>
        </div>
        
        <WorkoutLibrary />
      </div>
      <Footer />
    </>
  );
};

export default Workouts;
