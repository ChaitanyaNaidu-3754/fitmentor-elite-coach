
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronRight, Target, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12">
        <DashboardHeader userName="Alex" />
        
        <StatsOverview streak={5} totalWorkoutTime={325} caloriesBurned={1250} />
        
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
                  src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                  alt="Full Body Power" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fitmentor-black to-transparent opacity-70"></div>
                <div className="absolute bottom-4 left-4 flex items-center">
                  <CalendarDays size={18} className="text-fitmentor-cream" />
                  <span className="ml-2 text-fitmentor-white font-medium">Today, 6:00 PM</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-fitmentor-cream">Full Body Power</h3>
                <p className="text-fitmentor-medium-gray mb-4">Complete a challenging full-body workout designed to build strength and endurance.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/live-workout/1">
                    <Button className="premium-button flex items-center">
                      <Play size={16} className="mr-2" />
                      Start Workout
                    </Button>
                  </Link>
                  <Link to="/workout/1">
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
            
            <Card className="glass-card border-none h-[calc(100%-2.5rem)]">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 animate-pulse-glow">
                    <Target size={36} className="text-fitmentor-cream" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-center text-fitmentor-cream mb-4">Muscle Growth</h3>
                
                <div className="bg-fitmentor-dark-gray/40 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-fitmentor-medium-gray">Progress</span>
                    <span className="text-sm font-medium text-fitmentor-cream">35%</span>
                  </div>
                  <div className="h-2 bg-fitmentor-dark-gray/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-fitmentor-cream to-fitmentor-cream/70 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-fitmentor-medium-gray text-sm space-y-4 flex-grow">
                  <div className="flex justify-between">
                    <span>Target Weight</span>
                    <span className="text-fitmentor-white">180 lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Body Fat</span>
                    <span className="text-fitmentor-white">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Weight</span>
                    <span className="text-fitmentor-white">172 lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Body Fat</span>
                    <span className="text-fitmentor-white">15%</span>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
