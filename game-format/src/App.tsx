// src/App.tsx
import "./index.css"; // Make sure this line exists
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import RRInputPage from "./pages/RRInputPage";
import SKInputPage from "./pages/SKInputPage";
import OPInputPage from "./pages/OPInputPage";
import KOTCInputPage from "./pages/KOTCInputPage";
import RRGamePage from "./pages/RRGamePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/RRInput" element={<RRInputPage />} />
      <Route path="/SKInput" element={<SKInputPage />} />
      <Route path="/OPInput" element={<OPInputPage />} />
      <Route path="/KOTCInput" element={<KOTCInputPage />} />
      <Route path="/RRInput/RRGamePage" element={<RRGamePage />} />
    </Routes>
  );
}

export default App;
