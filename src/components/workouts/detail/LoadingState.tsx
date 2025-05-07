
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  return (
    <div className="animate-pulse">
      {/* Header loading skeleton */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="w-full md:w-2/3">
            <Skeleton className="h-10 w-3/4 mb-2 bg-fitmentor-dark-gray" />
            <Skeleton className="h-6 w-full bg-fitmentor-dark-gray" />
          </div>
          <Skeleton className="h-10 w-40 mt-4 md:mt-0 bg-fitmentor-dark-gray" />
        </div>
        
        <Skeleton className="h-32 w-full bg-fitmentor-dark-gray" />
      </div>
      
      <Skeleton className="h-8 w-48 mb-6 bg-fitmentor-dark-gray" />
      
      {/* Exercise card skeletons */}
      {[1, 2, 3].map((_, index) => (
        <Skeleton 
          key={index} 
          className="h-64 w-full mb-6 bg-fitmentor-dark-gray" 
        />
      ))}
    </div>
  );
};

export default LoadingState;
