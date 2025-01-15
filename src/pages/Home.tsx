import React from "react"; 
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/ui/DarkModeToggle"

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <h1 className="text-5xl font-bold mb-8 text-primary">ScienceFair.ai</h1>
      <p className="text-lg mb-6 text-secondary-foreground">
        Your AI partner for science fair success! Generate ideas, find mentors, and more.
      </p>
      
      <div className="flex flex-row items-center space-x-5">
        <button
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                     hover:bg-primary/80 transition-colors 
                     focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => navigate("/project-generator")}
        >
          Project Generator
        </button>
        <button
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                     hover:bg-primary/80 transition-colors 
                     focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => navigate("/mentor-finder")}
        >
          Mentor Finder
        </button>
      </div>
    </div>
  );
};

export default Home;