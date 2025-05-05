
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardHeaderProps {
  userName?: string;
}

const quotes = [
  "Success is usually the culmination of controlling failure.",
  "The last three or four reps is what makes the muscle grow.",
  "All progress takes place outside the comfort zone.",
  "The only bad workout is the one that didn't happen.",
  "The difference between the impossible and the possible lies in determination.",
  "The only place where success comes before work is in the dictionary.",
  "The clock is ticking. Are you becoming the person you want to be?",
  "You don't have to be extreme, just consistent.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow."
];

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const [quote, setQuote] = useState("");
  const { profile } = useAuth();
  
  // Generate display name from profile if available
  const displayName = userName || 
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : "Fitness Enthusiast");
  
  useEffect(() => {
    // Simulate a daily quote by choosing one based on the day of the month
    const dayOfMonth = new Date().getDate();
    const quoteIndex = dayOfMonth % quotes.length;
    setQuote(quotes[quoteIndex]);
  }, []);

  return (
    <div className="mb-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        Welcome, <span className="text-fitmentor-cream">{displayName}</span>
      </h1>
      <p className="text-fitmentor-medium-gray text-lg italic">
        "{quote}"
      </p>
    </div>
  );
};

export default DashboardHeader;
