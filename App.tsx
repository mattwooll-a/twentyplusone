import { useState } from "react";

function calculateHandTotal(cards) {
  let total = 0;
  let aceCount = 0;

  for (let card of cards) {
    let val = card.split(",")[0];
    if (val === "A") {
      aceCount += 1;
    } else if (["K", "Q", "J"].includes(val)) {
      total += 10;
    } else {
      total += parseInt(val, 10);
    }
  }
  // Handle Aces (1 or 11)
  for (let i = 0; i < aceCount; i++) {
    if (total + 10 > 21) {
      total += 1;
    } else {
      total += 10;
    }
  }
  if (total > 21) {
    return { total, bust: true };
  }
  return { total, bust: false };
}

export default function App() {
  const [input, setInput] = useState("A,H 3,C 4,D");
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    const cards = input.split(" ").filter((c) => c.length > 0);
    setResult(calculateHandTotal(cards));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Blackjack Hand Calculator</h1>
      <p className="mb-2 text-gray-700">
        Enter cards (example: <code>A,H 3,C 4,D</code>)
      </p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-lg px-3 py-2 w-64"
        />
        <button
          onClick={handleCheck}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Calculate
        </button>
      </div>
      {result && (
        <div
          className={`text-lg font-semibold ${
            result.bust ? "text-red-600" : "text-green-700"
          }`}
        >
          Total: {result.total} {result.bust && "(Bust!)"}
        </div>
      )}
    </div>
  );
}

