import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import trashIcon from "../assets/trash.png";
import { useNavigate } from "react-router-dom";
//import {Player} from "../utils/RRDoublesGenerator";

export default function InputPage() {
  const location = useLocation(); // needed to pass states around
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  useEffect(() => {
    const storedFormat = localStorage.getItem("selectedFormat");
    console.log(`${storedFormat}`);
    setSelectedFormat(storedFormat);
  }, []);
  const [playToScore, setPlayToScore] = useState(8);
  const [numOfCourts, setNumOfCourts] = useState(2);
  const [gameDuration, setGameDuration] = useState(); // in minutes
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
    return Array(8).fill("");
  });
  const navigate = useNavigate();

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const handleCourtInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value); // Convert string to number

    if (isNaN(value)) {
      setNumOfCourts(0); // Or handle empty input gracefully
      return;
    }

    if (value > Math.floor(players.length / 2)) {
      console.log(`Number of courts too many for the players`);
      // TODO: make actual warning here instead of using console log
    }

    setNumOfCourts(value);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setHours(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      value === "" ||
      (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 59)
    ) {
      setMinutes(value);
    }
  };

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

  const handleHome = () => {
    navigate("/");
    window.location.reload();
  };

  const enterGame = () => {
    // TODO: add checking - all the input is done

    const stateToPass = { players, playToScore, numOfCourts };
    localStorage.setItem("Players", JSON.stringify(players));
    localStorage.setItem("playToScore", JSON.stringify(playToScore));
    localStorage.setItem("numOfCourts", JSON.stringify(numOfCourts));

    if (selectedFormat == "ROUND ROBIN") {
      navigate("./RRGamePage", { state: stateToPass });
    } else if (selectedFormat == "SINGLE KNOCKOUT") {
      navigate("./SKGamePage", { state: stateToPass });
    } else if (selectedFormat == "OPEN PLAY") {
      navigate("./OPGamePage", { state: stateToPass });
    } else if (selectedFormat == "KING OF THE COURT") {
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
          <img
            onClick={handleHome}
            src={logo}
            alt="Logo"
            className="w-12 h-12"
          />
          <h1 className="text-xl font-black tracking-wider">
            {selectedFormat}{" "}
          </h1>
        </div>
      </header>

      {/* Set Play-to Score (Render except KOTC) */}
      {selectedFormat != "KING OF THE COURT" && (
        <section className="mt-8 mb-8">
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
      )}

      {/*Input Timer, only for KOTC*/}
      {selectedFormat == "KING OF THE COURT" && (
        <section className="mt-8 mb-8">
          <h2 className="text-sm font-bold tracking-widest mb-4">
            SET GAME DURATION
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <input
                type="text"
                value={hours}
                onChange={handleHoursChange}
                placeholder="0"
                className="w-12 h-10 text-l text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <span className="text-l font-bold text-gray-700 mx-2">H :</span>

            <div className="flex flex-col items-center">
              <input
                type="text"
                value={minutes}
                onChange={handleMinutesChange}
                placeholder="00"
                className="w-12 h-10 text-l text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <span className="text-l font-bold text-gray-700 ml-2">M</span>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            {hours || minutes ? (
              <p>
                Duration: {hours || "0"} hour{hours !== "1" ? "s" : ""} and{" "}
                {minutes || "0"} minute{minutes !== "1" ? "s" : ""}
              </p>
            ) : (
              <p>Enter duration for your game session.</p>
            )}
          </div>
        </section>
      )}

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

      {/* No. of Courts used*/}
      <section className="mt-8 mb-8">
        <h2 className="text-sm font-bold tracking-widest">
          NO. OF COURTS USED
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={numOfCourts}
              onChange={handleCourtInput}
              placeholder="2"
              className="w-12 h-10 text-l text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
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
