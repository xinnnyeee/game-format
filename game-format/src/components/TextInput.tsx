import { useState } from "react";

interface Props {
  title: string;
}

export default function TextInput({ title }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium">{title}</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="mt-2">You typed: {name}</p>
    </div>
  );
}
