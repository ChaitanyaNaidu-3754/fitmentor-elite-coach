
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
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
