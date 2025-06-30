// src/App.tsx
import "./index.css"; // Make sure this line exists
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import InputPage from "./pages/InputPage";
import RRGamePage from "./pages/RRGamePage";
import SKGamePage from "./pages/SKGamePage";
import OPGamePage from "./pages/OPGamePage";
import KOTCGamePage from "./pages/KOTCGamePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/InputPage" element={<InputPage />} />
      <Route path="/InputPage/RRGamePage" element={<RRGamePage />} />
      <Route path="/InputPage/SKGamePage" element={<SKGamePage />} />
      <Route path="/InputPage/OPGamePage" element={<OPGamePage />} />
      <Route path="/InputPage/KOTCGamePage" element={<KOTCGamePage />} />
    </Routes>
  );
}

export default App;
