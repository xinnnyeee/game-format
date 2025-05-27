// src/App.tsx
import "./index.css"; // Make sure this line exists
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import InputPage from "./pages/InputPage";
import GamePage from "./pages/GamePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/pages/GamePage" element={<GamePage />} />
    </Routes>
  );
}

export default App;
