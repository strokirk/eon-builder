import React from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import "./index.scss"

const rootElm = document.createElement("div")
rootElm.id = "rootElm"
document.body.appendChild(rootElm)

const root = createRoot(rootElm)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)