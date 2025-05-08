
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "You've successfully logged in.",
      });
      
      // Redirect to the page user was trying to access, or dashboard if none
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-fitmentor-cream">Welcome back</h2>
        <p className="text-fitmentor-medium-gray mt-2">Log in to your FitMentor account</p>
      </div>
      
      {from !== "/dashboard" && (
        <div className="mb-6 p-3 border border-fitmentor-cream/20 rounded-md bg-fitmentor-cream/5">
          <p className="text-sm text-fitmentor-cream">
            You need to login to access that page
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-fitmentor-cream">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="premium-input"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-fitmentor-cream">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-fitmentor-cream hover:text-fitmentor-cream/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input"
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="premium-button w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-fitmentor-medium-gray">
          Don't have an account?{" "}
          <Link to="/register" className="text-fitmentor-cream hover:text-fitmentor-cream/80 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
