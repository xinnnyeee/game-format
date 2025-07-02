import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Player } from "../utils/RRDoublesGenerator";

interface PlayerResult {
  rank: number;
  name: string;
  score: number;
}

const RRGameSummary: React.FC = () => {
  const navigate = useNavigate();
  const [playerRank, setPlayerRank] = useState<Player[]>([]);
  useEffect(() => {
    const storedResults = localStorage.getItem("finalResults");
    if (storedResults) {
      try {
        setPlayerRank(JSON.parse(storedResults));
      } catch (err) {
        console.error("Error parsing finalResults:", err);
      }
    }
  });

  const results: PlayerResult[] = playerRank.map((player, index) => ({
    rank: index + 1,
    name: player.name,
    score: player.score,
  }));

  const handleGameSetup = () => {
    console.log("Navigate to Game Setup");
  };

  const handleHome = () => {
    navigate("/");
    window.location.reload();
  };

  const handleNextMatch = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Logo" className="w-12 h-12" />

              <h1 className="text-2xl font-bold text-gray-900 tracking-wider">
                ROUND ROBIN RESULTS
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between mb-8">
          <button
            onClick={handleGameSetup}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">←</span>
            <span className="font-semibold tracking-wider">GAME SETUP</span>
          </button>

          <button
            onClick={handleHome}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">🏠</span>
            <span className="font-semibold tracking-wider">HOME</span>
          </button>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Trophy Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏆</span>
              <h2 className="text-2xl font-bold text-gray-900 tracking-wider">
                FINAL RESULTS
              </h2>
            </div>
            <div className="ml-auto">
              <span className="text-lg font-bold text-gray-900 tracking-wider">
                SCORE
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.rank} className="flex items-center">
                <div className="w-12 flex-shrink-0">
                  <span className="text-2xl font-bold text-gray-900">
                    #{result.rank}
                  </span>
                </div>
                <div className="flex-1 mx-6">
                  <div className="bg-gray-100 rounded-full px-6 py-4 border border-gray-200">
                    <span className="text-lg font-bold text-gray-900 tracking-wider">
                      {result.name}
                    </span>
                  </div>
                </div>
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="text-2xl font-bold text-gray-900">
                    {result.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Next Match Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleNextMatch}
              className="px-12 py-4 bg-black text-white rounded-lg font-bold text-lg tracking-wider hover:bg-gray-800 transition-colors"
            >
              NEXT MATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RRGameSummary;
