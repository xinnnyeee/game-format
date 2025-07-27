import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Team, TournamentState, CourtScore } from "@/types";
import {
  initialise,
  advanceMatch,
  sortTeamByScores,
  generateTeams,
} from "../utils/KOTCfunctions";
import Court from "../components/Court";
import logo from "../assets/logo.png";
import Banner from "@/components/Banner";

const KOTCGamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [numberOfCourts, setNumberOfCourts] = useState<number>(() => {
    const locationState = location.state;
    if (locationState?.numOfCourts) return locationState.numOfCourts;
    const stored = localStorage.getItem("numOfCourts");
    return stored ? JSON.parse(stored) : 2;
  });

  const [players, setPlayers] = useState<string[]>(() => {
    const locationState = location.state;
    let playerData = locationState?.players;
    if (!playerData) {
      const stored = localStorage.getItem("Players");
      playerData = stored ? JSON.parse(stored) : [];
    }
    return Array.isArray(playerData) ? playerData : [];
  });

  // Fixed play-to score as 2 per requirements
  const playToScore = 2;

  // Generate teams from players
  const [teams, setTeams] = useState<Team[]>(() => {
    return generateTeams(players);
  });

  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    initialise(teams, numberOfCourts)
  );

  const [courtScores, setCourtScores] = useState<Record<number, CourtScore>>(
    () => {
      const scores: Record<number, CourtScore> = {};
      for (let i = 1; i <= numberOfCourts; i++) {
        scores[i] = { score1: 0, score2: 0 };
      }
      return scores;
    }
  );

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const stored = localStorage.getItem("gameDuration");
    return stored ? JSON.parse(stored) : 600; // 10 minutes default
  });

  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsTimerActive(false);
            // Auto-trigger end game when timer reaches 0
            setTimeout(() => endGame(), 1000);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const resetScores: Record<number, CourtScore> = {};
    for (let i = 1; i <= numberOfCourts; i++) {
      resetScores[i] = { score1: 0, score2: 0 };
    }
    setCourtScores(resetScores);
  }, [
    tournamentState.currentMatches
      .map((m) => `${m.court}-${m.king?.id}-${m.challenger?.id}`)
      .join(","),
    numberOfCourts,
  ]);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<
    "error" | "warning" | "info" | "success"
  >("error");

  const handleScoreUpdate = (
    courtNumber: number,
    scorePosition: 1 | 2,
    value: string
  ) => {
    const numericValue = parseInt(value) || 0;
    if (numericValue > playToScore) {
      setBannerMessage(`Score cannot exceed play-to score of ${playToScore}`);
      setBannerType("error");
      return;
    }
    setBannerMessage(null);
    setCourtScores((prev) => ({
      ...prev,
      [courtNumber]: {
        ...prev[courtNumber],
        [scorePosition === 1 ? "score1" : "score2"]: value,
      },
    }));

    setTournamentState((prev) => ({
      ...prev,
      currentMatches: prev.currentMatches.map((m) =>
        m.court === courtNumber
          ? {
              ...m,
              score1: scorePosition === 1 ? numericValue : m.score1,
              score2: scorePosition === 2 ? numericValue : m.score2,
            }
          : m
      ),
    }));
  };

  const completeMatch = (courtNumber: number) => {
    const match = tournamentState.currentMatches.find(
      (m) => m.court === courtNumber
    );
    if (!match || match.score1 === undefined || match.score2 === undefined) {
      setBannerMessage("Both scores must be entered");
      setBannerType("error");
      return;
    }
    if (match.score1 !== playToScore && match.score2 !== playToScore) {
      setBannerMessage(
        `One team must reach the target score of ${playToScore}`
      );
      setBannerType("error");
      return;
    }
    try {
      const updated = advanceMatch(match, tournamentState);
      setTournamentState(updated);
    } catch (err) {
      console.error(err);
      setBannerMessage("Error completing match");
      setBannerType("error");
    }
  };

  const getAllTeamsForStandings = () => {
    const queuedTeams = tournamentState.participatingTeams || [];
    const kingTeams = tournamentState.kings || [];
    const currentChallengers = tournamentState.currentMatches
      .map((match) => match.challenger)
      .filter((challenger): challenger is Team => challenger !== undefined);

    const allTeams = [...queuedTeams, ...kingTeams, ...currentChallengers];
    return allTeams.filter(
      (team, index, array) => array.findIndex((t) => t.id === team.id) === index
    );
  };

  const isTournamentComplete = () =>
    tournamentState.pendingMatches.length === 0 &&
    tournamentState.currentMatches.length === 0;

  const endGame = () => {
    setIsTimerActive(false);
    const allTeams = getAllTeamsForStandings();
    const ranked = sortTeamByScores(allTeams);
    localStorage.setItem("KOTCFinalResults", JSON.stringify(ranked));
    navigate("./KOTCGameSummary");
  };

  const getTeamDisplayName = (team: Team): string => {
    return team.id;
  };

  const courts = Array.from({ length: numberOfCourts }, (_, i) => {
    const court = i + 1;
    const match = tournamentState.currentMatches.find((m) => m.court === court);
    const scores = courtScores[court];

    if (!match) {
      return (
        <div key={court} className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-bold text-center mb-4">Court {court}</h3>
          <div className="text-center text-gray-500">No active match</div>
        </div>
      );
    }

    const kingName = match.king ? getTeamDisplayName(match.king) : "";
    const challengerName = match.challenger
      ? getTeamDisplayName(match.challenger)
      : "";

    return (
      <Court
        key={court}
        courtNumber={court}
        name1={`👑 ${kingName}`}
        name2={challengerName}
        playToScore={playToScore}
        score1={scores?.score1 ?? 0}
        score2={scores?.score2 ?? 0}
        onScoreUpdate={(pos, val) => handleScoreUpdate(court, pos, val)}
        onCompleteMatch={() => completeMatch(court)}
      />
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {bannerMessage && (
          <Banner
            message={bannerMessage}
            type={bannerType}
            onDismiss={() => setBannerMessage(null)}
          />
        )}

        <header className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <img
              onClick={() => navigate("/")}
              src={logo}
              alt="Logo"
              className="w-12 h-12 cursor-pointer"
            />
            <h1 className="text-xl font-black tracking-wider">
              King of the Court
            </h1>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                timeRemaining <= 60 ? "text-red-500" : "text-black"
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Time Remaining</div>
          </div>
        </header>

        <div className="flex items-center justify-between my-6">
          <button
            onClick={() => navigate("../InputPage")}
            className="px-6 py-3 border-2 border-black rounded-lg hover:bg-black hover:text-white"
          >
            GAME SETUP
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isTournamentComplete()
                ? "TOURNAMENT COMPLETE"
                : "TOURNAMENT IN PROGRESS"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Play to {playToScore}</p>
            <p className="text-xs text-gray-500 mt-1">
              Teams: {teams.length} | Courts: {numberOfCourts}
            </p>
          </div>

          <button
            onClick={endGame}
            className="px-6 py-3 border-2 border-black rounded-lg hover:bg-black hover:text-white"
          >
            END GAME
          </button>
        </div>

        {/* Current Standings */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-bold mb-2">Current Standings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {getAllTeamsForStandings()
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((team) => (
                <div
                  key={team.id}
                  className="flex justify-between items-center"
                >
                  <span className={team.isKing ? "font-bold" : ""}>
                    {team.isKing && "👑 "}
                    {getTeamDisplayName(team)}
                  </span>
                  <span className="font-mono">{team.score}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {courts}
        </div>

        {/* Queue Status */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-bold mb-2">Challenger Queue</h3>
          <div className="text-sm text-gray-600">
            {tournamentState.participatingTeams!.length} teams waiting
            {tournamentState.participatingTeams!.length > 0 && (
              <span className="ml-2">
                Next:{" "}
                {getTeamDisplayName(tournamentState.participatingTeams![0])}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOTCGamePage;
