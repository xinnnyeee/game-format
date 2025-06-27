import logo from "../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateDoubleMatchesFromPlayers } from "../utils/RRDoublesGenerator";
import type {
  Player,
  Team,
  Match,
  Session,
  Schedule,
} from "../utils/RRDoublesGenerator";

const RRGamePage = () => {
  const [currentGame, setCurrentGame] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(() => {
    return (
      location.state || JSON.parse(localStorage.getItem("RRPlayers") || "null")
    );
  });

  useEffect(() => {
    if (!state) {
      navigate("../RRInput", { replace: true });
    }
  }, [state, navigate]);
  const players: Player[] = state.map((playerName: String) => ({
    playerName,
    score: 0,
  }));

  if (!state) return null;

  const games: Schedule = generateDoubleMatchesFromPlayers(players);
  const totalGames = games.length;

  const currentGameData = games[currentGame - 1] || games[0];

  const progressPercentage = (currentGame / totalGames) * 100;

  const handleGameSetup = () => {
    navigate("../RRInput");
  };

  const handlePrevGame = () => {
    if (currentGame > 1) {
      setCurrentGame(currentGame - 1);
    }
  };

  const handleNextGame = () => {
    if (currentGame < totalGames) {
      setCurrentGame(currentGame + 1);
    }
  };

  const handleWinnerSelect = (
    court: string,
    player1: Player,
    player2: Player
  ) => {
    // Handle winner selection logic here
    console.log(`${player1} and ${player2} wins on ${court}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <h1 className="text-xl font-black tracking-wider">Round Robin</h1>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation and Game Counter */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={currentGame < 2 ? handleGameSetup : handlePrevGame}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-lg font-semibold tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            {currentGame < 2 ? "GAME SETUP" : "PREV GAME"}
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-wider">
              GAME {currentGame}/{totalGames}
            </h2>
          </div>

          <button
            onClick={handleNextGame}
            disabled={currentGame === totalGames}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-lg font-semibold tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black"
          >
            NEXT GAME
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        {/* Courts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Court 1 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="bg-black text-white p-4">
              <h3 className="text-xl font-bold tracking-wider">COURT 1</h3>
            </div>
            <div className="p-6">
              <p className="flex justify-end text-sm text-gray-600 mb-6 tracking-wider">
                WINNER
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[0][0][0].name} &{" "}
                    {currentGameData[0][0][1].name}
                  </span>
                  <button
                    onClick={() =>
                      handleWinnerSelect(
                        "court1",
                        currentGameData[0][0][0],
                        currentGameData[0][0][1]
                      )
                    }
                    className="w-6 h-6 border-2 border-gray-400 rounded-full hover:border-black transition-colors focus:outline-none focus:border-black"
                  ></button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[0][1][0].name} &{" "}
                    {currentGameData[0][1][1].name}
                  </span>
                  <button
                    onClick={() =>
                      handleWinnerSelect(
                        "court1",
                        currentGameData[0][1][0],
                        currentGameData[0][1][1]
                      )
                    }
                    className="w-6 h-6 border-2 border-gray-400 rounded-full hover:border-black transition-colors focus:outline-none focus:border-black"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* Court 2 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="bg-black text-white p-4">
              <h3 className="text-xl font-bold tracking-wider">COURT 2</h3>
            </div>
            <div className="p-6">
              <p className="flex justify-end text-sm text-gray-600 mb-6 tracking-wider">
                WINNER
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[1][0][0].name} &{" "}
                    {currentGameData[1][0][1].name}
                  </span>
                  <button
                    onClick={() =>
                      handleWinnerSelect(
                        "court2",
                        currentGameData[1][0][0],
                        currentGameData[1][0][1]
                      )
                    }
                    className="w-6 h-6 border-2 border-gray-400 rounded-full hover:border-black transition-colors focus:outline-none focus:border-black"
                  ></button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[1][1][0].name} &{" "}
                    {currentGameData[1][1][1].name}
                  </span>
                  <button
                    onClick={() =>
                      handleWinnerSelect(
                        "court2",
                        currentGameData[1][1][0],
                        currentGameData[1][1][1]
                      )
                    }
                    className="w-6 h-6 border-2 border-gray-400 rounded-full hover:border-black transition-colors focus:outline-none focus:border-black"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* End Game Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-semibold tracking-wider hover:bg-gray-800 transition-colors">
            END GAME
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RRGamePage;
