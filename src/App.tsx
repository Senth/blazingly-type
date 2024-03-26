import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TypingPracticePage from "./pages/TypingPractice";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TypingPracticePage />} />
      </Routes>
    </Router>
  );
}

export default App;
