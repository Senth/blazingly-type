import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TypingPracticePage from "@pages/TypingPractice";
import Modals from "@components/Modals";
import Settings from "@pages/Settings";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<TypingPracticePage />} />
        </Routes>
      </Router>
      <Modals />
    </>
  );
}

export default App;
