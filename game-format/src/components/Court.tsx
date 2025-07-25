import React from "react";

// Mock types for demonstration - replace with your actual types

interface CourtProps {
  courtNumber: number;
  playToScore: number;
  name1?: string;
  name2?: string;
  score1: number;
  score2: number;
  onScoreUpdate: (scorePosition: 1 | 2, value: string) => void;
  onCompleteMatch: () => void;
}

const Court: React.FC<CourtProps> = ({
  courtNumber,
  playToScore,
  name1,
  name2,
  score1,
  score2,
  onScoreUpdate,
  onCompleteMatch,
}) => {
  /**
   * Check if a match can be completed
   */
  const canCompleteMatch = () => {
    if (score1 === undefined || score2 === undefined) {
      return false;
    }
    // Must have at least one team reach the playToScore
    return score1 === playToScore || score2 === playToScore;
  };

  const handleScoreChange = (team: 1 | 2, value: string) => {
    // Allow empty string or valid numeric input
    if (value === "" || /^\d*$/.test(value)) {
      onScoreUpdate(team, value);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="bg-black text-white p-4">
        <h3 className="text-xl font-bold tracking-wider">
          COURT {courtNumber}
        </h3>
      </div>

      {name1 && name2 ? (
        <div className="p-6">
          <p className="flex justify-end text-sm text-gray-600 mb-6 tracking-wider">
            SCORE
          </p>
          {[1, 2].map((team) => {
            const party = team === 1 ? name1 : name2;
            const scoreValue = team === 1 ? score1 : score2;

            return (
              <div
                key={team}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-2xl font-semibold tracking-wider">
                  {party ? party : "TBD"}
                </span>
                <input
                  type="text"
                  maxLength={2}
                  inputMode="numeric"
                  pattern="\d*"
                  value={scoreValue}
                  onChange={(e) =>
                    handleScoreChange(team as 1 | 2, e.target.value)
                  }
                  className="w-10 h-6 text-center border-2 border-gray-400 rounded-sm focus:outline-none focus:border-black"
                />
              </div>
            );
          })}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onCompleteMatch}
              disabled={!canCompleteMatch}
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
};

export default Court;
