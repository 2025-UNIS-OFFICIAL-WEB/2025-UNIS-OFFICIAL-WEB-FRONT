import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import Home from "./pages/Home/Home";
import Sessions from "./pages/Activities/Sessions.jsx";
import Networking from "./pages/Activities/Networking.jsx";
import ProjectList from "./pages/Projects/ProjectList.jsx";
import ProjectDetail from "./pages/Projects/ProjectDetail.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="networking" element={<Networking />} />
        <Route path="projectlist" element={<ProjectList />} />
        <Route path="projectdetail" element={<ProjectDetail />} />
      </Route>
    </Routes>
  );
};

export default App;
