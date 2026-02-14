import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Eon5CharTool } from "../../../src/components/Eon5CharTool"
import { resetEon5State } from "../../../src/eon5-store"

function resetState() {
  if (typeof window.localStorage?.removeItem === "function") {
    window.localStorage.removeItem("eon5CharTool")
  }
  resetEon5State()
}

describe("Eon5 accessibility semantics", () => {
  beforeEach(() => {
    resetState()
  })

  afterEach(() => {
    cleanup()
    resetState()
  })

  it("renders key step-1 fields with id and name", () => {
    render(<Eon5CharTool />)

    const extraPointsInput = screen.getByLabelText(/Extra attributpoäng/i)
    expect(extraPointsInput.getAttribute("id")).toBeTruthy()
    expect(extraPointsInput.getAttribute("name")).toBeTruthy()

    const freePointsRadio = screen.getByLabelText(/Fria poäng/i)
    expect(freePointsRadio.getAttribute("id")).toBeTruthy()
    expect(freePointsRadio.getAttribute("name")).toBe("distributionModel")

    const movementCell = screen.getAllByText("Förflyttning")[0]
    const movementRow = movementCell.closest("tr")
    expect(movementRow).not.toBeNull()

    const spinButtons = within(movementRow as HTMLElement).getAllByRole("spinbutton")
    for (const spinButton of spinButtons) {
      expect(spinButton.getAttribute("id")).toBeTruthy()
      expect(spinButton.getAttribute("name")).toBeTruthy()
    }
  })
})
