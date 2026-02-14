import { useEffect, useRef } from "react"
import { useSignalEffect } from "@preact/signals-react"

import type { Eon5CharState } from "../eon5-types"
import { eon5State, loadEon5State, resetEon5State } from "../eon5-store"
import { createInitialState } from "../eon5-utils"
import { Eon5Attributes } from "./Eon5Attributes"
import { Eon5Skills } from "./Eon5Skills"
import { Eon5Summary } from "./Eon5Summary"
import { Eon5WisdomPanel } from "./Eon5WisdomPanel"
import { TogglableSection } from "./TogglableSection"
import { getTotalAttributePoints, validateAttributes, validateSkills } from "../eon5-utils"
import { ATTRIBUTES } from "../eon5-data"

const STORAGE_KEY = "eon5CharTool"

function getBrowserStorage(): Storage | null {
  const storage = window.localStorage as Partial<Storage> | undefined
  if (!storage) return null
  if (typeof storage.getItem !== "function") return null
  if (typeof storage.setItem !== "function") return null
  if (typeof storage.removeItem !== "function") return null
  return storage as Storage
}

export function Eon5CharTool() {
  const hydrationDoneRef = useRef(false)
  const state = eon5State.value

  useEffect(() => {
    const storage = getBrowserStorage()
    if (!storage) {
      hydrationDoneRef.current = true
      return
    }

    const storedValue = storage.getItem(STORAGE_KEY)
    if (!storedValue) {
      hydrationDoneRef.current = true
      return
    }

    try {
      const parsed = JSON.parse(storedValue) as Eon5CharState
      loadEon5State(parsed)
    } catch {
      storage.removeItem(STORAGE_KEY)
      loadEon5State(createInitialState())
    } finally {
      hydrationDoneRef.current = true
    }
  }, [])

  useSignalEffect(() => {
    if (!hydrationDoneRef.current) return
    const storage = getBrowserStorage()
    if (!storage) return
    storage.setItem(STORAGE_KEY, JSON.stringify(eon5State.value))
  })

  const clearData = () => {
    if (!window.confirm("Vill du rensa all sparad data?")) return
    const storage = getBrowserStorage()
    if (storage) {
      storage.removeItem(STORAGE_KEY)
    }
    resetEon5State()
  }

  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)
  const usedPoints =
    state.distributionModel === "Fria poäng"
      ? ATTRIBUTES.reduce((sum, attr) => sum + (state.attributes[attr].assignedChunk ?? 0), 0)
      : 0
  const remainingPoints = totalPoints - usedPoints
  const totalWarnings = validateAttributes(state).length + validateSkills(state).length

  return (
    <div className="panel space-y-4 max-w-5xl">
      <div className="space-y-3">
        <h1>Eon 5 — Attribut & Färdigheter</h1>
        <div className="status-banner status-banner--info">
          <strong>Snabbstatus:</strong>{" "}
          {state.distributionModel === "Fria poäng"
            ? `Återstående attributpoäng ${remainingPoints} / ${totalPoints}. `
            : "Välj modell och fördela attribut. "}
          {totalWarnings > 0 ? `${totalWarnings} regelvarningar finns.` : "Inga regelvarningar."}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="btn btn--danger" onClick={clearData} type="button">
          Rensa sparad data
        </button>
      </div>

      {/* Step content */}
      <div className="space-y-4">
        <TogglableSection id="eon5-step-1" name="1. Attribut" isCollapsed={false}>
          <Eon5Attributes />
        </TogglableSection>

        <TogglableSection
          id="eon5-step-2"
          name="2. Visdom & Kunskapsfärdigheter"
          isCollapsed={true}
        >
          <Eon5WisdomPanel />
        </TogglableSection>

        <TogglableSection id="eon5-step-3" name="3. Färdigheter & Enheter" isCollapsed={true}>
          <Eon5Skills />
        </TogglableSection>

        <TogglableSection id="eon5-step-4" name="4. Sammanfattning" isCollapsed={true}>
          <Eon5Summary />
        </TogglableSection>
      </div>
    </div>
  )
}