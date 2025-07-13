import React, { useState, useEffect } from "react";
import {
  Player,
  Team,
  Match,
  TournamentState,
  initialiseMatches,
  advanceMatch,
  startAvailableMatches,
  sortTeamsByRank,
} from "../utils/SKDoubleGenerator";
import { useLocation, useNavigate } from "react-router-dom";
import Court from "../components/court";
import logo from "../assets/logo.png";

interface CourtScore {
  score1: string;
  score2: string;
}

const SKGamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Configurable number of courts
  const NUMBER_OF_COURTS = 2; // Can be made configurable through props or state

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

  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    initialiseMatches(players)
  );

  // Dynamic court scores based on number of courts
  const [courtScores, setCourtScores] = useState<Record<number, CourtScore>>(
    () => {
      const initialScores: Record<number, CourtScore> = {};
      for (let i = 1; i <= NUMBER_OF_COURTS; i++) {
        initialScores[i] = { score1: "", score2: "" };
      }
      return initialScores;
    }
  );

  // Auto-start matches when courts are available
  useEffect(() => {
    if (
      tournamentState.currentMatches.length < NUMBER_OF_COURTS &&
      tournamentState.pendingMatches.length > 0
    ) {
      const newState = startAvailableMatches(tournamentState);
      setTournamentState(newState);
    }
  }, [
    tournamentState.currentMatches.length,
    tournamentState.pendingMatches.length,
  ]);

  // Reset score inputs when matches change
  useEffect(() => {
    const newScores: Record<number, CourtScore> = {};
    for (let i = 1; i <= NUMBER_OF_COURTS; i++) {
      newScores[i] = { score1: "", score2: "" };
    }
    setCourtScores(newScores);
  }, [
    tournamentState.currentMatches
      .map((m) => `${m.court}-${m.party1}-${m.party2}`)
      .join(","),
  ]);

  // Navigate to result page once the tournament is complete
  useEffect(() => {
    if (isTournamentComplete()) {
      endGame();
    }
  }, [tournamentState]);

  /**
   * Handle score update for a specific court
   */
  const handleScoreUpdate = (
    courtNumber: number,
    scorePosition: 1 | 2,
    value: string
  ) => {
    const match = tournamentState.currentMatches.find(
      (m) => m.court === courtNumber
    );
    if (!match) {
      console.warn(`No current match on court ${courtNumber}`);
      return;
    }

    const numericValue = parseInt(value) || 0;

    // Validate score - don't allow scores greater than playToScore
    if (value !== "" && numericValue > playToScore) {
      console.log(
        `Invalid score: ${numericValue} is greater than maximum ${playToScore}`
      );
      return;
    }

    // Update local state for inputs first
    setCourtScores((prev) => ({
      ...prev,
      [courtNumber]: {
        ...prev[courtNumber],
        [scorePosition === 1 ? "score1" : "score2"]: value,
      },
    }));

    // Update match scores only if value is not empty
    if (value !== "") {
      setTournamentState((prevState) => ({
        ...prevState,
        currentMatches: prevState.currentMatches.map((m) =>
          m.court === courtNumber
            ? {
                ...m,
                score1: scorePosition === 1 ? numericValue : m.score1,
                score2: scorePosition === 2 ? numericValue : m.score2,
              }
            : m
        ),
      }));
    }
  };

  /**
   * Complete a specific match
   */
  const completeMatch = (courtNumber: number) => {
    const match = tournamentState.currentMatches.find(
      (m) => m.court === courtNumber
    );
    if (!match) {
      console.warn(`No current match on court ${courtNumber}`);
      return;
    }

    if (match.score1 === undefined || match.score2 === undefined) {
      console.warn("Both scores must be entered before completing match");
      return;
    }

    // Validate that at least one team has reached the playToScore
    if (match.score1 !== playToScore && match.score2 !== playToScore) {
      console.warn(`One team must reach the target score of ${playToScore}`);
      return;
    }

    try {
      const newState = advanceMatch(tournamentState, match);
      setTournamentState(newState);
    } catch (error) {
      console.error("Error advancing match:", error);
    }
  };

  /**
   * Check if tournament is complete
   */
  const isTournamentComplete = () => {
    return (
      tournamentState.pendingMatches.length === 0 &&
      tournamentState.currentMatches.length === 0
    );
  };

  /**
   * End game and sort teams
   */
  const endGame = () => {
    if (tournamentState.participatingTeams) {
      const rankedTeams = sortTeamsByRank(tournamentState.participatingTeams);
      localStorage.setItem("SKFinalResults", JSON.stringify(rankedTeams));
      navigate("./SKGameSummary");
    }
  };

  const handleGameSetup = () => {
    navigate("../InputPage");
  };

  /**
   * Get responsive grid columns based on number of courts
   */
  const getGridColumns = (courtCount: number): string => {
    if (courtCount === 1) return "grid-cols-1";
    if (courtCount === 2) return "grid-cols-1 lg:grid-cols-2";
    if (courtCount === 3) return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
    if (courtCount === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  const handleHome = () => {
    navigate("/");
    window.location.reload();
  };

  const totalMatches =
    tournamentState.finishedMatches.length +
    tournamentState.currentMatches.length +
    tournamentState.pendingMatches.length;
  const progressPercentage =
    (tournamentState.finishedMatches.length / totalMatches) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <img
              onClick={handleHome}
              src={logo}
              alt="Logo"
              className="w-12 h-12 cursor-pointer"
            />
            <h1 className="text-xl font-black tracking-wider">
              Single Knockout
            </h1>
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

        {/* Navigation and Tournament Status */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={handleGameSetup}
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
            GAME SETUP
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-wider">
              {isTournamentComplete()
                ? "TOURNAMENT COMPLETE"
                : "TOURNAMENT IN PROGRESS"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Play to {playToScore}</p>
          </div>

          <button
            onClick={endGame}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-lg font-semibold tracking-wider hover:bg-black hover:text-white transition-colors"
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

        {/* Courts - Dynamic rendering */}
        <div className={`grid gap-8 mb-12 ${getGridColumns(NUMBER_OF_COURTS)}`}>
          {Array.from({ length: NUMBER_OF_COURTS }, (_, index) => {
            const courtNumber = index + 1;
            const match = tournamentState.currentMatches.find(
              (m) => m.court === courtNumber
            );
            const scores = courtScores[courtNumber] || {
              score1: "",
              score2: "",
            };

            return (
              <Court
                key={courtNumber}
                courtNumber={courtNumber}
                match={match}
                playToScore={playToScore}
                score1={scores.score1}
                score2={scores.score2}
                onScoreUpdate={(scorePosition, value) =>
                  handleScoreUpdate(courtNumber, scorePosition, value)
                }
                onCompleteMatch={() => completeMatch(courtNumber)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SKGamePage;
