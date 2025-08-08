import React from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import Home from "./pages/Home/Home";
import Sessions from "./pages/Activities/Sessions.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="sessions" element={<Sessions />} />
      </Route>
    </Routes>
  );
};

export default App;
