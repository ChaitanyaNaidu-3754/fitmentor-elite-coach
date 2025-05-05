
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";

// Step 1: Basic Information
const basicsSchema = z.object({
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  height: z.coerce.number().min(1, "Height is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
});

// Step 2: Goals
const goalsSchema = z.object({
  primary_goal: z.enum(["lose_weight", "gain_muscle", "improve_fitness", "maintain"], {
    required_error: "Please select your main goal",
  }),
  experience_level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level",
  }),
  target_weight: z.coerce.number().min(1, "Target weight is required"),
  target_body_fat: z.coerce.number().min(1).max(100, "Body fat percentage must be between 1 and 100"),
});

// Step 3: Schedule
const scheduleSchema = z.object({
  workout_days_per_week: z.enum(["1", "2", "3", "4", "5", "6", "7"], {
    required_error: "Please select days per week",
  }),
  workout_time_per_session: z.enum(["15", "30", "45", "60", "90"], {
    required_error: "Please select time per workout",
  }),
});

const ProfileSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 form
  const basicsForm = useForm<z.infer<typeof basicsSchema>>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
    },
  });
  
  // Step 2 form
  const goalsForm = useForm<z.infer<typeof goalsSchema>>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      primary_goal: undefined,
      experience_level: undefined,
      target_weight: undefined,
      target_body_fat: undefined,
    },
  });
  
  // Step 3 form
  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      workout_days_per_week: undefined,
      workout_time_per_session: undefined,
    },
  });
  
  const onSubmitBasics = (data: z.infer<typeof basicsSchema>) => {
    // Store the data temporarily and move to next step
    localStorage.setItem('user-profile-basics', JSON.stringify(data));
    setCurrentStep(2);
  };
  
  const onSubmitGoals = (data: z.infer<typeof goalsSchema>) => {
    // Store the data temporarily and move to next step
    localStorage.setItem('user-profile-goals', JSON.stringify(data));
    setCurrentStep(3);
  };
  
  const onSubmitSchedule = async (data: z.infer<typeof scheduleSchema>) => {
    if (!user) return;
    
    // Get stored data from previous steps
    const basicsData = JSON.parse(localStorage.getItem('user-profile-basics') || '{}');
    const goalsData = JSON.parse(localStorage.getItem('user-profile-goals') || '{}');
    
    setLoading(true);
    
    try {
      // 1. Update user profile with basics data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          age: basicsData.age,
          weight: basicsData.weight,
          height: basicsData.height,
          gender: basicsData.gender,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      // 2. Insert or update user goals
      const { error: goalsError } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          goal_type: goalsData.primary_goal,
          current_weight: basicsData.weight,
          target_weight: goalsData.target_weight,
          target_body_fat: goalsData.target_body_fat,
          // Store experience level as part of the goal metadata
          experience_level: goalsData.experience_level,
          // Store schedule data with the goal
          workout_days_per_week: parseInt(data.workout_days_per_week),
          workout_minutes_per_session: parseInt(data.workout_time_per_session),
        }, { onConflict: 'user_id' });

      if (goalsError) throw goalsError;
      
      // Clean up local storage
      localStorage.removeItem('user-profile-basics');
      localStorage.removeItem('user-profile-goals');
      
      // Refresh the profile data in the auth context
      await refreshProfile();
      
      toast({
        title: "Profile setup complete!",
        description: "Your profile has been set up successfully.",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error setting up your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-fitmentor-cream">Set Up Your Profile</h2>
        <p className="text-fitmentor-medium-gray mt-2">
          Tell us about yourself so we can personalize your experience
        </p>
        
        {/* Step indicator */}
        <div className="flex justify-center mt-6">
          <div className={`w-3 h-3 rounded-full mx-1 ${currentStep === 1 ? 'bg-fitmentor-cream' : 'bg-fitmentor-medium-gray'}`}></div>
          <div className={`w-3 h-3 rounded-full mx-1 ${currentStep === 2 ? 'bg-fitmentor-cream' : 'bg-fitmentor-medium-gray'}`}></div>
          <div className={`w-3 h-3 rounded-full mx-1 ${currentStep === 3 ? 'bg-fitmentor-cream' : 'bg-fitmentor-medium-gray'}`}></div>
        </div>
      </div>
      
      {/* Step 1: Basics */}
      {currentStep === 1 && (
        <Form {...basicsForm}>
          <form onSubmit={basicsForm.handleSubmit(onSubmitBasics)} className="space-y-6">
            <h3 className="text-lg font-semibold text-fitmentor-cream">Basics</h3>
            
            <FormField
              control={basicsForm.control}
              name="age"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your age"
                      className="premium-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={basicsForm.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Weight in kg"
                      className="premium-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={basicsForm.control}
              name="height"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Height in cm"
                      className="premium-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={basicsForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="premium-button w-full"
            >
              Next
            </Button>
          </form>
        </Form>
      )}
      
      {/* Step 2: Goals */}
      {currentStep === 2 && (
        <Form {...goalsForm}>
          <form onSubmit={goalsForm.handleSubmit(onSubmitGoals)} className="space-y-6">
            <h3 className="text-lg font-semibold text-fitmentor-cream">Goals</h3>
            
            <FormField
              control={goalsForm.control}
              name="primary_goal"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Primary Fitness Goal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="premium-input">
                        <SelectValue placeholder="Select your main goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                      <SelectItem value="improve_fitness">Improve Fitness</SelectItem>
                      <SelectItem value="maintain">Maintain Current Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={goalsForm.control}
              name="experience_level"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="premium-input">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={goalsForm.control}
              name="target_weight"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Target Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Target weight"
                      className="premium-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={goalsForm.control}
              name="target_body_fat"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Target Body Fat (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Body fat %"
                      className="premium-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="w-1/2"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="premium-button w-1/2"
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      )}
      
      {/* Step 3: Schedule */}
      {currentStep === 3 && (
        <Form {...scheduleForm}>
          <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-6">
            <h3 className="text-lg font-semibold text-fitmentor-cream">Schedule</h3>
            
            <FormField
              control={scheduleForm.control}
              name="workout_days_per_week"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>How many days per week can you workout?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="premium-input">
                        <SelectValue placeholder="Select days per week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={scheduleForm.control}
              name="workout_time_per_session"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>How much time can you dedicate per workout?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="premium-input">
                        <SelectValue placeholder="Select time per workout" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="w-1/2"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="premium-button w-1/2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ProfileSetup;
