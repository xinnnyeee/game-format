import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import trashIcon from "../assets/trash.png";
import { useNavigate } from "react-router-dom";
//import {Player} from "../utils/RRDoublesGenerator";

export default function RRInputPage() {
  const location = useLocation(); // needed to pass states around
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  useEffect(() => {
    const storedFormat = localStorage.getItem("selectedFormat");
    console.log(`${storedFormat}`);
    setSelectedFormat(storedFormat);
  }, []);
  const [playerFormat, setPlayerFormat] = useState<"single" | "double" | null>(
    null
  );
  const [playToScore, setPlayToScore] = useState(8);
  // create an array to record players as a "useState" - start with 8 players
  const [players, setPlayers] = useState<string[]>(() => {
    // Check if we're returning from game page with previous players
    const previousPlayers = location.state?.previousPlayers;
    if (previousPlayers && Array.isArray(previousPlayers)) {
      return previousPlayers;
    }

    // Otherwise try localStorage
    const stored = localStorage.getItem("Players");
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : parsed.players || [];
    }

    // Default empty array
    return [];
  });
  const navigate = useNavigate();

  // reads the input and add to the array
  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  const selectPlayToScore = (score: number) => {
    setPlayToScore(score);
  };

  // Function to add a new player
  const addPlayer = () => {
    if (players.length < 14) {
      setPlayers([...players, ""]);
    }
  };

  // Function to remove a player
  const removePlayer = (indexToRemove: number) => {
    if (players.length > 8) {
      const updatedPlayers = players.filter(
        (_, index) => index !== indexToRemove
      );
      setPlayers(updatedPlayers);
    }
  };
  const enterGame = () => {
    const stateToPass = { players, playToScore };
    localStorage.setItem("Players", JSON.stringify(players));
    localStorage.setItem("playToScore", JSON.stringify(playToScore));
    if (selectedFormat == "round-robin") {
      navigate("./RRGamePage", { state: stateToPass });
    } else if (selectedFormat == "single-knockout") {
      navigate("./SKGamePage", { state: stateToPass });
    } else if (selectedFormat == "open-play") {
      navigate("./OPGamePage", { state: stateToPass });
    } else if (selectedFormat == "king-of-the-court") {
      navigate("./KOTCGamePage", { state: stateToPass });
    } else {
      console.log(
        `Unable to enter game due to invalid game format: ${selectedFormat}!`
      );
    }
  };

  return (
    <div className="min-h-screen px-8 py-6 font-sans bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <h1 className="text-xl font-black tracking-wider">Round Robin</h1>
        </div>
      </header>

      {/* Player Format */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-widest mb-4">
          PLAYER FORMAT
        </h2>
        <div className="flex items-center space-x-6 mb-8">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="single"
              checked={playerFormat === "single"}
              onChange={() => setPlayerFormat("single")}
              className="accent-black"
            />
            <span className="text-lg">Single</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="double"
              checked={playerFormat === "double"}
              onChange={() => setPlayerFormat("double")}
              className="accent-black"
            />
            <span className="text-lg">Double</span>
          </label>
        </div>
      </section>

      {/* Set Play-to Score */}
      <section className="mb-8">
        <h2 className="text-sm font-bold tracking-widest mb-4">
          SET PLAY-TO SCORE
        </h2>
        <div className="flex flex-wrap gap-3">
          {[8, 11, 15].map((score) => (
            <button
              key={score}
              onClick={() => setPlayToScore(score)}
              className={`border px-3 py-1 rounded-full text-sm transition-colors ${
                playToScore === score
                  ? "border-black bg-black text-white"
                  : "border-black bg-white text-black hover:bg-gray-100"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      </section>

      {/* Players */}
      <section className="flex-grow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-widest">
            PLAYERS ({players.length})
          </h2>
          {players.length < 14 && (
            <button
              onClick={addPlayer}
              className="border border-black px-3 py-1 rounded-full text-sm"
            >
              Add
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player, index) => (
            <div key={index} className="relative">
              <label className="block text-sm mb-1">Player {index + 1}</label>
              <div className="relative">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  className="w-full border border-black rounded-md px-3 py-2 pr-10"
                />
                {players.length > 8 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                  >
                    <img
                      src={trashIcon}
                      alt="Remove player"
                      className="w-5 h-5"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enter Game Button - Fixed at bottom center */}
      <section className="mt-8 flex justify-center">
        <button
          className="bg-black text-white px-8 py-3 rounded-md tracking-wide text-sm font-bold"
          onClick={enterGame}
        >
          ENTER GAME &rsaquo;
        </button>
      </section>
    </div>
  );
}
