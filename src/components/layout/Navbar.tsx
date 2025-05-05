
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-fitmentor-black/90 backdrop-blur-md border-b border-fitmentor-cream/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-fitmentor-cream">FitMentor</span>
            <span className="inline-block px-2 py-1 text-xs bg-fitmentor-cream text-fitmentor-black font-bold rounded">ELITE</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-fitmentor-white hover:text-fitmentor-cream transition-colors">Dashboard</Link>
            <Link to="/workouts" className="text-fitmentor-white hover:text-fitmentor-cream transition-colors">Workouts</Link>
            <Link to="/goals" className="text-fitmentor-white hover:text-fitmentor-cream transition-colors">Goals</Link>
            <Link to="/nutrition" className="text-fitmentor-white hover:text-fitmentor-cream transition-colors">Nutrition</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="premium-button">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-fitmentor-cream focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in absolute top-full left-0 w-full bg-fitmentor-black/95 backdrop-blur-lg border-b border-fitmentor-cream/10">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-4">
            <Link 
              to="/dashboard" 
              className="py-3 text-fitmentor-white hover:text-fitmentor-cream border-b border-fitmentor-dark-gray"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/workouts" 
              className="py-3 text-fitmentor-white hover:text-fitmentor-cream border-b border-fitmentor-dark-gray"
              onClick={() => setIsMenuOpen(false)}
            >
              Workouts
            </Link>
            <Link 
              to="/goals" 
              className="py-3 text-fitmentor-white hover:text-fitmentor-cream border-b border-fitmentor-dark-gray"
              onClick={() => setIsMenuOpen(false)}
            >
              Goals
            </Link>
            <Link 
              to="/nutrition" 
              className="py-3 text-fitmentor-white hover:text-fitmentor-cream border-b border-fitmentor-dark-gray"
              onClick={() => setIsMenuOpen(false)}
            >
              Nutrition
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full border-fitmentor-cream/30 text-fitmentor-cream hover:bg-fitmentor-cream hover:text-fitmentor-black">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full premium-button">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
