
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [userGoals, setUserGoals] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserGoals = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching goals:", error);
          } else {
            setUserGoals(data);
          }
        } catch (error) {
          console.error("Error fetching goals:", error);
        } finally {
          setGoalsLoading(false);
        }
      }
    };

    const fetchUserStats = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching stats:", error);
          } else {
            setUserStats(data);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchUserGoals();
    fetchUserStats();
  }, [user]);

  // Format the date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <p className="text-xl">Loading profile data...</p>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Profile
          </h1>
          <p className="text-fitmentor-medium-gray">
            View and manage your personal information and fitness progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Info Card */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-none h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-fitmentor-dark-gray/40 flex items-center justify-center text-4xl text-fitmentor-cream mb-4">
                    {profile?.first_name ? profile.first_name[0].toUpperCase() : 'U'}
                  </div>
                  <h2 className="text-xl font-bold text-fitmentor-cream">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}` 
                      : "User"}
                  </h2>
                  <p className="text-fitmentor-medium-gray">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Age</p>
                    <p className="text-fitmentor-cream font-medium">{profile?.age || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Gender</p>
                    <p className="text-fitmentor-cream font-medium">{profile?.gender || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Height</p>
                    <p className="text-fitmentor-cream font-medium">{profile?.height ? `${profile.height} cm` : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Weight</p>
                    <p className="text-fitmentor-cream font-medium">{profile?.weight ? `${profile.weight} kg` : "Not set"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="secondary-button w-full" onClick={() => navigate("/profile-setup")}>
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Goals Tab */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="stats" className="glass-card border-none">
              <TabsList className="w-full glass-card border-none mb-6">
                <TabsTrigger value="stats" className="flex-1">Fitness Stats</TabsTrigger>
                <TabsTrigger value="goals" className="flex-1">Goals</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Workout History</TabsTrigger>
              </TabsList>
              
              {/* Stats Content */}
              <TabsContent value="stats" className="p-6">
                {statsLoading ? (
                  <div className="text-center py-10">
                    <p>Loading stats...</p>
                  </div>
                ) : userStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <Card className="glass-card border-none">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-fitmentor-medium-gray mb-2">Workout Streak</p>
                        <p className="text-3xl font-bold text-fitmentor-cream">{userStats.workout_streak || 0}</p>
                        <p className="text-xs text-fitmentor-medium-gray mt-1">days</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-none">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-fitmentor-medium-gray mb-2">Total Workouts</p>
                        <p className="text-3xl font-bold text-fitmentor-cream">{userStats.total_workouts || 0}</p>
                        <p className="text-xs text-fitmentor-medium-gray mt-1">sessions</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-none">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-fitmentor-medium-gray mb-2">Total Time</p>
                        <p className="text-3xl font-bold text-fitmentor-cream">{Math.floor((userStats.total_workout_time || 0) / 60)}</p>
                        <p className="text-xs text-fitmentor-medium-gray mt-1">minutes</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-none">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-fitmentor-medium-gray mb-2">Calories Burned</p>
                        <p className="text-3xl font-bold text-fitmentor-cream">{userStats.total_calories_burned || 0}</p>
                        <p className="text-xs text-fitmentor-medium-gray mt-1">kcal</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-none">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-fitmentor-medium-gray mb-2">Last Workout</p>
                        <p className="text-xl font-bold text-fitmentor-cream">
                          {userStats.last_workout_date 
                            ? formatDate(userStats.last_workout_date)
                            : "None yet"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-fitmentor-medium-gray mb-4">No stats available yet</p>
                    <p className="text-fitmentor-cream mb-6">Complete your first workout to start tracking your progress!</p>
                    <Button className="premium-button" onClick={() => navigate("/workouts")}>
                      Find a Workout
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Goals Content */}
              <TabsContent value="goals" className="p-6">
                {goalsLoading ? (
                  <div className="text-center py-10">
                    <p>Loading goals...</p>
                  </div>
                ) : userGoals ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-fitmentor-cream mb-4">Current Goal: {userGoals.goal_type}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-4">
                          <p className="text-sm text-fitmentor-medium-gray mb-2">Started</p>
                          <p className="text-lg font-medium text-fitmentor-cream">
                            {userGoals.start_date ? formatDate(userGoals.start_date) : "Not set"}
                          </p>
                        </div>
                        <div className="glass-card p-4">
                          <p className="text-sm text-fitmentor-medium-gray mb-2">Target Date</p>
                          <p className="text-lg font-medium text-fitmentor-cream">
                            {userGoals.target_date ? formatDate(userGoals.target_date) : "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-fitmentor-cream mb-3">Weight Goals</h4>
                        <div className="glass-card p-4 space-y-3">
                          <div className="flex justify-between">
                            <p className="text-sm text-fitmentor-medium-gray">Current</p>
                            <p className="text-fitmentor-cream">
                              {userGoals.current_weight ? `${userGoals.current_weight} kg` : "Not set"}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-fitmentor-medium-gray">Target</p>
                            <p className="text-fitmentor-cream">
                              {userGoals.target_weight ? `${userGoals.target_weight} kg` : "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-fitmentor-cream mb-3">Body Fat Goals</h4>
                        <div className="glass-card p-4 space-y-3">
                          <div className="flex justify-between">
                            <p className="text-sm text-fitmentor-medium-gray">Current</p>
                            <p className="text-fitmentor-cream">
                              {userGoals.current_body_fat ? `${userGoals.current_body_fat}%` : "Not set"}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-fitmentor-medium-gray">Target</p>
                            <p className="text-fitmentor-cream">
                              {userGoals.target_body_fat ? `${userGoals.target_body_fat}%` : "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-4 mb-6">
                      <h4 className="text-lg font-semibold text-fitmentor-cream mb-3">Workout Schedule</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-fitmentor-medium-gray mb-1">Experience Level</p>
                          <p className="text-fitmentor-cream">{userGoals.experience_level || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-fitmentor-medium-gray mb-1">Days per Week</p>
                          <p className="text-fitmentor-cream">
                            {userGoals.workout_days_per_week ? `${userGoals.workout_days_per_week} days` : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-fitmentor-medium-gray mb-1">Minutes per Session</p>
                          <p className="text-fitmentor-cream">
                            {userGoals.workout_minutes_per_session ? `${userGoals.workout_minutes_per_session} min` : "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button className="secondary-button" onClick={() => navigate("/goals")}>
                        Update Goals
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-fitmentor-medium-gray mb-4">You haven't set any goals yet</p>
                    <p className="text-fitmentor-cream mb-6">Setting clear fitness goals will help track your progress!</p>
                    <Button className="premium-button" onClick={() => navigate("/goals")}>
                      Set Your Goals
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Workout History */}
              <TabsContent value="history" className="p-6">
                <div className="text-center py-10">
                  <p className="text-fitmentor-medium-gray mb-4">No workout history available yet</p>
                  <p className="text-fitmentor-cream mb-6">Complete your first workout to see it here!</p>
                  <Button className="premium-button" onClick={() => navigate("/workouts")}>
                    Find a Workout
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
