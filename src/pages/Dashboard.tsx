import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, ChevronRight, Play, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userStats, setUserStats] = useState<any>(null);
  const [userGoals, setUserGoals] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [recommendedWorkout, setRecommendedWorkout] = useState<any>(null);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // If user is logged in but doesn't have profile info, redirect to profile setup
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && 
        (profile.age === null || profile.weight === null || profile.height === null || profile.gender === null)) {
      navigate("/profile-setup");
    }
  }, [user, profile, loading, profileLoading, navigate]);
  
  // Check if navigating back from workout completion
  useEffect(() => {
    // Force refresh when coming from a workout page to ensure latest stats are loaded
    if (location.state && location.state.fromWorkout) {
      console.log("Navigated from workout, refreshing data");
      fetchDashboardData();
    }
  }, [location]);
  
  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    
    console.log("Fetching dashboard data at:", new Date().toISOString());
    
    // Fetch user stats
    try {
      setStatsLoading(true);
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user stats:", error);
      } else {
        console.log("Fetched user stats:", data);
        setUserStats(data);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setStatsLoading(false);
    }
    
    // Fetch user goals
    try {
      setGoalsLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user goals:", error);
      } else {
        console.log("Fetched user goals:", data);
        setUserGoals(data);
      }
    } catch (err) {
      console.error("Error fetching user goals:", err);
    } finally {
      setGoalsLoading(false);
    }
    
    // Fetch recommended workout
    try {
      setWorkoutLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching recommended workout:", error);
      } else {
        setRecommendedWorkout(data);
      }
    } catch (err) {
      console.error("Error fetching recommended workout:", err);
    } finally {
      setWorkoutLoading(false);
    }
  };
  
  // Refresh data when component mounts, user changes, or route changes
  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      setLastRefresh(Date.now());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, location.pathname, lastRefresh]);
  
  // Default/placeholder workout if none is found
  const defaultWorkout = {
    id: "1",
    name: "Full Body Power",
    description: "Complete a challenging full-body workout designed to build strength and endurance.",
    duration_minutes: 45,
    muscle_groups: ["Full Body"],
    difficulty_level: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  };
  
  // Get user's display name from profile
  const userName = profile?.first_name || "Fitness Enthusiast";
  
  // Show a "new account" view if user has no stats yet
  const isNewAccount = !loading && !statsLoading && user && !userStats;

  // Manual refresh button handler
  const handleManualRefresh = () => {
    setLastRefresh(Date.now());
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12">
        <div className="flex justify-between items-center mb-4">
          <DashboardHeader userName={userName} />
          <Button 
            variant="outline" 
            className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream/10"
            onClick={handleManualRefresh}
          >
            Refresh Data
          </Button>
        </div>
        
        {isNewAccount ? (
          <div className="text-center py-16 my-8 glass-card">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-cream/20 mb-6">
              <Target size={36} className="text-fitmentor-cream" />
            </div>
            <h2 className="text-2xl font-bold text-fitmentor-cream mb-3">Welcome to FitMentor Elite!</h2>
            <p className="text-fitmentor-medium-gray max-w-lg mx-auto mb-8">
              There's no workout data to display yet. Start by setting your fitness goals and completing your first workout to see your progress here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/goals">
                <Button className="premium-button min-w-[160px]">
                  Set Goals
                </Button>
              </Link>
              <Link to="/workouts">
                <Button className="secondary-button min-w-[160px]">
                  Find Workouts
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <StatsOverview 
              streak={userStats?.workout_streak || 0} 
              totalWorkoutTime={userStats?.total_workout_time || 0} 
              caloriesBurned={userStats?.total_calories_burned || 0} 
              goalProgress={userGoals?.progress_percent || 0}
              goalType={userGoals?.goal_type === "weight_loss" ? "Weight Loss" : 
                        userGoals?.goal_type === "muscle_gain" ? "Muscle Growth" :
                        userGoals?.goal_type === "endurance" ? "Endurance" :
                        "General Fitness"}
              loading={statsLoading || goalsLoading}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Workout */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Upcoming Workout</h2>
                  <Link to="/workouts">
                    <Button variant="link" className="text-fitmentor-cream p-0">
                      View All
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
                
                <Card className="glass-card border-none overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={recommendedWorkout?.imageUrl || defaultWorkout.imageUrl}
                      alt={recommendedWorkout?.name || defaultWorkout.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fitmentor-black to-transparent opacity-70"></div>
                    <div className="absolute bottom-4 left-4 flex items-center">
                      <CalendarDays size={18} className="text-fitmentor-cream" />
                      <span className="ml-2 text-fitmentor-white font-medium">Today, 6:00 PM</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-fitmentor-cream">
                      {recommendedWorkout?.name || defaultWorkout.name}
                    </h3>
                    <p className="text-fitmentor-medium-gray mb-4">
                      {recommendedWorkout?.description || defaultWorkout.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to={`/live-workout/${recommendedWorkout?.id || defaultWorkout.id}`}>
                        <Button className="premium-button flex items-center">
                          <Play size={16} className="mr-2" />
                          Start Workout
                        </Button>
                      </Link>
                      <Link to={`/workout/${recommendedWorkout?.id || defaultWorkout.id}`}>
                        <Button className="secondary-button">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Current Goal */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Current Goal</h2>
                  <Link to="/goals">
                    <Button variant="link" className="text-fitmentor-cream p-0">
                      Update
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {goalsLoading ? (
                  <div className="glass-card border-none h-[calc(100%-2.5rem)] flex items-center justify-center">
                    <p>Loading goals...</p>
                  </div>
                ) : userGoals ? (
                  <Card className="glass-card border-none h-[calc(100%-2.5rem)]">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-center mb-6">
                        <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 animate-pulse-glow">
                          <Target size={36} className="text-fitmentor-cream" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-center text-fitmentor-cream mb-4">
                        {userGoals.goal_type === "weight_loss" ? "Weight Loss" : 
                         userGoals.goal_type === "muscle_gain" ? "Muscle Growth" :
                         userGoals.goal_type === "endurance" ? "Endurance" :
                         "General Fitness"}
                      </h3>
                      
                      <div className="bg-fitmentor-dark-gray/40 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-fitmentor-medium-gray">Progress</span>
                          <span className="text-sm font-medium text-fitmentor-cream">
                            {Math.round(userGoals.progress_percent || 0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-fitmentor-dark-gray/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-fitmentor-cream to-fitmentor-cream/70 rounded-full"
                            style={{ width: `${Math.round(userGoals.progress_percent || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-fitmentor-medium-gray text-sm space-y-4 flex-grow">
                        <div className="flex justify-between">
                          <span>Target Weight</span>
                          <span className="text-fitmentor-white">
                            {userGoals.target_weight ? `${userGoals.target_weight} kg` : "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Body Fat</span>
                          <span className="text-fitmentor-white">
                            {userGoals.target_body_fat ? `${userGoals.target_body_fat}%` : "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Weight</span>
                          <span className="text-fitmentor-white">
                            {userGoals.current_weight ? `${userGoals.current_weight} kg` : "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Body Fat</span>
                          <span className="text-fitmentor-white">
                            {userGoals.current_body_fat ? `${userGoals.current_body_fat}%` : "Not set"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Link to="/goals">
                          <Button className="secondary-button w-full">
                            Edit Goal
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-none h-[calc(100%-2.5rem)]">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                      <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 mb-4">
                        <Target size={36} className="text-fitmentor-cream" />
                      </div>
                      <h3 className="text-xl font-bold text-fitmentor-cream mb-2">No Goals Set</h3>
                      <p className="text-center text-fitmentor-medium-gray mb-6">
                        Define your fitness goals to track your progress
                      </p>
                      <Link to="/goals">
                        <Button className="secondary-button">
                          Set Goals
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
