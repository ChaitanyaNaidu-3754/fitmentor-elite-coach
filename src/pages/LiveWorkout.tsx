import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LoadingState from "@/components/workouts/detail/LoadingState";
import CameraView from "@/components/workouts/live/CameraView";
import WorkoutControls from "@/components/workouts/live/WorkoutControls";
import WorkoutStats from "@/components/workouts/live/WorkoutStats";
import { useAuth } from "@/hooks/use-auth";
import { useWorkoutDetail } from "@/hooks/useWorkoutDetail";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const LiveWorkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { workout: workoutData, loading: workoutLoading, error: workoutError } = useWorkoutDetail(id);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Final stats for displaying on workout complete
  const [finalStats, setFinalStats] = useState({
    timeElapsed: 0,
    caloriesBurned: 0,
    totalReps: 0
  });
  
  const navigate = useNavigate();
  
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
    setTotalReps(0);
    setTimeElapsed(0);
    setCaloriesBurned(0);
    setWorkoutComplete(false);
  };

  // Handle rep detection from motion detector
  const handleRepDetected = () => {
    if (isWorkoutActive && !isPaused && currentRep < (workoutData?.exercises[currentExercise]?.repsPerSet || 10)) {
      // Update the rep counter with state update to ensure all components re-render
      setCurrentRep(prev => {
        const newCount = prev + 1;
        
        // Show toast on every 5th rep or when set is complete
        if (newCount % 5 === 0 || newCount === workoutData?.exercises[currentExercise]?.repsPerSet) {
          toast({
            title: "Great form!",
            description: `${newCount} of ${workoutData?.exercises[currentExercise]?.repsPerSet} reps completed`,
          });
        }
        
        // Update the total reps counter
        setTotalReps(total => total + 1);
        
        return newCount;
      });
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
    // Store final stats for displaying on completion card
    const finalTimeElapsed = timeElapsed;
    const finalCaloriesBurned = Math.floor(caloriesBurned);
    const finalTotalReps = totalReps;
    
    setFinalStats({
      timeElapsed: finalTimeElapsed,
      caloriesBurned: finalCaloriesBurned,
      totalReps: finalTotalReps
    });
    
    // Update the workout session to completed if exists
    if (sessionId && user) {
      try {
        // Update workout session with reps
        const { error } = await supabase
          .from('workout_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: finalTimeElapsed,
            calories_burned: finalCaloriesBurned,
            reps: finalTotalReps // Use total reps instead of current reps
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
          total_workout_time: finalTimeElapsed,
          total_calories_burned: finalCaloriesBurned,
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
              newStreak = (statsData.workout_streak || 0) + 1;
            } else {
              newStreak = 1;
            }
          }
          updateData = {
            total_workouts: (statsData.total_workouts || 0) + 1,
            total_workout_time: (statsData.total_workout_time || 0) + finalTimeElapsed,
            total_calories_burned: (statsData.total_calories_burned || 0) + finalCaloriesBurned,
            last_workout_date: now,
            workout_streak: newStreak
          };
          await supabase
            .from('user_stats')
            .update(updateData)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_stats')
            .insert([updateData]);
        }
        
        // Update user goals progress
        try {
          const { data: goalData, error: goalError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (goalData && !goalError) {
            // Calculate goal progress
            let progressUpdate = {};
            
            // For weight loss goals, every 100 calories burned contributes 1% to progress
            if (goalData.goal_type === 'weight_loss') {
              const progressIncrement = finalCaloriesBurned / 100; // 1% for every 100 calories
              const currentProgress = goalData.progress_percent || 0;
              const newProgress = Math.min(100, currentProgress + progressIncrement);
              progressUpdate = { progress_percent: newProgress };
            } 
            // For muscle gain goals, every 50 reps contributes 1% to progress
            else if (goalData.goal_type === 'muscle_gain') {
              const progressIncrement = finalTotalReps / 50; // 1% for every 50 reps
              const currentProgress = goalData.progress_percent || 0;
              const newProgress = Math.min(100, currentProgress + progressIncrement);
              progressUpdate = { progress_percent: newProgress };
            } 
            // For endurance goals, every 10 minutes contributes 1% to progress
            else if (goalData.goal_type === 'endurance') {
              const progressIncrement = (finalTimeElapsed / 60) / 10; // 1% for every 10 minutes
              const currentProgress = goalData.progress_percent || 0;
              const newProgress = Math.min(100, currentProgress + progressIncrement);
              progressUpdate = { progress_percent: newProgress };
            } 
            // For general fitness, a combination of all factors
            else {
              const calorieContribution = finalCaloriesBurned / 300; // 1% for every 300 calories
              const timeContribution = (finalTimeElapsed / 60) / 20; // 1% for every 20 minutes
              const repContribution = finalTotalReps / 100; // 1% for every 100 reps
              const totalContribution = (calorieContribution + timeContribution + repContribution) / 3;
              const currentProgress = goalData.progress_percent || 0;
              const newProgress = Math.min(100, currentProgress + totalContribution);
              progressUpdate = { progress_percent: newProgress };
            }
            
            // Update goal progress
            await supabase
              .from('goals')
              .update(progressUpdate)
              .eq('id', goalData.id);
          }
        } catch (goalErr) {
          console.error("Error updating goal progress:", goalErr);
        }
        
        // Add workout date to workout_history for streak tracking
        try {
          // Use raw SQL query to insert workout history
          await supabase.from('workout_history' as any).insert([{ 
            user_id: user.id, 
            date: now, 
            workout_id: id, 
            duration_seconds: finalTimeElapsed, 
            calories_burned: finalCaloriesBurned, 
            reps: finalTotalReps
          }]);
        } catch (historyErr) {
          console.error("Error saving workout history:", historyErr);
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
      {cameraPermission === false ? (
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <p className="text-fitmentor-medium-gray">
            Camera access denied. Please enable camera access to use form analysis.
          </p>
        </div>
      ) : workoutLoading ? (
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <LoadingState />
        </div>
      ) : workoutError ? (
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex justify-center items-center">
          <p className="text-fitmentor-medium-gray">
            Error loading workout. Please try again later.
          </p>
        </div>
      ) : (
        <div className="container mx-auto px-6 pt-28 pb-12 min-h-screen flex flex-col">
          {workoutComplete ? (
            <WorkoutCompletionCard 
              stats={finalStats}
              workoutName={workoutData?.name || 'Workout'}
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
      )}
      <Footer />
    </>
  );
};

const WorkoutCompletionCard = ({ 
  stats, 
  workoutName 
}: { 
  stats: { 
    timeElapsed: number; 
    caloriesBurned: number; 
    totalReps: number; 
  }; 
  workoutName: string;
}) => {
  const navigate = useNavigate();

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="glass-card p-8 max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-cream/20 mb-6">
        <CheckCircle size={36} className="text-fitmentor-cream" />
      </div>
      <h2 className="text-2xl font-bold text-fitmentor-cream mb-3">Workout Complete!</h2>
      <p className="text-fitmentor-medium-gray mb-8">
        Great job completing {workoutName}! Here's your workout summary:
      </p>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-2">Duration</p>
          <p className="text-3xl font-bold text-fitmentor-cream">{formatTime(stats.timeElapsed)}</p>
        </div>
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-2">Calories</p>
          <p className="text-3xl font-bold text-fitmentor-cream">{stats.caloriesBurned}</p>
        </div>
        <div>
          <p className="text-sm text-fitmentor-medium-gray mb-2">Reps</p>
          <p className="text-3xl font-bold text-fitmentor-cream">{stats.totalReps}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          className="premium-button w-full sm:w-auto"
          onClick={() => navigate("/dashboard", { state: { fromWorkout: true } })}
        >
          Go to Dashboard
        </Button>
        <Button 
          className="secondary-button w-full sm:w-auto"
          onClick={() => navigate("/workouts")}
        >
          Find New Workout
        </Button>
      </div>
    </div>
  );
};

export default LiveWorkout;
