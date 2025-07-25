import logo from "../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  initialise,
  advanceMatch,
  getPlayers,
  generatePlayersFromMatches,
} from "../utils/RRDoublesGenerator";
import type { Player, TournamentState } from "@/types";
import Court from "../components/Court";

interface CourtScores {
  [courtNumber: number]: {
    score1: number;
    score2: number;
  };
}

const RRGamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tournament state management
  const [tournamentState, setTournamentState] =
    useState<TournamentState | null>(null);
  const [courtScores, setCourtScores] = useState<CourtScores>({});

  const [numberOfCourts, setNumberOfCourts] = useState<number>(() => {
    const locationState = location.state;
    if (locationState?.numOfCourts) {
      return locationState.numOfCourts;
    } else {
      const storedNumOfCourts = localStorage.getItem("numOfCourts");
      if (storedNumOfCourts) {
        try {
          return JSON.parse(storedNumOfCourts);
        } catch (error) {
          console.error("Error parsing stored numOfCourts:", error);
        }
      }
    }
    return 2;
  });

  // retrieve the players names & play-to score from input page
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
      return playerData.map((playerName: string, index: number) => ({
        id: playerName,
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

  // Initialize tournament state
  useEffect(() => {
    if (players.length > 0) {
      const initialState = initialise(numberOfCourts, players);
      setTournamentState(initialState);

      // Initialize court scores
      const initialCourtScores: CourtScores = {};
      for (let i = 1; i <= numberOfCourts; i++) {
        initialCourtScores[i] = { score1: 0, score2: 0 };
      }
      setCourtScores(initialCourtScores);
    }
  }, [players, numberOfCourts]);

  useEffect(() => {
    if (!players || players.length === 0) {
      navigate("./InputPage", { replace: true });
    }
  }, [players, navigate]);

  // Auto-fill empty courts with available matches
  useEffect(() => {
    if (!tournamentState) return;

    let stateChanged = false;
    const newTournamentState = { ...tournamentState };

    // Check each court to see if it needs a match
    for (let courtNum = 1; courtNum <= numberOfCourts; courtNum++) {
      const hasMatch = newTournamentState.currentMatches.some(
        (m) => m.court === courtNum
      );

      if (!hasMatch && newTournamentState.pendingMatches.length > 0) {
        // Find an available match for this court
        const currentPlayers = generatePlayersFromMatches(
          newTournamentState.currentMatches
        );
        const currPlayerSet = new Set(currentPlayers.map((p) => p.id));

        for (let i = 0; i < newTournamentState.pendingMatches.length; i++) {
          const potentialMatch = newTournamentState.pendingMatches[i];
          const potentialMatchPlayers = getPlayers(potentialMatch);

          // Check if this match has no player conflicts
          const hasConflict = potentialMatchPlayers.some((player) =>
            currPlayerSet.has(player.id)
          );

          if (!hasConflict) {
            // Assign this match to the court
            potentialMatch.court = courtNum;
            newTournamentState.currentMatches.push(potentialMatch);
            newTournamentState.pendingMatches.splice(i, 1);
            stateChanged = true;
            break;
          }
        }
      }
    }

    if (stateChanged) {
      setTournamentState(newTournamentState);
    }
  }, [tournamentState, numberOfCourts]);

  const handleGameSetup = () => {
    navigate("../InputPage");
  };

  const handleHome = () => {
    navigate("/");
    window.location.reload();
  };

  const handleScoreUpdate = (
    courtNumber: number,
    scorePosition: 1 | 2,
    value: string
  ) => {
    const numericValue = value === "" ? 0 : parseInt(value, 10);

    // Validate score
    if (numericValue > playToScore) {
      return;
    }

    setCourtScores((prev) => ({
      ...prev,
      [courtNumber]: {
        ...prev[courtNumber],
        [`score${scorePosition}`]: numericValue,
      },
    }));
  };

  const completeMatch = (courtNumber: number) => {
    const match = tournamentState?.currentMatches.find(
      (m) => m.court === courtNumber
    );
    const scores = courtScores[courtNumber];

    if (!match || !scores || !tournamentState) return;

    // Update match scores
    match.score1 = scores.score1;
    match.score2 = scores.score2;

    // Create new tournament state with advanced match
    const newTournamentState = { ...tournamentState };
    advanceMatch(match, newTournamentState);
    setTournamentState(newTournamentState);

    // Reset court scores
    setCourtScores((prev) => ({
      ...prev,
      [courtNumber]: { score1: 0, score2: 0 },
    }));
  };

  const endGame = () => {
    if (!tournamentState) return;

    // Store final results for the summary page
    localStorage.setItem(
      "finalResults",
      JSON.stringify(tournamentState.participatingPlayers)
    );
    localStorage.setItem(
      "finalGames",
      JSON.stringify(tournamentState.finishedMatches)
    );
    navigate("./RRGameSummary");
  };

  // Early return after all hooks are called - this is safe
  if (!players || players.length === 0 || !tournamentState) {
    return null;
  }

  const totalMatches =
    tournamentState.pendingMatches.length +
    tournamentState.currentMatches.length +
    tournamentState.finishedMatches.length;
  const completedMatches = tournamentState.finishedMatches.length;
  const progressPercentage =
    totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  const isGameComplete =
    tournamentState.pendingMatches.length === 0 &&
    tournamentState.currentMatches.length === 0;

  // Generate court components
  const courts = Array.from({ length: numberOfCourts }, (_, index) => {
    const courtNumber = index + 1;
    const match = tournamentState.currentMatches.find(
      (m) => m.court === courtNumber
    );
    const courtScoresData = courtScores[courtNumber] || {
      score1: 0,
      score2: 0,
    };
    const party1Name = match?.party1?.id;
    const party2Name = match?.party2?.id;

    return (
      <Court
        key={courtNumber}
        courtNumber={courtNumber}
        name1={party1Name}
        name2={party2Name}
        playToScore={playToScore}
        score1={courtScoresData.score1}
        score2={courtScoresData.score2}
        onScoreUpdate={(scorePosition: 1 | 2, value: string) =>
          handleScoreUpdate(courtNumber, scorePosition, value)
        }
        onCompleteMatch={() => completeMatch(courtNumber)}
      />
    );
  });

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

        {/* Navigation and Game Status */}
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
              TOURNAMENT PROGRESS
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {completedMatches}/{totalMatches} matches completed | Play to{" "}
              {playToScore}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Pending: {tournamentState.pendingMatches.length} | Active:{" "}
              {tournamentState.currentMatches.length}
            </p>
          </div>

          <button
            onClick={endGame}
            disabled={!isGameComplete}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-lg font-semibold tracking-wider hover:bg-black hover:text-white transition-colors disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
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

        {/* Courts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {courts}
        </div>
      </div>
    </div>
  );
};

export default RRGamePage;
