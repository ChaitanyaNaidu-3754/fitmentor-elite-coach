
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, X, CheckCircle2, Camera, CameraOff } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import LoadingState from "@/components/workouts/detail/LoadingState";

const LiveWorkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  
  // Sample workout data (as fallback)
  const defaultWorkout = {
    id: id || "default",
    name: "Full Body Power",
    duration_minutes: 45,
    exercises: [
      { id: "1", name: "Jumping Jacks", reps: 20, duration: 60, image_url: null, rest_seconds: 30 },
      { id: "2", name: "Push-ups", reps: 15, duration: 60, image_url: null, rest_seconds: 30 },
      { id: "3", name: "Squats", reps: 20, duration: 60, image_url: null, rest_seconds: 30 },
      { id: "4", name: "Plank", reps: 1, duration: 60, image_url: null, rest_seconds: 30 },
      { id: "5", name: "Mountain Climbers", reps: 30, duration: 60, image_url: null, rest_seconds: 30 },
    ],
  };

  useEffect(() => {
    // Fetch workout data if ID is provided
    const fetchWorkoutData = async () => {
      if (!id) {
        setWorkoutData(defaultWorkout);
        setWorkoutLoading(false);
        return;
      }
      
      try {
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (workoutError) throw workoutError;
        
        if (!workoutData) {
          throw new Error("Workout not found");
        }
        
        // Fetch exercises for this workout
        const { data: exercisesJunction, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select(`
            id,
            sets,
            reps_per_set,
            duration_seconds,
            rest_seconds,
            sequence_order,
            exercise:exercise_id (
              id,
              name,
              description,
              image_url
            )
          `)
          .eq('workout_id', id)
          .order('sequence_order');
          
        if (exercisesError) throw exercisesError;
        
        // Format the exercises
        const exercises = exercisesJunction.map(item => ({
          id: item.exercise.id,
          name: item.exercise.name,
          reps: item.reps_per_set || 10,
          sets: item.sets || 3,
          duration: item.duration_seconds || 60,
          rest_seconds: item.rest_seconds || 30,
          image_url: item.exercise.image_url
        }));
        
        setWorkoutData({
          ...workoutData,
          exercises: exercises.length > 0 ? exercises : defaultWorkout.exercises
        });
      } catch (error) {
        console.error("Error fetching workout:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load workout data. Using default workout.",
        });
        setWorkoutData(defaultWorkout);
      } finally {
        setWorkoutLoading(false);
      }
    };
    
    fetchWorkoutData();
  }, [id, toast]);

  // Fixed camera initialization function
  const startStopCamera = async () => {
    if (!cameraActive) {
      try {
        // Explicitly log the camera request
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
        
        if (videoRef.current) {
          console.log("Setting video source...");
          videoRef.current.srcObject = stream;
          
          // Make sure the video element is visible
          if (videoRef.current.style.display === 'none') {
            videoRef.current.style.display = 'block';
          }
          
          // Use the onloadedmetadata event to ensure video starts playing
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, playing video");
            if (videoRef.current) {
              videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
          };
          
          streamRef.current = stream;
          setCameraActive(true);
          setCameraPermission(true);
          
          toast({
            title: "Camera activated",
            description: "Your form will be analyzed in real-time",
          });
          
          // Start motion detection once camera is active
          if (canvasRef.current) {
            console.log("Starting motion detection...");
            startMotionDetection();
          }
        } else {
          console.error("Video reference not available");
        }
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
      stopMotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraActive(false);
      }
    }
  };

  // Motion detection logic
  const startMotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas reference not available");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    console.log("Motion detection initialized with video dimensions:", 
      video.videoWidth || 640, "x", video.videoHeight || 480);
    
    // Set canvas dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    let previousImageData: ImageData | null = null;
    
    const detect = () => {
      if (!ctx || !video.videoWidth) {
        console.log("Waiting for video dimensions...");
        requestAnimationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Compare with previous frame if we have one
      if (previousImageData && isWorkoutActive && !isPaused) {
        const movement = detectMovement(previousImageData, currentImageData);
        
        if (movement > 20) { // Threshold for significant movement
          console.log(`Movement detected: ${movement} - incrementing rep count`);
          // When significant movement is detected, increment rep count
          if (timeElapsed % 2 === 0) { // Limit the rep counting rate
            if (currentRep < (workoutData?.exercises[currentExercise]?.reps || 10)) {
              setCurrentRep(prevRep => prevRep + 1);
            }
          }
        }
      }
      
      previousImageData = currentImageData;
      requestAnimationFrameRef.current = requestAnimationFrame(detect);
    };
    
    requestAnimationFrameRef.current = requestAnimationFrame(detect);
  };
  
  const stopMotionDetection = () => {
    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = null;
    }
  };
  
  // Helper function to detect movement between frames
  const detectMovement = (prev: ImageData, curr: ImageData): number => {
    const prevData = prev.data;
    const currData = curr.data;
    let movement = 0;
    
    // Compare pixels (sample every 10th pixel to improve performance)
    for (let i = 0; i < prevData.length; i += 40) {
      const rDiff = Math.abs(prevData[i] - currData[i]);
      const gDiff = Math.abs(prevData[i+1] - currData[i+1]);
      const bDiff = Math.abs(prevData[i+2] - currData[i+2]);
      
      if (rDiff + gDiff + bDiff > 100) { // Threshold for pixel change
        movement++;
      }
    }
    
    return movement;
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
          .single();
          
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
    if (cameraActive) {
      stopMotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraActive(false);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isWorkoutActive && !isPaused) {
      interval = setInterval(() => {
        // Update time elapsed
        setTimeElapsed(prev => prev + 1);
        
        // Update calories (simplified calculation)
        setCaloriesBurned(prev => Math.min(prev + 0.15, 999));
        
        // If not using motion detection for reps or as a fallback 
        if (!cameraActive || !canvasRef.current) {
          // Simulate rep counting
          if (currentRep < (workoutData?.exercises[currentExercise]?.reps || 10)) {
            // Every 3 seconds, increment rep for visual demonstration
            if (timeElapsed % 3 === 0) {
              setCurrentRep(prev => prev + 1);
            }
          }
        }
        
        // Check if current exercise is complete
        if (currentRep >= (workoutData?.exercises[currentExercise]?.reps || 10)) {
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
            
            toast({
              title: "Workout Complete! 🎉",
              description: "Great job! You've completed your workout.",
            });
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
    timeElapsed, 
    workoutData, 
    toast,
    cameraActive
  ]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopMotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format time from seconds to MM:SS
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate progress percentage for current exercise
  function calculateProgress() {
    if (!isWorkoutActive) return 0;
    const currentExerciseReps = workoutData?.exercises[currentExercise]?.reps || 10;
    return Math.floor((currentRep / currentExerciseReps) * 100);
  }

  // Current exercise data
  const currentExerciseData = workoutData?.exercises?.[currentExercise];

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
          <div className="flex-grow flex items-center justify-center">
            <div className="glass-card p-10 max-w-lg w-full text-center animate-fade-in">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-cream/20 mb-6">
                <CheckCircle2 size={48} className="text-fitmentor-cream" />
              </div>
              <h2 className="text-3xl font-bold text-fitmentor-cream mb-4">Workout Complete!</h2>
              <p className="text-fitmentor-medium-gray mb-6">You've successfully completed your workout session.</p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-4">
                  <p className="text-sm text-fitmentor-medium-gray">Duration</p>
                  <p className="text-2xl font-bold text-fitmentor-cream">{formatTime(timeElapsed)}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-fitmentor-medium-gray">Calories</p>
                  <p className="text-2xl font-bold text-fitmentor-cream">{Math.floor(caloriesBurned)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button className="premium-button w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={resetWorkout} className="w-full border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                  Start Another Workout
                </Button>
              </div>
            </div>
          </div>
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
              {/* Camera view area - Fixed to improve video rendering */}
              <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
                <div className="relative flex-grow bg-fitmentor-black flex items-center justify-center">
                  {/* Hidden canvas for motion detection */}
                  <canvas 
                    ref={canvasRef} 
                    className="hidden"
                  ></canvas>
                  
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                      style={{ transform: 'scaleX(-1)', minHeight: '400px' }} // Mirror effect for better UX with min-height
                    />
                  ) : (
                    <div className="text-center p-10">
                      <div className="inline-flex items-center justify-center p-4 rounded-full bg-fitmentor-dark-gray mb-4">
                        <Camera size={32} className="text-fitmentor-cream" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Camera access required</h3>
                      <p className="text-fitmentor-medium-gray mb-4">
                        Enable your camera to get real-time form feedback and rep counting
                      </p>
                      <Button onClick={startStopCamera} className="secondary-button">
                        Enable Camera
                      </Button>
                      
                      {cameraPermission === false && (
                        <div className="mt-4 p-3 border border-red-400 rounded bg-red-400/10">
                          <p className="text-red-400 text-sm">
                            Camera permission denied. Please check your browser settings and allow camera access.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Overlay for exercise info when workout is active */}
                  {isWorkoutActive && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fitmentor-black to-transparent p-6">
                      <h3 className="text-xl font-bold text-fitmentor-cream">
                        {workoutData?.exercises[currentExercise]?.name || "Exercise"}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-fitmentor-medium-gray text-sm">
                            Rep {currentRep} of {workoutData?.exercises[currentExercise]?.reps || 10}
                          </p>
                        </div>
                        <Progress value={calculateProgress()} className="w-1/2 h-2" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 border-t border-fitmentor-cream/10 flex justify-between items-center">
                  <Button 
                    onClick={startStopCamera}
                    variant="outline"
                    className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
                  >
                    {cameraActive ? (
                      <>
                        <CameraOff size={16} className="mr-2" />
                        Disable Camera
                      </>
                    ) : (
                      <>
                        <Camera size={16} className="mr-2" />
                        Enable Camera
                      </>
                    )}
                  </Button>
                  
                  {!isWorkoutActive ? (
                    <Button 
                      onClick={startWorkout}
                      className="premium-button"
                      disabled={!cameraActive}
                    >
                      <Play size={16} className="mr-2" />
                      Start Workout
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button 
                        onClick={pauseWorkout}
                        variant="outline"
                        className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
                      >
                        {isPaused ? (
                          <>
                            <Play size={16} className="mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause size={16} className="mr-2" />
                            Pause
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={resetWorkout}
                        variant="outline"
                        className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Workout details */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Workout Stats</h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Time Elapsed</p>
                    <p className="text-3xl font-bold text-fitmentor-cream">{formatTime(timeElapsed)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Calories Burned</p>
                    <p className="text-3xl font-bold text-fitmentor-cream">{Math.floor(caloriesBurned)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-1">Current Exercise</p>
                    <p className="text-xl font-bold text-fitmentor-cream">
                      {isWorkoutActive 
                        ? workoutData?.exercises[currentExercise]?.name || "Exercise"
                        : "Not started"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-2">Exercise Progress</p>
                    <Progress value={calculateProgress()} className="h-2 mb-1" />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>{currentRep} reps</span>
                      <span>{workoutData?.exercises[currentExercise]?.reps || 10} reps</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-2">Workout Progress</p>
                    <Progress 
                      value={Math.floor(((currentExercise) / (workoutData?.exercises?.length || 1)) * 100)} 
                      className="h-2 mb-1" 
                    />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>Exercise {currentExercise + 1}</span>
                      <span>{workoutData?.exercises?.length || 0} total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LiveWorkout;
