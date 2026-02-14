import { cleanup, fireEvent, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { renderEon5Sections, resetEon5StorageAndState } from "../helpers/eon5-char-tool"

const FREE_POINTS_RADIO = /Fria poäng/i
const MOVEMENT_ATTR = "Förflyttning"
const BASE_INPUT_INDEX = 0
const CHUNK_INPUT_INDEX = 2
const FINAL_VALUE_CELL_INDEX = 5

function setupFreePointsMovementRow() {
  const { attributesSection } = renderEon5Sections()
  fireEvent.click(within(attributesSection).getByRole("radio", { name: FREE_POINTS_RADIO }))

  const movementRow = within(attributesSection).getByText(MOVEMENT_ATTR).closest("tr")
  expect(movementRow).not.toBeNull()

  const spinButtons = within(movementRow as HTMLElement).getAllByRole("spinbutton")
  return {
    attributesSection,
    movementRow: movementRow as HTMLElement,
    spinButtons: spinButtons as HTMLInputElement[],
  }
}

describe("Eon5 attributes warnings", () => {
  beforeEach(() => {
    resetEon5StorageAndState()
  })

  afterEach(() => {
    cleanup()
    resetEon5StorageAndState()
  })

  it("shows an in-section warning when free-point allocation exceeds the pool", () => {
    const { attributesSection, spinButtons } = setupFreePointsMovementRow()
    fireEvent.change(spinButtons[CHUNK_INPUT_INDEX], { target: { value: "100" } })

    expect(
      within(attributesSection).getByText(/Återstående poäng:\s*-60\s*\/\s*40/, {
        selector: "span",
      }),
    ).not.toBeNull()

    expect(
      within(attributesSection).getByText(/För många poäng använda:\s*100\s*\/\s*40/, {
        selector: "p",
      }),
    ).not.toBeNull()
  })

  it("clamps negative free-point allocation to zero", () => {
    const { attributesSection, movementRow, spinButtons } = setupFreePointsMovementRow()
    fireEvent.change(spinButtons[CHUNK_INPUT_INDEX], { target: { value: "-20" } })

    expect(
      within(attributesSection).getByText(/Återstående poäng:\s*40\s*\/\s*40/, {
        selector: "span",
      }),
    ).not.toBeNull()

    expect(spinButtons[CHUNK_INPUT_INDEX].value).toBe("0")
    expect(movementRow.querySelectorAll("td")[FINAL_VALUE_CELL_INDEX]?.textContent).toContain("8")
  })

  it("shows a warning when a single attribute exceeds 10 free points", () => {
    const { attributesSection, spinButtons } = setupFreePointsMovementRow()
    fireEvent.change(spinButtons[CHUNK_INPUT_INDEX], { target: { value: "11" } })

    expect(
      within(attributesSection).getByText(/Förflyttning: För många fria poäng på attributet: 11 \/ 10/, {
        selector: "p",
      }),
    ).not.toBeNull()
  })

  it("shows a warning when an attribute final value is below 4", () => {
    const { attributesSection, spinButtons } = setupFreePointsMovementRow()
    fireEvent.change(spinButtons[BASE_INPUT_INDEX], { target: { value: "3" } })

    expect(
      within(attributesSection).getByText(
        /Förflyttning: Förflyttning slutvärde \(3\) är under minimum \(4\)/,
        { selector: "p" },
      ),
    ).not.toBeNull()
  })

  it("marks the row invalid when free points exceed 10 on that attribute", () => {
    const { movementRow, spinButtons } = setupFreePointsMovementRow()
    fireEvent.change(spinButtons[CHUNK_INPUT_INDEX], { target: { value: "11" } })

    expect(movementRow.className).toContain("bg-red-50")
    expect(movementRow.querySelectorAll("td")[FINAL_VALUE_CELL_INDEX]?.textContent).toContain("!")
  })
})
