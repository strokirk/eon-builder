import { useReducer } from "react"
import useDebounce from "react-use/lib/useDebounce"
import useLocalStorage from "react-use/lib/useLocalStorage"

import {
  Eon5DispatchContext,
  Eon5StateContext,
} from "../eon5-context"
import { eon5Reducer } from "../eon5-reducer"
import type { Eon5CharState } from "../eon5-types"
import { createInitialState } from "../eon5-utils"
import { Eon5Attributes } from "./Eon5Attributes"
import { Eon5Skills } from "./Eon5Skills"
import { Eon5Summary } from "./Eon5Summary"
import { Eon5WisdomPanel } from "./Eon5WisdomPanel"
import { TogglableSection } from "./TogglableSection"

const STORAGE_KEY = "eon5CharTool"
const SAVE_DEBOUNCE = 1000

const STEPS = [
  { key: "attributes", label: "1. Attribut" },
  { key: "wisdom", label: "2. Visdom" },
  { key: "skills", label: "3. Färdigheter" },
  { key: "summary", label: "4. Sammanfattning" },
]

export function Eon5CharTool() {
  const [storedState, setStoredState, removeStoredState] =
    useLocalStorage<Eon5CharState>(STORAGE_KEY)

  const [state, dispatch] = useReducer(
    eon5Reducer,
    storedState || createInitialState(),
  )

  // Auto-save with debounce
  useDebounce(
    () => {
      setStoredState(state)
    },
    SAVE_DEBOUNCE,
    [state],
  )

  const clearData = () => {
    if (!window.confirm("Vill du rensa all sparad data?")) return
    removeStoredState()
    dispatch({ type: "LOAD_STATE", state: createInitialState() })
  }

  return (
    <Eon5StateContext.Provider value={state}>
      <Eon5DispatchContext.Provider value={dispatch}>
        <div className="p-8 space-y-6 max-w-4xl">
          <h1>Eon 5 — Attribut & Färdigheter</h1>

          <div className="flex gap-2">
            <button
              className="hover:bg-gray-300 py-2 px-4 rounded bg-gray-100 border shadow-sm text-sm"
              onClick={clearData}
              type="button"
            >
              Rensa sparad data
            </button>
          </div>

          {/* Step navigation */}
          <StepNav currentStep={state.currentStep} dispatch={dispatch} />

          {/* Step content */}
          <div className="space-y-6">
            <TogglableSection
              name="1. Attribut"
              isCollapsed={state.currentStep !== 0}
            >
              <Eon5Attributes />
            </TogglableSection>

            <TogglableSection
              name="2. Visdom & Kunskapsfärdigheter"
              isCollapsed={state.currentStep !== 1}
            >
              <Eon5WisdomPanel />
            </TogglableSection>

            <TogglableSection
              name="3. Färdigheter & Enheter"
              isCollapsed={state.currentStep !== 2}
            >
              <Eon5Skills />
            </TogglableSection>

            <TogglableSection
              name="4. Sammanfattning"
              isCollapsed={state.currentStep !== 3}
            >
              <Eon5Summary />
            </TogglableSection>
          </div>
        </div>
      </Eon5DispatchContext.Provider>
    </Eon5StateContext.Provider>
  )
}

function StepNav({
  currentStep,
  dispatch,
}: {
  currentStep: number
  dispatch: (action: any) => void
}) {
  return (
    <div className="flex gap-1">
      {STEPS.map((step, i) => (
        <button
          key={step.key}
          type="button"
          className={`py-2 px-4 rounded-t border border-b-0 text-sm ${
            currentStep === i
              ? "bg-white font-medium border-gray-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
          }`}
          onClick={() => dispatch({ type: "SET_STEP", step: i })}
        >
          {step.label}
        </button>
      ))}
    </div>
  )
}
