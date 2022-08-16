import { useContext } from "react"

import { GlobalData } from "../contexts"
import { Effect } from "../types"

export function useCharEffectsSelector(): Effect[] {
  const [char] = useContext(GlobalData)
  const lists = [
    //
    char.Bakgrund,
    char.archetype,
    char.environment,
    char.tribe,
  ]
  return lists.flatMap((x) => x?.effects || [])
}
