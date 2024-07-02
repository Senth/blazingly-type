import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TypingPracticePage from "@pages/TypingPractice";
import LoginPage from "@pages/Login";
import Modals from "@components/Modals";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<TypingPracticePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
      <Modals />
    </>
  );
}

export default App;
