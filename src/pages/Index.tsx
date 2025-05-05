
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Camera, Activity, Target, Brain } from "lucide-react";

const Index = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center relative bg-fitmentor-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-fitmentor-black/70 to-fitmentor-black"></div>
        
        <div className="container mx-auto px-6 py-20 relative z-10 mt-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 text-sm bg-fitmentor-cream text-fitmentor-black font-medium rounded-full mb-6">
              AI-Powered Fitness Coaching
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform Your Workouts with <span className="text-fitmentor-cream">Intelligent</span> Feedback
            </h1>
            <p className="text-xl text-fitmentor-medium-gray mb-10 max-w-2xl">
              FitMentor uses advanced AI to analyze your form, count reps, and provide real-time guidance – like having a personal trainer in your home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="premium-button text-lg px-8 py-6">
                  Get Started
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/workouts">
                <Button variant="outline" className="text-lg px-8 py-6 border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                  Explore Workouts
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-fitmentor-cream flex items-center justify-center text-fitmentor-black">
                  <Check size={14} />
                </div>
                <span className="text-fitmentor-medium-gray">Real-time form analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-fitmentor-cream flex items-center justify-center text-fitmentor-black">
                  <Check size={14} />
                </div>
                <span className="text-fitmentor-medium-gray">Personalized workouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-fitmentor-cream flex items-center justify-center text-fitmentor-black">
                  <Check size={14} />
                </div>
                <span className="text-fitmentor-medium-gray">Progress tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-24 bg-fitmentor-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm bg-fitmentor-cream/20 text-fitmentor-cream font-medium rounded-full mb-4">
              Our Elite Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transforming Your Fitness Journey</h2>
            <p className="text-fitmentor-medium-gray text-lg max-w-2xl mx-auto">
              From real-time workout analysis to personalized guidance, FitMentor delivers an unmatched fitness experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-8 flex flex-col items-center text-center animate-slide-in" style={{animationDelay: "0ms"}}>
              <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream mb-6">
                <Camera size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Live Form Analysis</h3>
              <p className="text-fitmentor-medium-gray">
                Our advanced AI analyzes your movements in real-time, providing instant feedback to perfect your form.
              </p>
            </div>
            
            <div className="glass-card p-8 flex flex-col items-center text-center animate-slide-in" style={{animationDelay: "100ms"}}>
              <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Custom Goal Setting</h3>
              <p className="text-fitmentor-medium-gray">
                Define specific fitness objectives and track your progress with detailed metrics and visualizations.
              </p>
            </div>
            
            <div className="glass-card p-8 flex flex-col items-center text-center animate-slide-in" style={{animationDelay: "200ms"}}>
              <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream mb-6">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Progress Tracking</h3>
              <p className="text-fitmentor-medium-gray">
                Comprehensive analytics to monitor your workout streak, time spent, and calories burned over time.
              </p>
            </div>
            
            <div className="glass-card p-8 flex flex-col items-center text-center animate-slide-in" style={{animationDelay: "300ms"}}>
              <div className="p-4 rounded-full bg-fitmentor-dark-gray/50 text-fitmentor-cream mb-6">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Coaching</h3>
              <p className="text-fitmentor-medium-gray">
                Get personalized workout recommendations and form corrections from our advanced AI coach.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-fitmentor-dark-gray/30 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto glass-card p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Fitness?</h2>
            <p className="text-fitmentor-medium-gray text-lg mb-10">
              Join FitMentor today and experience the future of fitness coaching with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button className="premium-button text-lg px-8 py-6">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/workouts">
                <Button variant="outline" className="text-lg px-8 py-6 border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                  Explore Workouts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Index;
