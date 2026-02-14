import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EonChar from "../../../src/components/EonChar"

describe("EonChar", () => {
  it("renders", () => {
    const result = render(<EonChar />)

    expect(result.getByText("Eon karaktärsskapare")).not.toBeNull()
  })
})
