
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, X, CheckCircle2, Camera, CameraOff } from "lucide-react";
import { Link } from "react-router-dom";

const LiveWorkout = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Sample workout data
  const workout = {
    title: "Full Body Power",
    duration: 45, // minutes
    exercises: [
      { name: "Jumping Jacks", reps: 20, duration: 60 },
      { name: "Push-ups", reps: 15, duration: 60 },
      { name: "Squats", reps: 20, duration: 60 },
      { name: "Plank", reps: 1, duration: 60 }, // Hold for 60 seconds
      { name: "Mountain Climbers", reps: 30, duration: 60 },
    ],
  };

  const startStopCamera = async () => {
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraActive(true);
          
          toast({
            title: "Camera activated",
            description: "Your form will be analyzed in real-time",
          });
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
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
      }
    }
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsPaused(false);
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

  const completeWorkout = () => {
    resetWorkout();
    setWorkoutComplete(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isWorkoutActive && !isPaused) {
      interval = setInterval(() => {
        // Update time elapsed
        setTimeElapsed(prev => prev + 1);
        
        // Update calories (simplified calculation)
        setCaloriesBurned(prev => Math.min(prev + 0.15, 999));
        
        // Simulate rep counting
        if (currentRep < workout.exercises[currentExercise].reps) {
          // Every 3 seconds, increment rep for visual demonstration
          if (timeElapsed % 3 === 0) {
            setCurrentRep(prev => prev + 1);
          }
        } else {
          // Move to next exercise if all reps completed
          if (currentExercise < workout.exercises.length - 1) {
            setCurrentExercise(prev => prev + 1);
            setCurrentRep(0);
            
            toast({
              title: `Next exercise: ${workout.exercises[currentExercise + 1].name}`,
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
  }, [isWorkoutActive, isPaused, currentExercise, currentRep, timeElapsed]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for current exercise
  const calculateProgress = () => {
    if (!isWorkoutActive) return 0;
    const currentExerciseReps = workout.exercises[currentExercise].reps;
    return Math.floor((currentRep / currentExerciseReps) * 100);
  };

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
                    ? `Currently doing: ${workout.title}`
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
              {/* Camera view area */}
              <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
                <div className="relative flex-grow bg-fitmentor-black flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
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
                    </div>
                  )}
                  
                  {/* Overlay for exercise info when workout is active */}
                  {isWorkoutActive && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fitmentor-black to-transparent p-6">
                      <h3 className="text-xl font-bold text-fitmentor-cream">
                        {workout.exercises[currentExercise].name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-fitmentor-medium-gray text-sm">
                            Rep {currentRep} of {workout.exercises[currentExercise].reps}
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
                        ? workout.exercises[currentExercise].name
                        : "Not started"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-2">Exercise Progress</p>
                    <Progress value={calculateProgress()} className="h-2 mb-1" />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>{currentRep} reps</span>
                      <span>{workout.exercises[currentExercise]?.reps || 0} reps</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-fitmentor-medium-gray mb-2">Workout Progress</p>
                    <Progress 
                      value={Math.floor(((currentExercise) / workout.exercises.length) * 100)} 
                      className="h-2 mb-1" 
                    />
                    <div className="flex justify-between text-xs text-fitmentor-medium-gray">
                      <span>Exercise {currentExercise + 1}</span>
                      <span>{workout.exercises.length} total</span>
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
