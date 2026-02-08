import { useState } from "react"

import EonChar from "./components/EonChar"
import { Eon5CharTool } from "./components/Eon5CharTool"

export function App() {
  const [activeTab, setActiveTab] = useState<"eon4" | "eon5">("eon5")

  return (
    <div>
      <div className="flex border-b border-gray-300 px-8 pt-4 gap-1">
        <button
          type="button"
          className={`py-2 px-6 rounded-t border border-b-0 text-sm font-medium ${
            activeTab === "eon5"
              ? "bg-white border-gray-300 fg-eon-red"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
          }`}
          onClick={() => setActiveTab("eon5")}
        >
          Eon 5 — Attribut & Färdigheter
        </button>
        <button
          type="button"
          className={`py-2 px-6 rounded-t border border-b-0 text-sm font-medium ${
            activeTab === "eon4"
              ? "bg-white border-gray-300 fg-eon-red"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
          }`}
          onClick={() => setActiveTab("eon4")}
        >
          Eon 4 — Karaktärsskapare
        </button>
      </div>

      {activeTab === "eon5" && <Eon5CharTool />}
      {activeTab === "eon4" && <EonChar />}
    </div>
  )
}
