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

  const [scores, setScores] = useState<{ [key: string]: number }>({});

  const getScoreKey = (gameIndex: number, matchIndex: number, team: number) =>
    `${gameIndex}-${matchIndex}-${team}`;

  const [players, setPlayers] = useState<Player[]>(() => {
    const locationState = location.state;
    let playerData = null;
    if (locationState?.players) {
      playerData = locationState.players;
    } else {
      const storedPlayers = localStorage.getItem("Players");
      if (storedPlayers) {
        try {
          playerData = JSON.parse(storedPlayers);
        } catch (error) {
          console.error("Error parsing stored players:", error);
        }
      }
    }

    if (Array.isArray(playerData)) {
      return playerData.map((playerName: string) => ({
        name: playerName,
        score: 0,
      }));
    }
    return [];
  });

  const [playToScore, setPlayToScore] = useState<number>(() => {
    const locationState = location.state;
    if (locationState?.playToScore) {
      return locationState.playToScore;
    } else {
      const storedPlayToScore = localStorage.getItem("playToScore");
      if (storedPlayToScore) {
        try {
          return JSON.parse(storedPlayToScore);
        } catch (error) {
          console.error("Error parsing stored playToScore:", error);
        }
      }
    }
    return 8;
  });

  useEffect(() => {
    if (!players || players.length === 0) {
      navigate("./InputPage", { replace: true });
    }
  }, [players, navigate]);

  if (!players || players.length === 0) return null;

  const games: Schedule = generateDoubleMatchesFromPlayers(players);
  const totalGames = games.length;
  const currentGameData = games[currentGame - 1] || games[0];
  const progressPercentage = (currentGame / totalGames) * 100;

  const handleGameSetup = () => {
    setScores({});
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

  const handleScoreInput = (
    gameIndex: number,
    matchIndex: number,
    score: number,
    team: number
  ) => {
    if (score > playToScore) {
      console.log(
        `Invalid score: ${score} is greater than maximum ${playToScore}`
      );
      return;
    }

    const key = getScoreKey(gameIndex, matchIndex, team);
    setScores((prev) => ({
      ...prev,
      [key]: score,
    }));

    const match = games[gameIndex][matchIndex];
    if (team === 1) match.score1 = score;
    else if (team === 2) match.score2 = score;
  };

  const endGame = () => {
    tallyMatchScore(games);
    console.log("Final scores:", games);
    // navigate("/ResultsPage"); // Add if needed
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
            <p className="text-sm text-gray-600 mt-1">Play to {playToScore}</p>
          </div>

          <button
            onClick={handleNextGame}
            disabled={currentGame === totalGames}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-lg font-semibold tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>

        {/* Courts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {[0, 1].map((matchIndex) => {
            const match = currentGameData[matchIndex];
            return (
              <div
                key={matchIndex}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                <div className="bg-black text-white p-4">
                  <h3 className="text-xl font-bold tracking-wider">
                    COURT {matchIndex + 1}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="flex justify-end text-sm text-gray-600 mb-6 tracking-wider">
                    SCORE
                  </p>
                  {[1, 2].map((team) => {
                    const teamPlayers = team === 1 ? match.team1 : match.team2;
                    return (
                      <div
                        key={team}
                        className="flex items-center justify-between mb-4"
                      >
                        <span className="text-2xl font-semibold tracking-wider">
                          {teamPlayers[0].name} & {teamPlayers[1].name}
                        </span>
                        <input
                          type="text"
                          maxLength={2}
                          inputMode="numeric"
                          pattern="\d*"
                          value={
                            scores[
                              getScoreKey(currentGame - 1, matchIndex, team)
                            ] ?? ""
                          }
                          onChange={(e) =>
                            handleScoreInput(
                              currentGame - 1,
                              matchIndex,
                              Number(e.target.value),
                              team
                            )
                          }
                          className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RRGamePage;
