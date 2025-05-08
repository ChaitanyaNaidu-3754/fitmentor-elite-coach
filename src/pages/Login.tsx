
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard or previous location
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6 py-28">
        <LoginForm />
      </div>
      <Footer />
    </>
  );
};

export default Login;
