
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This would be replaced with Supabase auth once integrated
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Coming soon",
        description: "Please connect Supabase to enable authentication",
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-fitmentor-cream">Welcome back</h2>
        <p className="text-fitmentor-medium-gray mt-2">Log in to your FitMentor account</p>
      </div>
      
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
