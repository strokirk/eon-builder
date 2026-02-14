import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TogglableSection } from "../../../src/components/TogglableSection"

describe("TogglableSection", () => {
  it("toggles aria-expanded and content visibility", () => {
    render(
      <TogglableSection id="test-section" name="Sektion" isCollapsed={true}>
        <div>Innehåll</div>
      </TogglableSection>,
    )

    const toggle = screen.getByRole("button", { name: /Sektion/i })
    const content = screen.getByText("Innehåll").parentElement

    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(content?.className).toContain("is-collapsed")

    fireEvent.click(toggle)

    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(content?.className).not.toContain("is-collapsed")
  })
})
