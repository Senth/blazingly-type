import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TypingPracticePage from "@pages/TypingPractice";
import Modals from "@components/Modals";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<TypingPracticePage />} />
        </Routes>
      </Router>
      <Modals />
    </>
  );
}

export default App;
