
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
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
