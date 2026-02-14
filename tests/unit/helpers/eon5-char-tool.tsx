import { fireEvent, render, screen, within } from "@testing-library/react"

import { Eon5CharTool } from "../../../src/components/Eon5CharTool"
import { resetEon5State } from "../../../src/eon5-store"

const ATTRIBUTES_TAB = /1\. Attribut/i
const WISDOM_TAB = /2\. Visdom/i
const SKILLS_TAB = /3\. Fardigheter|3\. Färdigheter/i

export const resetEon5StorageAndState = () => {
  if (typeof window.localStorage?.removeItem === "function") {
    window.localStorage.removeItem("eon5CharTool")
  }
  resetEon5State()
}

export const renderEon5Sections = () => {
  render(<Eon5CharTool />)

  const attributesButton = screen.getByRole("button", { name: ATTRIBUTES_TAB })
  const wisdomButton = screen.getByRole("button", { name: WISDOM_TAB })
  const skillsButton = screen.getByRole("button", { name: SKILLS_TAB })

  fireEvent.click(wisdomButton)
  fireEvent.click(skillsButton)

  const attributesSection = attributesButton.closest("h2")?.nextElementSibling as HTMLElement
  const wisdomSection = wisdomButton.closest("h2")?.nextElementSibling as HTMLElement
  const skillsSection = skillsButton.closest("h2")?.nextElementSibling as HTMLElement

  return {
    attributesSection,
    wisdomSection,
    skillsSection,
  }
}

export const applyWisdomNineteenBuild = (attributesSection: HTMLElement) => {
  fireEvent.click(within(attributesSection).getByRole("radio", { name: /Fria poäng/i }))

  const wisdomRow = within(attributesSection).getByText("Visdom").closest("tr")
  if (!wisdomRow) {
    throw new Error("Could not find Visdom row in attributes table")
  }

  const spinButtons = within(wisdomRow).getAllByRole("spinbutton")
  fireEvent.change(spinButtons[0], { target: { value: "18" } })
  fireEvent.change(spinButtons[2], { target: { value: "1" } })
}
