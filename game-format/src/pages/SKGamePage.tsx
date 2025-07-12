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
import logo from "../assets/logo.png";

interface SKGamePageProps {
  onTournamentComplete: (rankedTeams: Team[]) => void;
}

const SKGamePage: React.FC<SKGamePageProps> = ({ onTournamentComplete }) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  /**
   * Get party display name
   */
  const getPartyName = (party: Player | Team): string => {
    if (party as Player) {
      const player = party as Player;
      return player.name;
    } else if (party as Team) {
      const team = party as Team;
      return team.id;
    } else {
      return "";
    }
  };
  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    initialiseMatches(players)
  );

  // Score inputs for each court
  const [court1Score1, setCourt1Score1] = useState<string>("");
  const [court1Score2, setCourt1Score2] = useState<string>("");
  const [court2Score1, setCourt2Score1] = useState<string>("");
  const [court2Score2, setCourt2Score2] = useState<string>("");

  // Auto-start matches when courts are available
  useEffect(() => {
    if (
      tournamentState.currentMatches.length < 2 &&
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
    const court1Match = tournamentState.currentMatches.find(
      (match) => match.court === 1
    );
    const court2Match = tournamentState.currentMatches.find(
      (match) => match.court === 2
    );

    // Always reset if the match ID (or teams) change
    setCourt1Score1("");
    setCourt1Score2("");
    setCourt2Score1("");
    setCourt2Score2("");
  }, [
    getPartyName(
      tournamentState.currentMatches.find((m) => m.court === 1)?.party1!
    ),
    getPartyName(
      tournamentState.currentMatches.find((m) => m.court === 1)?.party2!
    ),
    getPartyName(
      tournamentState.currentMatches.find((m) => m.court === 2)?.party1!
    ),
    getPartyName(
      tournamentState.currentMatches.find((m) => m.court === 2)?.party2!
    ),
  ]);

  /**
   * Handle score update for a specific court
   */
  const handleScoreUpdate = (
    court: 1 | 2,
    scorePosition: 1 | 2,
    value: string
  ) => {
    const match = tournamentState.currentMatches.find((m) => m.court === court);
    if (!match) {
      console.warn(`No current match on court ${court}`);
      return;
    }

    const numericValue = parseInt(value) || 0;

    // Validate score - don't allow scores greater than playToScore
    if (numericValue > playToScore) {
      console.log(
        `Invalid score: ${numericValue} is greater than maximum ${playToScore}`
      );
      return;
    }

    // Update local state for inputs
    if (court === 1) {
      if (scorePosition === 1) setCourt1Score1(value);
      else setCourt1Score2(value);
    } else {
      if (scorePosition === 1) setCourt2Score1(value);
      else setCourt2Score2(value);
    }

    // Update match scores
    setTournamentState((prevState) => ({
      ...prevState,
      currentMatches: prevState.currentMatches.map((m) =>
        m.court === court
          ? {
              ...m,
              score1: scorePosition === 1 ? numericValue : m.score1,
              score2: scorePosition === 2 ? numericValue : m.score2,
            }
          : m
      ),
    }));
  };

  /**
   * Complete a specific match
   */
  const completeMatch = (court: 1 | 2) => {
    const match = tournamentState.currentMatches.find((m) => m.court === court);
    if (!match) {
      console.warn(`No current match on court ${court}`);
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
   * Get party display for team members
   */
  const getTeamMemberNames = (party: Player | Team): string => {
    if ("name" in party) {
      return party.name;
    } else {
      return `${party.player1.name} & ${party.player2.name}`;
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
      onTournamentComplete(rankedTeams);
    }
  };

  /**
   * Get score inputs for a specific court
   */
  const getScoreInputs = (court: 1 | 2) => {
    if (court === 1) {
      return { score1: court1Score1, score2: court1Score2 };
    } else {
      return { score1: court2Score1, score2: court2Score2 };
    }
  };

  /**
   * Check if a match can be completed
   */
  const canCompleteMatch = (match: Match) => {
    if (match.score1 === undefined || match.score2 === undefined) {
      return false;
    }
    // Must have at least one team reach the playToScore
    return match.score1 === playToScore || match.score2 === playToScore;
  };

  const handleGameSetup = () => {
    navigate("../InputPage");
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
              className="w-12 h-12"
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

        {/* Courts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {[1, 2].map((courtNumber) => {
            const match = tournamentState.currentMatches.find(
              (m) => m.court === courtNumber
            );
            const scoreInputs = getScoreInputs(courtNumber as 1 | 2);

            return (
              <div
                key={courtNumber}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                <div className="bg-black text-white p-4">
                  <h3 className="text-xl font-bold tracking-wider">
                    COURT {courtNumber}
                  </h3>
                </div>

                {match ? (
                  <div className="p-6">
                    <p className="flex justify-end text-sm text-gray-600 mb-6 tracking-wider">
                      SCORE
                    </p>
                    {[1, 2].map((team) => {
                      const party = team === 1 ? match.party1 : match.party2;
                      return (
                        <div
                          key={team}
                          className="flex items-center justify-between mb-4"
                        >
                          <span className="text-2xl font-semibold tracking-wider">
                            {party ? getTeamMemberNames(party) : "TBD"}
                          </span>
                          <input
                            type="text"
                            maxLength={2}
                            inputMode="numeric"
                            pattern="\d*"
                            value={
                              team === 1
                                ? scoreInputs.score1
                                : scoreInputs.score2
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d+$/.test(value)) {
                                handleScoreUpdate(
                                  courtNumber as 1 | 2,
                                  team as 1 | 2,
                                  value
                                );
                              }
                            }}
                            className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      );
                    })}

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => completeMatch(courtNumber as 1 | 2)}
                        disabled={!canCompleteMatch(match)}
                        className="px-4 py-2 bg-black text-white rounded-lg font-semibold tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        COMPLETE MATCH
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p className="text-lg">Court Available</p>
                    <p className="text-sm">Waiting for next match...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tournament Complete */}
        {isTournamentComplete() && (
          <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-12">
            <div className="bg-green-600 text-white p-4">
              <h3 className="text-xl font-bold tracking-wider">
                TOURNAMENT COMPLETE!
              </h3>
            </div>
            <div className="p-6">
              <p className="text-center mb-4">
                All matches have been completed.
              </p>
              {tournamentState.participatingTeams &&
                tournamentState.participatingTeams.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4 tracking-wider">
                      FINAL RANKINGS
                    </h4>
                    <div className="grid gap-2">
                      {sortTeamsByRank(tournamentState.participatingTeams).map(
                        (team, index) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xl text-gray-600">
                                #{team.rank}
                              </span>
                              <span className="font-medium text-lg">
                                {team.player1.name} & {team.player2.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {team.rank === 1
                                ? "🥇"
                                : team.rank === 2
                                ? "🥈"
                                : team.rank === 3
                                ? "🥉"
                                : ""}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SKGamePage;
