import logo from "../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  generateDoubleMatchesFromPlayers,
  tallyMatchScore,
} from "../utils/RRDoublesGenerator";
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
  const [state, setState] = useState<string[] | null>(() => {
    const locationState = location.state;
    const storedState = JSON.parse(localStorage.getItem("Players") || "null");

    // Handle both array format and object format
    const getPlayersArray = (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.players)) return data.players;
      return null;
    };

    return getPlayersArray(locationState) || getPlayersArray(storedState);
  });

  useEffect(() => {
    if (!state || !Array.isArray(state)) {
      navigate("./InputPage", { replace: true });
    }
  }, [state, navigate]);

  // Early return if state is invalid
  if (!state || !Array.isArray(state)) return null;

  // Now we know state is an array of strings
  const players: Player[] = state.map((playerName: string) => ({
    name: playerName,
    score: 0,
  }));

  const games: Schedule = generateDoubleMatchesFromPlayers(players);

  const totalGames = games.length;

  const currentGameData = games[currentGame - 1] || games[0]; // one session

  const progressPercentage = (currentGame / totalGames) * 100;

  const handleGameSetup = () => {
    navigate("../InputPage");
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

  const handleScoreInput = (match: Match, score: number, team: number) => {
    // assign score to matches
    // team : 1 or 2
    if (team === 1) {
      match.score1 = score;
    } else if (team === 2) {
      match.score2 = score;
    } else {
      console.log(`invalid team number: ${team}`);
    }
  };

  const endGame = () => {};
  tallyMatchScore(games);
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
                SCORE
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[0].team1[0].name} &{" "}
                    {currentGameData[0].team1[1].name}
                  </span>
                  <input
                    type="text"
                    maxLength={2} // Limit to 2 digits
                    inputMode="numeric" // Triggers numeric keyboard on mobile
                    pattern="\d*"
                    onChange={(e) =>
                      handleScoreInput(
                        currentGameData[0],
                        Number(e.target.value),
                        1
                      )
                    }
                    className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold tracking-wider">
                      {currentGameData[0].team2[0].name} &{" "}
                      {currentGameData[0].team2[1].name}
                    </span>
                    {/*the score input field*/}
                    <input
                      type="text"
                      maxLength={2} // Limit to 2 digits
                      inputMode="numeric" // Triggers numeric keyboard on mobile
                      pattern="\d*"
                      onChange={(e) =>
                        handleScoreInput(
                          currentGameData[0],
                          Number(e.target.value),
                          2
                        )
                      }
                      className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                    />
                  </div>
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
                SCORE
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[1].team1[0].name} &{" "}
                    {currentGameData[1].team1[1].name}
                  </span>
                  {/*the score input field*/}
                  <input
                    type="text"
                    maxLength={2} // Limit to 2 digits
                    inputMode="numeric" // Triggers numeric keyboard on mobile
                    pattern="\d*"
                    onChange={(e) =>
                      handleScoreInput(
                        currentGameData[1],
                        Number(e.target.value),
                        1
                      )
                    }
                    className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-wider">
                    {currentGameData[1].team2[0].name} &{" "}
                    {currentGameData[1].team2[1].name}
                  </span>
                  {/*the score input field*/}
                  <input
                    type="text"
                    maxLength={2} // Limit to 2 digits
                    inputMode="numeric" // Triggers numeric keyboard on mobile
                    pattern="\d*"
                    onChange={(e) =>
                      handleScoreInput(
                        currentGameData[1],
                        Number(e.target.value),
                        2
                      )
                    }
                    className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* End Game Button */}
        <div className="flex justify-end">
          <button
            onClick={endGame}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-semibold tracking-wider hover:bg-gray-800 transition-colors"
          >
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
