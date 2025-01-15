import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectGenerator from "./pages/ProjectGenerator";
import MentorFinder from "./pages/MentorFinder";
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project-generator" element={<ProjectGenerator />} />
        <Route path="/mentor-finder" element={<MentorFinder />} />
      </Routes>
    </Router>
  );
};

export default App;
