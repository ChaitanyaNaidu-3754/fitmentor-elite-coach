
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import LoadingState from "@/components/workouts/detail/LoadingState";
import { useWorkoutDetail } from "@/hooks/useWorkoutDetail";
import { useToast } from "@/hooks/use-toast";
import CameraView from "@/components/workouts/live/CameraView";
import WorkoutControls from "@/components/workouts/live/WorkoutControls";
import WorkoutStats from "@/components/workouts/live/WorkoutStats";
import WorkoutComplete from "@/components/workouts/live/WorkoutComplete";

const LiveWorkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { workout: workoutData, loading: workoutLoading, error: workoutError } = useWorkoutDetail(id);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Improved camera initialization function
  const startStopCamera = async () => {
    if (!cameraActive) {
      try {
        console.log("Requesting camera access...");
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false 
        });
        
        console.log("Camera access granted:", stream);
        streamRef.current = stream;
        
        // Wait for next render cycle to ensure videoRef is available
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.style.display = 'block';
            
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, playing video");
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error("Error playing video:", e);
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Unable to start video playback. Please check browser settings.",
                  });
                });
              }
            };
            
            setCameraActive(true);
            setCameraPermission(true);
            toast({
              title: "Camera activated",
              description: "Your form will be analyzed in real-time",
            });
          } else {
            console.error("Video reference still not available after timeout");
            toast({
              variant: "destructive",
              title: "Error",
              description: "Unable to access video element. Please refresh the page and try again.",
            });
          }
        }, 100); // Small delay to ensure DOM is updated
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera access denied",
          description: "Please enable camera access to use form analysis",
        });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        toast({
          title: "Camera disabled",
          description: "Camera has been turned off",
        });
      }
    }
  };

  const startWorkout = async () => {
    console.log("Starting workout. Camera active:", cameraActive);
    
    // Allow starting workout if camera is active
    if (!cameraActive) {
      toast({
        variant: "destructive",
        title: "Camera required",
        description: "Please enable your camera before starting the workout",
      });
      return;
    }
    
    setIsWorkoutActive(true);
    setIsPaused(false);
    
    // Create a workout session entry if user is logged in
    if (user) {
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .insert([{
            user_id: user.id,
            workout_id: workoutData?.id || 'default',
            started_at: new Date().toISOString()
          }])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSessionId(data[0].id);
        }
      } catch (err) {
        console.error("Error creating workout session:", err);
      }
    }
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
  };

  const resetWorkout = () => {
    setIsWorkoutActive(false);
    setIsPaused(false);
    setCurrentExercise(0);
    setCurrentRep(0);
    setTimeElapsed(0);
    setCaloriesBurned(0);
    setWorkoutComplete(false);
  };

  // Handle rep detection from motion detector
  const handleRepDetected = () => {
    if (isWorkoutActive && !isPaused && currentRep < (workoutData?.exercises[currentExercise]?.repsPerSet || 10)) {
      setCurrentRep(prev => prev + 1);
      
      // Show toast on every 5th rep
      if ((currentRep + 1) % 5 === 0 || (currentRep + 1) === workoutData?.exercises[currentExercise]?.repsPerSet) {
        toast({
          title: "Great form!",
          description: `${currentRep + 1} of ${workoutData?.exercises[currentExercise]?.repsPerSet} reps completed`,
        });
      }
    }
  };

  // Manual next exercise function
  const goToNextExercise = () => {
    if (currentExercise < (workoutData?.exercises?.length || 0) - 1) {
      setCurrentExercise(prev => prev + 1);
      setCurrentRep(0);
      
      toast({
        title: `Next exercise: ${workoutData?.exercises[currentExercise + 1]?.name || 'Unknown'}`,
        description: `Get ready!`,
      });
    } else {
      // Last exercise complete
      completeWorkout();
    }
  };

  // Complete workout function
  const completeWorkout = async () => {
    // Update the workout session to completed if exists
    if (sessionId && user) {
      try {
        const { error } = await supabase
          .from('workout_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: timeElapsed,
            calories_burned: Math.floor(caloriesBurned)
          })
          .eq('id', sessionId);
          
        if (error) throw error;
        
        // Update user stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError;
        }
        
        const now = new Date().toISOString();
        let newStreak = 1;
        let updateData: any = {
          user_id: user.id,
          total_workouts: 1,
          total_workout_time: timeElapsed,
          total_calories_burned: Math.floor(caloriesBurned),
          last_workout_date: now,
          workout_streak: 1
        };
        
        if (statsData) {
          // Calculate streak
          if (statsData.last_workout_date) {
            const lastWorkout = new Date(statsData.last_workout_date);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
              // Either today or yesterday, maintain streak
              newStreak = (statsData.workout_streak || 0) + 1;
            } else {
              // Break in streak
              newStreak = 1;
            }
          }
          
          updateData = {
            total_workouts: (statsData.total_workouts || 0) + 1,
            total_workout_time: (statsData.total_workout_time || 0) + timeElapsed,
            total_calories_burned: (statsData.total_calories_burned || 0) + Math.floor(caloriesBurned),
            last_workout_date: now,
            workout_streak: newStreak
          };
          
          // Update existing stats
          await supabase
            .from('user_stats')
            .update(updateData)
            .eq('user_id', user.id);
        } else {
          // Create new stats record
          await supabase
            .from('user_stats')
            .insert([updateData]);
        }
        
      } catch (err) {
        console.error("Error updating workout session:", err);
      }
    }
    
    resetWorkout();
    setWorkoutComplete(true);
    
    // Stop camera when workout completes
    if (cameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
    
    toast({
      title: "Workout Complete! 🎉",
      description: "Great job! You've completed your workout.",
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isWorkoutActive && !isPaused) {
      interval = setInterval(() => {
        // Update time elapsed
        setTimeElapsed(prev => prev + 1);
        
        // Update calories (simplified calculation)
        setCaloriesBurned(prev => {
          // Base calorie burn rate - could be more sophisticated based on exercise type
          const baseRate = 0.15;
          // Increase rate for higher intensity exercises
          const exercise = workoutData?.exercises[currentExercise];
          let intensityMultiplier = 1.0;
          
          if (exercise?.muscleGroups) {
            if (exercise.muscleGroups.some(g => g.toLowerCase().includes('leg'))) {
              intensityMultiplier = 1.5; // Leg exercises burn more calories
            } else if (exercise.muscleGroups.some(g => g.toLowerCase().includes('chest') || 
                                                      g.toLowerCase().includes('back'))) {
              intensityMultiplier = 1.3; // Large muscle groups
            }
          }
          
          return Math.min(prev + (baseRate * intensityMultiplier), 999);
        });
        
        // Check if current exercise is complete
        if (currentRep >= (workoutData?.exercises[currentExercise]?.repsPerSet || 10)) {
          // Move to next exercise if all reps completed
          if (currentExercise < (workoutData?.exercises?.length || 0) - 1) {
            setCurrentExercise(prev => prev + 1);
            setCurrentRep(0);
            
            toast({
              title: `Next exercise: ${workoutData?.exercises[currentExercise + 1]?.name || 'Unknown'}`,
              description: `Get ready!`,
            });
          } else {
            // Workout complete
            completeWorkout();
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isWorkoutActive, 
    isPaused, 
    currentExercise, 
    currentRep, 
    workoutData
  ]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (workoutLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <LoadingState />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex flex-col">
        {workoutComplete ? (
          <WorkoutComplete 
            timeElapsed={timeElapsed}
            caloriesBurned={caloriesBurned}
            handleResetWorkout={resetWorkout}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Workout</h1>
                <p className="text-fitmentor-medium-gray">
                  {isWorkoutActive 
                    ? `Currently doing: ${workoutData?.name || 'Workout'}`
                    : "Enable your camera for real-time form analysis"
                  }
                </p>
              </div>
              <Link to="/workouts" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                  <X size={16} className="mr-2" />
                  Exit Workout
                </Button>
              </Link>
            </div>
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Camera view area with motion detection */}
              <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
                <CameraView
                  cameraActive={cameraActive}
                  isWorkoutActive={isWorkoutActive}
                  isPaused={isPaused}
                  currentExercise={workoutData?.exercises[currentExercise]}
                  currentRep={currentRep}
                  videoRef={videoRef}
                  cameraPermission={cameraPermission}
                  startStopCamera={startStopCamera}
                  onRepDetected={handleRepDetected}
                />
                
                <WorkoutControls 
                  isWorkoutActive={isWorkoutActive}
                  isPaused={isPaused}
                  cameraActive={cameraActive}
                  handleStartWorkout={startWorkout}
                  handlePauseWorkout={pauseWorkout}
                  handleResetWorkout={resetWorkout}
                  handleCameraToggle={startStopCamera}
                  handleNextExercise={goToNextExercise}
                  handleCompleteWorkout={completeWorkout}
                  isLastExercise={currentExercise === (workoutData?.exercises?.length || 0) - 1}
                />
              </div>
              
              {/* Workout stats */}
              <WorkoutStats 
                timeElapsed={timeElapsed}
                caloriesBurned={caloriesBurned}
                currentExercise={currentExercise}
                currentRep={currentRep}
                totalExercises={workoutData?.exercises?.length || 0}
                exercise={workoutData?.exercises[currentExercise]}
                isWorkoutActive={isWorkoutActive}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LiveWorkout;
