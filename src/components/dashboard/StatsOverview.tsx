
import { BarChart3, Flame, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  streak: number;
  totalWorkoutTime: number;
  caloriesBurned: number;
  loading?: boolean;
}

const StatsOverview = ({ 
  streak = 0, 
  totalWorkoutTime = 0, 
  caloriesBurned = 0,
  loading = false
}: StatsOverviewProps) => {
  // Format workout time (minutes) to hours and minutes
  const formatWorkoutTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Display loading state if data is still loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card border-none">
            <CardContent className="p-6 min-h-[120px] flex items-center justify-center">
              <p className="text-fitmentor-medium-gray">Loading stats...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="glass-card border-none animate-slide-in" style={{animationDelay: "0ms"}}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-fitmentor-medium-gray text-sm font-medium mb-1">Workout Streak</p>
              <h4 className="text-3xl font-bold text-fitmentor-white">{streak} days</h4>
            </div>
            <div className="p-3 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-4 h-2 bg-fitmentor-dark-gray/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-fitmentor-cream to-fitmentor-cream/70 rounded-full"
              style={{ width: `${Math.min(streak * 10, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none animate-slide-in" style={{animationDelay: "100ms"}}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-fitmentor-medium-gray text-sm font-medium mb-1">Workout Time</p>
              <h4 className="text-3xl font-bold text-fitmentor-white">{formatWorkoutTime(totalWorkoutTime)}</h4>
            </div>
            <div className="p-3 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-fitmentor-medium-gray">Last 30 days</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none animate-slide-in" style={{animationDelay: "200ms"}}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-fitmentor-medium-gray text-sm font-medium mb-1">Calories Burned</p>
              <h4 className="text-3xl font-bold text-fitmentor-white">{caloriesBurned}</h4>
            </div>
            <div className="p-3 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream">
              <Flame size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-fitmentor-medium-gray">Last 7 days</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none animate-slide-in" style={{animationDelay: "300ms"}}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-fitmentor-medium-gray text-sm font-medium mb-1">Current Goal</p>
              <h4 className="text-xl font-bold text-fitmentor-white">Muscle Growth</h4>
            </div>
            <div className="p-3 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream">
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-1 h-2 bg-fitmentor-dark-gray/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-fitmentor-cream to-fitmentor-cream/70 rounded-full"
                style={{ width: "35%" }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-fitmentor-cream">35%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
