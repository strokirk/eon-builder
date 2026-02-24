import { describe, expect, it } from "vitest"

import {
  attributeToDice,
  getGrundrustningFromTable,
  getGrundskada,
  getGrundskadaWithMod,
} from "../../src/eon5-utils"

describe("getGrundskadaWithMod", () => {
  it("returns base string unchanged when mod is 0", () => {
    expect(getGrundskadaWithMod(12, 0)).toBe(getGrundskada(12))
    expect(getGrundskadaWithMod(8, 0)).toBe("2T6")
  })

  it("adds positive mod to bonus", () => {
    expect(getGrundskadaWithMod(12, 1)).toBe("2T6+3") // 2T6+2 → 2T6+3
    expect(getGrundskadaWithMod(10, 2)).toBe("2T6+3") // 2T6+1 → 2T6+3
    expect(getGrundskadaWithMod(8, 1)).toBe("2T6+1") // 2T6 → 2T6+1
  })

  it("subtracts negative mod from bonus", () => {
    expect(getGrundskadaWithMod(12, -1)).toBe("2T6+1") // 2T6+2 → 2T6+1
    expect(getGrundskadaWithMod(12, -2)).toBe("2T6") // 2T6+2 → 2T6
    expect(getGrundskadaWithMod(12, -3)).toBe("2T6-1") // 2T6+2 → 2T6-1
    expect(getGrundskadaWithMod(8, -1)).toBe("2T6-1") // 2T6 → 2T6-1
  })

  it("preserves dice count, only changes bonus", () => {
    expect(getGrundskadaWithMod(16, 2)).toBe("3T6+2") // 3T6 → 3T6+2
    expect(getGrundskadaWithMod(4, 1)).toBe("1T6+3") // 1T6+2 → 1T6+3
  })
})

describe("attributeToDice", () => {
  it("converts values to dice strings", () => {
    expect(attributeToDice(4)).toBe("1T6")
    expect(attributeToDice(8)).toBe("2T6")
    expect(attributeToDice(12)).toBe("3T6")
    expect(attributeToDice(15)).toBe("3T6+3")
  })
})

describe("getGrundrustningFromTable", () => {
  it("returns 0 for low KB", () => {
    expect(getGrundrustningFromTable(4)).toBe(0)
    expect(getGrundrustningFromTable(8)).toBe(0)
  })

  it("increases with KB", () => {
    expect(getGrundrustningFromTable(9)).toBe(1)
    expect(getGrundrustningFromTable(12)).toBe(2)
    expect(getGrundrustningFromTable(16)).toBe(4)
  })
})
