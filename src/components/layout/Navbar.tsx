
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  BarChart3,
  Dumbbell,
  User,
  LogIn,
  Target,
  Menu,
  X,
  Apple
} from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when changing routes
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Public navigation items (accessible without login)
  const publicNavItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home size={18} />,
    },
  ];

  // Private navigation items (require authentication)
  const privateNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <BarChart3 size={18} />,
    },
    {
      name: "Workouts",
      path: "/workouts",
      icon: <Dumbbell size={18} />,
    },
    {
      name: "KAZNOR",
      path: "/nutrition",
      icon: <Apple size={18} />,
    },
    {
      name: "Goals",
      path: "/goals",
      icon: <Target size={18} />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={18} />,
    },
  ];

  // Show private nav items only if authenticated
  const navItems = user ? [...publicNavItems, ...privateNavItems] : publicNavItems;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen ? "bg-fitmentor-black/95 backdrop-blur-sm" : ""
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-fitmentor-cream hover:text-fitmentor-cream/80"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitmentor-cream to-fitmentor-light-green flex items-center justify-center mr-3">
              <Dumbbell className="h-6 w-6 text-fitmentor-black" />
            </div>
            <span className="font-bold text-xl">FitMentor</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                    location.pathname === item.path
                      ? "text-fitmentor-cream bg-fitmentor-cream/10"
                      : "text-fitmentor-medium-gray hover:text-fitmentor-cream hover:bg-fitmentor-cream/5"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Authentication Button or Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-fitmentor-cream hover:text-fitmentor-cream/80 hover:bg-transparent"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            ) : (
              <>
                {!loading && !user ? (
                  <div className="flex gap-2">
                    <Link to="/login">
                      <Button className="secondary-button">
                        <LogIn size={18} className="mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="premium-button">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : !loading && user ? (
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    className="text-fitmentor-cream hover:text-fitmentor-cream/80 hover:bg-fitmentor-cream/10"
                  >
                    Log Out
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden mt-4 bg-fitmentor-dark-gray/30 backdrop-blur-sm rounded-lg p-4 animate-fade-in-down">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-3 rounded-md flex items-center ${
                    location.pathname === item.path
                      ? "text-fitmentor-cream bg-fitmentor-cream/10"
                      : "text-fitmentor-medium-gray hover:text-fitmentor-cream hover:bg-fitmentor-cream/5"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              
              {!loading && !user ? (
                <div className="flex flex-col gap-2 mt-4">
                  <Link to="/login" className="w-full">
                    <Button className="secondary-button w-full">
                      <LogIn size={18} className="mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button className="premium-button w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : !loading && user ? (
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="mt-4 text-fitmentor-cream hover:text-fitmentor-cream/80 hover:bg-fitmentor-cream/10"
                >
                  Log Out
                </Button>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
