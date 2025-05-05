
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileSetup from "@/components/auth/ProfileSetup";

const ProfileSetupPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6 py-28">
        <ProfileSetup />
      </div>
      <Footer />
    </>
  );
};

export default ProfileSetupPage;
