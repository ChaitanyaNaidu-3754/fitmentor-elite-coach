
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // Split the name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: name,
          }
        },
      });

      if (error) throw error;
      
      // Update the profile with name information immediately
      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq('id', data.user.id);
      }
      
      toast({
        title: "Account created!",
        description: "Please complete your profile setup.",
      });
      
      // Redirect to profile setup page instead of dashboard
      navigate("/profile-setup");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
