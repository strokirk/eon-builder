import { useState } from "react"

import EonChar from "./components/EonChar"
import { Eon5CharTool } from "./components/Eon5CharTool"

export function App() {
  const [activeTab, setActiveTab] = useState<"eon4" | "eon5">("eon5")

  return (
    <div className="app-shell">
      <div className="tab-strip" role="tablist" aria-label="Version">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "eon5"}
          className={`tab-button ${activeTab === "eon5" ? "is-active" : ""}`}
          onClick={() => setActiveTab("eon5")}
        >
          Eon 5 — Attribut & Färdigheter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "eon4"}
          className={`tab-button ${activeTab === "eon4" ? "is-active" : ""}`}
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