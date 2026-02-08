import { createContext } from "react"

import { Char } from "./types"

export const GlobalData = createContext<[Char, (c: Char) => void]>([{}, () => {}])