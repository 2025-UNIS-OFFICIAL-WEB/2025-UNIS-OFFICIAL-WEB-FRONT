import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import Home from "./pages/Home/Home";
import ProjectList from "./pages/Projects/ProjectList";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import ProjectDetailSpecial from "./pages/Projects/ProjectDetailSpecial";
import RecruitInfo from "./pages/Recruit/RecruitInfo";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/special" element={<ProjectDetailSpecial />} />
        <Route path="recruit" element={<RecruitInfo />} />
      </Route>
    </Routes>
  );
};

export default App;
