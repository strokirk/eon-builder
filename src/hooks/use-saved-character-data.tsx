import { useState } from "react"
import useDebounce from "react-use/lib/useDebounce"
import useLocalStorage from "react-use/lib/useLocalStorage"

import { Char } from "../types"

const STORAGE_KEY = "eonChar"
const SAVE_DEBOUNCE = 1000

export function useSavedCharacterData() {
  const [storedValue, setLocalStorageValue, removeLocalStorageValue] = useLocalStorage(
    STORAGE_KEY,
    DefaultCharacterStore,
  )

  const [char, _setChar] = useState(storedValue || {})

  function clearChar() {
    removeLocalStorageValue()
    _setChar(DefaultCharacterStore)
  }

  function setChar(newChar: Char) {
    _setChar((c) => ({ ...c, ...newChar }))
  }

  useDebounce(
    () => {
      console.debug("Saving...")
      setLocalStorageValue(char)
    },
    SAVE_DEBOUNCE,
    [char],
  )

  return { char, clearChar, setChar }
}

export const DefaultCharacterStore: Char = {
  Avtrubbning: {
    Utsatthet: 0,
    Våld: 0,
    Övernaturligt: 0,
  },
  Färdigheter: [
    { name: "Slagsmål", value: 0 },
    { name: "Undvika", value: 0 },
  ],
}