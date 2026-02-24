import React from "react"
import { createRoot } from "react-dom/client"

import { Eon5CharTool } from "./components/Eon5CharTool"
import "./index.css"

const rootElm = document.createElement("div")
rootElm.id = "rootElm"
document.body.appendChild(rootElm)

const root = createRoot(rootElm)
root.render(
  <React.StrictMode>
    <div className="mx-auto px-3 pt-4 pb-8 max-w-7xl">
      <Eon5CharTool />
    </div>
  </React.StrictMode>,
)