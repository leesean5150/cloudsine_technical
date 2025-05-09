import React from "react";
import { Routes, Route } from "react-router-dom";


import "./App.css";
import { Home } from "./pages/Home/index.tsx";
import { AnalysisPage } from "./pages/AnalysisTable/index.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis-table" element={<AnalysisPage />} />
      </Routes>
    </>
  );
}

export default App;
