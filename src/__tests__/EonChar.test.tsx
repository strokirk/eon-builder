import { render } from "@testing-library/react"
import React from "react"

import EonChar from "../components/EonChar"

it("EonChar renders", () => {
  const result = render(<EonChar />)

  expect(result.getByText("Eon karaktärsskapare")).toBeDefined()
})
