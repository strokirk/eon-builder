import { createContext, useContext } from "react"

import type { Eon5Action, Eon5CharState } from "./eon5-types"
import { createInitialState } from "./eon5-utils"

type Eon5Dispatch = (action: Eon5Action) => void

export const Eon5StateContext = createContext<Eon5CharState>(createInitialState())

export const Eon5DispatchContext = createContext<Eon5Dispatch>(() => {})

export function useEon5State(): Eon5CharState {
  return useContext(Eon5StateContext)
}

export function useEon5Dispatch(): Eon5Dispatch {
  return useContext(Eon5DispatchContext)
}