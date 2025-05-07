
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-xl text-red-400 mb-4">{error}</p>
      <Link to="/workouts">
        <Button className="secondary-button">
          Back to Workouts
        </Button>
      </Link>
    </div>
  );
};

export default ErrorState;
