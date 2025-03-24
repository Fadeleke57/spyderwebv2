import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

export const AnimatedStarButton = ({ 
  count, 
  isStarred, 
  onStarClick, 
  size = 16,
  className = ""
}: {
  count: number;
  isStarred: boolean;
  onStarClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  className?: string;
}) => {
  const [animating, setAnimating] = useState(false);
  const starRef = useRef(null);
  
  const handleClick = (e : any) => {
    onStarClick(e);
    if (!isStarred) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
    }
  };

  return (
    <div className="flex flex-row items-center space-x-1 relative text-muted-foreground hover:text-violet-500 p-1 rounded-full hover:bg-violet-500/20 transition-colors ease-in">
      <p className={`text-sm transition-all duration-300 ${
        isStarred ? "text-violet-500 dark:text-violet-400" : ""
      } ${animating ? "scale-110" : ""}`}>
        {count}
      </p>
      
      <div className="relative">
        {/* Background burst */}
        {animating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full opacity-70 scale-0 animate-ping-scale" />
          </div>
        )}
        
        {/* Small stars that fly out */}
        {animating && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-star-1" />
              <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-star-2" />
              <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-star-3" />
              <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-star-4" />
              <div className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-star-5" />
            </div>
          </>
        )}
        
        <Star
          ref={starRef}
          size={size}
          strokeWidth={1.4}
          className={`${
            isStarred
              ? "text-violet-500 dark:text-violet-400 fill-violet-500 dark:fill-violet-400"
              : ""
          } ${animating ? "animate-star-pop" : "transition-colors duration-300"} ${className}`}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

// Custom styling - needs to be added to your global CSS
// Add these keyframes and utility classes to your tailwind config extend
const styles = `
@keyframes ping-scale {
  0% { transform: scale(0); opacity: 0.7; }
  50% { transform: scale(1.5); opacity: 0.3; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes star-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.4); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes star-fly-1 {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(-8px, -12px); opacity: 0; }
}

@keyframes star-fly-2 {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(10px, -8px); opacity: 0; }
}

@keyframes star-fly-3 {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(-10px, 5px); opacity: 0; }
}

@keyframes star-fly-4 {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(12px, 7px); opacity: 0; }
}

@keyframes star-fly-5 {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(0, -15px); opacity: 0; }
}

.animate-ping-scale {
  animation: ping-scale 0.7s cubic-bezier(0, 0, 0.2, 1) forwards;
}

.animate-star-pop {
  animation: star-pop 0.5s ease forwards;
}

.animate-star-1 {
  animation: star-fly-1 0.7s ease-out forwards;
}

.animate-star-2 {
  animation: star-fly-2 0.7s ease-out forwards;
}

.animate-star-3 {
  animation: star-fly-3 0.6s ease-out forwards;
}

.animate-star-4 {
  animation: star-fly-4 0.6s ease-out forwards;
}

.animate-star-5 {
  animation: star-fly-5 0.5s ease-out forwards;
}
`;


export default function AnimatedStar() {
  const [starred, setStarred] = useState(false);
  const [count, setCount] = useState(42);
  
  const handleStarClick = (e : React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setStarred(!starred);
    setCount(starred ? count - 1 : count + 1);
  };
  
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-md shadow">
      <style jsx>{styles}</style>
      <AnimatedStarButton
        count={count}
        isStarred={starred}
        onStarClick={handleStarClick}
        size={18}
      />
    </div>
  );
}