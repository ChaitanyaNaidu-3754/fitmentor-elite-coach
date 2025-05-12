import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-fitmentor-cream/30 border-t-fitmentor-cream rounded-full animate-spin mb-4"></div>
      <p className="text-fitmentor-medium-gray">Loading...</p>
    </div>
  );
};

export default LoadingState; 