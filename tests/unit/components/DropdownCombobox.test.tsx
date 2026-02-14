import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DropdownCombobox } from "../../../src/components/DropdownCombobox"

describe("DropdownCombobox", () => {
  it("opens and filters items", () => {
    render(
      <DropdownCombobox
        items={["Apple", "Banana", "Blueberry"]}
        placeholder="Pick fruit"
      />,
    )

    const input = screen.getByPlaceholderText("Pick fruit")
    fireEvent.focus(input)

    expect(screen.getByText("Apple")).not.toBeNull()
    expect(screen.getByText("Banana")).not.toBeNull()

    fireEvent.change(input, { target: { value: "bl" } })

    expect(screen.queryByText("Apple")).toBeNull()
    expect(screen.queryByText("Banana")).toBeNull()
    expect(screen.getByText("Blueberry")).not.toBeNull()
  })
})
