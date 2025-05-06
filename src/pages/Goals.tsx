
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Goals = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Goal state
  const [goalType, setGoalType] = useState("weight_loss");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [currentBodyFat, setCurrentBodyFat] = useState("");
  const [targetBodyFat, setTargetBodyFat] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [workoutDays, setWorkoutDays] = useState<number[]>([3]);
  const [workoutMinutes, setWorkoutMinutes] = useState<number[]>([30]);
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingGoal, setExistingGoal] = useState<any>(null);
  const [fetchingGoal, setFetchingGoal] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchExistingGoal = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching goals:", error);
          } else if (data) {
            setExistingGoal(data);
            setGoalType(data.goal_type || "weight_loss");
            setCurrentWeight(data.current_weight?.toString() || "");
            setTargetWeight(data.target_weight?.toString() || "");
            setCurrentBodyFat(data.current_body_fat?.toString() || "");
            setTargetBodyFat(data.target_body_fat?.toString() || "");
            setExperienceLevel(data.experience_level || "beginner");
            setWorkoutDays([data.workout_days_per_week || 3]);
            setWorkoutMinutes([data.workout_minutes_per_session || 30]);
            setTargetDate(data.target_date ? data.target_date.slice(0, 10) : "");
          }
        } catch (error) {
          console.error("Error fetching goals:", error);
        } finally {
          setFetchingGoal(false);
        }
      }
    };

    fetchExistingGoal();
  }, [user]);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to save goals.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const goalData = {
        user_id: user.id,
        goal_type: goalType,
        current_weight: currentWeight ? parseFloat(currentWeight) : null,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        current_body_fat: currentBodyFat ? parseFloat(currentBodyFat) : null,
        target_body_fat: targetBodyFat ? parseFloat(targetBodyFat) : null,
        experience_level: experienceLevel,
        workout_days_per_week: workoutDays[0],
        workout_minutes_per_session: workoutMinutes[0],
        target_date: targetDate || null,
      };

      let result;
      
      if (existingGoal) {
        result = await supabase
          .from('goals')
          .update(goalData)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('goals')
          .insert([goalData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Goals saved",
        description: "Your fitness goals have been updated successfully.",
      });
      
      // Navigate back to profile or dashboard
      navigate("/profile");
      
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: "Error saving goals",
        description: "There was a problem saving your goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || fetchingGoal) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <p className="text-xl">Loading...</p>
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
            Set Your Fitness Goals
          </h1>
          <p className="text-fitmentor-medium-gray">
            Define clear goals to track your progress and stay motivated
          </p>
        </div>

        <form onSubmit={handleSaveGoals}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Goal Type */}
            <Card className="glass-card border-none col-span-1 md:col-span-3">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What's your primary fitness goal?</h2>
                
                <RadioGroup 
                  value={goalType}
                  onValueChange={setGoalType}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem 
                      value="weight_loss" 
                      id="weight_loss" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="weight_loss"
                      className="flex flex-col items-center justify-center h-32 rounded-lg border border-fitmentor-cream/30 bg-fitmentor-dark-gray/40 p-4 hover:bg-fitmentor-dark-gray/60 cursor-pointer peer-data-[state=checked]:border-fitmentor-cream peer-data-[state=checked]:bg-fitmentor-dark-gray/80"
                    >
                      <span className="text-lg font-medium">Weight Loss</span>
                      <span className="text-sm text-fitmentor-medium-gray mt-2">Burn fat, get lean</span>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem 
                      value="muscle_gain" 
                      id="muscle_gain" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="muscle_gain"
                      className="flex flex-col items-center justify-center h-32 rounded-lg border border-fitmentor-cream/30 bg-fitmentor-dark-gray/40 p-4 hover:bg-fitmentor-dark-gray/60 cursor-pointer peer-data-[state=checked]:border-fitmentor-cream peer-data-[state=checked]:bg-fitmentor-dark-gray/80"
                    >
                      <span className="text-lg font-medium">Muscle Gain</span>
                      <span className="text-sm text-fitmentor-medium-gray mt-2">Build strength & size</span>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem 
                      value="endurance" 
                      id="endurance" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="endurance"
                      className="flex flex-col items-center justify-center h-32 rounded-lg border border-fitmentor-cream/30 bg-fitmentor-dark-gray/40 p-4 hover:bg-fitmentor-dark-gray/60 cursor-pointer peer-data-[state=checked]:border-fitmentor-cream peer-data-[state=checked]:bg-fitmentor-dark-gray/80"
                    >
                      <span className="text-lg font-medium">Endurance</span>
                      <span className="text-sm text-fitmentor-medium-gray mt-2">Improve stamina</span>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem 
                      value="general_fitness" 
                      id="general_fitness" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="general_fitness"
                      className="flex flex-col items-center justify-center h-32 rounded-lg border border-fitmentor-cream/30 bg-fitmentor-dark-gray/40 p-4 hover:bg-fitmentor-dark-gray/60 cursor-pointer peer-data-[state=checked]:border-fitmentor-cream peer-data-[state=checked]:bg-fitmentor-dark-gray/80"
                    >
                      <span className="text-lg font-medium">General Fitness</span>
                      <span className="text-sm text-fitmentor-medium-gray mt-2">Overall wellbeing</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Target Metrics */}
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Body Metrics</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentWeight" className="mb-2 block">
                      Current Weight (kg)
                    </Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 70"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetWeight" className="mb-2 block">
                      Target Weight (kg)
                    </Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 65"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentBodyFat" className="mb-2 block">
                      Current Body Fat (%)
                    </Label>
                    <Input
                      id="currentBodyFat"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 20"
                      value={currentBodyFat}
                      onChange={(e) => setCurrentBodyFat(e.target.value)}
                      className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetBodyFat" className="mb-2 block">
                      Target Body Fat (%)
                    </Label>
                    <Input
                      id="targetBodyFat"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 15"
                      value={targetBodyFat}
                      onChange={(e) => setTargetBodyFat(e.target.value)}
                      className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Workout Preferences */}
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Workout Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="experienceLevel" className="mb-2 block">
                      Experience Level
                    </Label>
                    <Select 
                      value={experienceLevel} 
                      onValueChange={setExperienceLevel}
                    >
                      <SelectTrigger className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-4 block">
                      Workouts per Week: {workoutDays[0]}
                    </Label>
                    <Slider
                      min={1}
                      max={7}
                      step={1}
                      value={workoutDays}
                      onValueChange={setWorkoutDays}
                      className="my-6"
                    />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                      <span>6</span>
                      <span>7</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-4 block">
                      Minutes per Workout: {workoutMinutes[0]}
                    </Label>
                    <Slider
                      min={10}
                      max={120}
                      step={5}
                      value={workoutMinutes}
                      onValueChange={setWorkoutMinutes}
                      className="my-6"
                    />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>10</span>
                      <span>30</span>
                      <span>60</span>
                      <span>90</span>
                      <span>120</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Timeline */}
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Goal Timeline</h2>
                
                <div>
                  <Label htmlFor="targetDate" className="mb-2 block">
                    Target Achievement Date
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-fitmentor-dark-gray/40 border-fitmentor-cream/30"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-fitmentor-medium-gray mt-2">
                    Set a realistic date to achieve your fitness goal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button type="submit" className="premium-button w-full md:w-auto" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Goals"}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Goals;
