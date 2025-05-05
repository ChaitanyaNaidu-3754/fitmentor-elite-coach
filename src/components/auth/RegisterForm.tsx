
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const RegisterForm = () => {
  const [name, setName] = useState("");
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
        <h2 className="text-2xl font-bold text-fitmentor-cream">Create your account</h2>
        <p className="text-fitmentor-medium-gray mt-2">Join FitMentor Elite for personalized coaching</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-fitmentor-cream">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="premium-input"
            placeholder="John Doe"
            required
          />
        </div>
        
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
          <label htmlFor="password" className="text-sm font-medium text-fitmentor-cream">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input"
            placeholder="••••••••"
            required
          />
          <p className="text-xs text-fitmentor-medium-gray mt-1">
            Password must be at least 8 characters
          </p>
        </div>
        
        <Button
          type="submit"
          className="premium-button w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-fitmentor-medium-gray">
          Already have an account?{" "}
          <Link to="/login" className="text-fitmentor-cream hover:text-fitmentor-cream/80 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
