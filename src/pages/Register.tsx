
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/use-auth";

const Register = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6 py-28">
        <RegisterForm />
      </div>
      <Footer />
    </>
  );
};

export default Register;
