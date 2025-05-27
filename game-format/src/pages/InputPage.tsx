import { useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function InputPage() {
  const location = useLocation();
  const selectedFormat = location.state?.selectedFormat;
  const [playerFormat, setPlayerFormat] = useState<"single" | "double" | null>(
    null
  );
  // create an array to record players as a "useState"
  const [players, setPlayers] = useState(Array(14).fill(""));

  // reads the input and add to the array
  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  return (
    <div className="min-h-screen px-8 py-6 font-sans bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <h1 className="text-xl font-black tracking-wider">
            {selectedFormat}
          </h1>
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
          <button className="ml-auto bg-black text-white px-6 py-2 rounded-md tracking-wide text-sm font-bold">
            ENTER GAME &rsaquo;
          </button>
        </div>
      </section>

      {/* Players */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-widest">
            PLAYERS ({players.length})
          </h2>
          <button className="border border-black px-3 py-1 rounded-full text-sm">
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player, index) => (
            <div key={index}>
              <label className="block text-sm mb-1">Player {index + 1}</label>
              <input
                type="text"
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full border border-black rounded-md px-3 py-2"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
