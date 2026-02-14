import { describe, expect, it } from "vitest"

import {
  addDice,
  arrayOf,
  dieFormat,
  getID,
  joinArray,
  parseDie,
  sumDice,
} from "../../src/utils"

describe("utils", () => {
  it("adds and normalizes dice modifiers", () => {
    expect(addDice({ dice: 1, mod: 3 }, { dice: 0, mod: 1 })).toEqual({ dice: 2, mod: 0 })
    expect(addDice({ dice: 3, mod: -2 }, { dice: 0, mod: -2 })).toEqual({ dice: 2, mod: -1 })
  })

  it("sums multiple dice entries", () => {
    expect(sumDice([{ dice: 1, mod: 2 }, { dice: 2, mod: 2 }])).toEqual({ dice: 4, mod: 0 })
  })

  it("formats and parses dice strings", () => {
    expect(dieFormat({ dice: 2, mod: 0 })).toBe("2T6")
    expect(dieFormat({ dice: 2, mod: 1 })).toBe("2T6+1")
    expect(parseDie("3T6+2")).toEqual({ dice: 3, mod: 2 })
    expect(parseDie("bad")).toEqual({ dice: 0, mod: 0 })
  })

  it("joins arrays with separators", () => {
    expect(joinArray(["A"])).toEqual(["A"])
    expect(joinArray(["A", "B", "C"])).toEqual(["A", ", ", "B", " & ", "C"])
  })

  it("builds sized arrays and ids", () => {
    expect(arrayOf(3)).toHaveLength(3)
    const id = getID()
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })
})
