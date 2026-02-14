import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  DefaultCharacterStore,
  useSavedCharacterData,
} from "../../../src/hooks/use-saved-character-data"

const useLocalStorageMock = vi.fn()
const useDebounceMock = vi.fn()

vi.mock("react-use/lib/useLocalStorage", () => ({
  default: (...args: unknown[]) => useLocalStorageMock(...args),
}))

vi.mock("react-use/lib/useDebounce", () => ({
  default: (...args: unknown[]) => useDebounceMock(...args),
}))

describe("useSavedCharacterData", () => {
  beforeEach(() => {
    useLocalStorageMock.mockReset()
    useDebounceMock.mockReset()
  })

  it("hydrates from storage and persists updates", () => {
    const setLocalStorageValue = vi.fn()
    const removeLocalStorageValue = vi.fn()

    useLocalStorageMock.mockReturnValue([
      DefaultCharacterStore,
      setLocalStorageValue,
      removeLocalStorageValue,
    ])
    useDebounceMock.mockImplementation((fn: () => void) => fn())

    const { result } = renderHook(() => useSavedCharacterData())

    expect(result.current.char).toEqual(DefaultCharacterStore)
    expect(useLocalStorageMock).toHaveBeenCalledWith("eonChar", DefaultCharacterStore)
    expect(setLocalStorageValue).toHaveBeenCalled()

    act(() => {
      result.current.setChar({ notes: [{ title: "n", contents: "c" }] })
    })

    expect(result.current.char.notes).toEqual([{ title: "n", contents: "c" }])

    act(() => {
      result.current.clearChar()
    })

    expect(removeLocalStorageValue).toHaveBeenCalledTimes(1)
    expect(result.current.char).toEqual(DefaultCharacterStore)
  })
})
