import { updatedDiff } from "deep-object-diff"
import { useState } from "react"
import useDebounce from "react-use/lib/useDebounce"
import useLocalStorage from "react-use/lib/useLocalStorage"
import { DefaultCharacterStore } from "../EonChar"
import { Char } from "../types"

const STORAGE_KEY = "eonChar"
const SAVE_DEBOUNCE = 1000

export function useSavedCharacterData() {
  const [storedValue, setLocalStorageValue, removeLocalStorageValue] =
    useLocalStorage(STORAGE_KEY, DefaultCharacterStore)

  const [char, _setChar] = useState(storedValue)

  function clearChar() {
    removeLocalStorageValue()
    _setChar(DefaultCharacterStore)
  }

  function setChar(newChar: Char) {
    if (!Object.keys(updatedDiff(char || {}, newChar)).length) {
      return
    }
    _setChar((c) => Object.assign(c, newChar))
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
