import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import DefaultLayout from "./layout/DefaultLayout";
import Home from "./pages/Home/Home";
import Sessions from "./pages/Activities/Sessions.jsx";
import Networking from "./pages/Activities/Networking.jsx";
import ProjectList from "./pages/Projects/ProjectList.jsx";
import ProjectDetail from "./pages/Projects/ProjectDetail.jsx";
import Recruiting from "./pages/Recruit/Recruiting.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="networking" element={<Networking />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="recruiting" element={<Recruiting />} />
        <Route path="projectlist" element={<Navigate to="/projects" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
