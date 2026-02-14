import { act, cleanup, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  addDynamicSkill,
  setFreeUnits,
  setGroupUnits,
  setSkillUnits,
  setSpecificUnits,
} from "../../../src/eon5-store"
import {
  applyWisdomNineteenBuild,
  renderEon5Sections,
  resetEon5StorageAndState,
} from "../helpers/eon5-char-tool"

describe("Eon5 cross-component flows", () => {
  beforeEach(() => {
    resetEon5StorageAndState()
  })

  afterEach(() => {
    cleanup()
  })

  it("propagates Visdom updates from Attribut to Visdom-panel and Fardigheter", () => {
    const { attributesSection, wisdomSection, skillsSection } = renderEon5Sections()
    applyWisdomNineteenBuild(attributesSection)

    expect(within(wisdomSection).getByText(/Visdom-panel \(Visdom: 19\)/)).not.toBeNull()
    expect(
      within(wisdomSection).getByText((_, el) => el?.textContent === "Extra kunskapsenheter: 1"),
    ).not.toBeNull()
    expect(
      within(wisdomSection).getByText((_, el) => el?.textContent === "Expertisbonus: 6"),
    ).not.toBeNull()

    expect(
      within(skillsSection).getByText(
        (_, el) => el?.textContent === "Visdom bonus kunskapsenheter: 0 / 1",
      ),
    ).not.toBeNull()
    expect(
      within(skillsSection).getByText((_, el) => el?.textContent === "Visdom expertisbonus: 0 / 6"),
    ).not.toBeNull()
    const budgetBlock = within(skillsSection).getByText(/Enhetsbudget:/).closest("div")
    expect(budgetBlock).not.toBeNull()
    expect((budgetBlock as HTMLElement).textContent || "").toContain("0 / 7 spenderade")
  })

  it("applies base value 1 to all knowledge skills when Visdom grants Samtliga", () => {
    const { attributesSection, wisdomSection, skillsSection } = renderEon5Sections()
    applyWisdomNineteenBuild(attributesSection)

    expect(
      within(wisdomSection).getByText("Samtliga kunskapsfärdigheter har Grundvärde 1."),
    ).not.toBeNull()

    const filosofiRow = within(skillsSection).getByText("Filosofi").closest("tr")
    const historiaRow = within(skillsSection).getByText("Historia").closest("tr")
    expect(filosofiRow).not.toBeNull()
    expect(historiaRow).not.toBeNull()

    expect((filosofiRow as HTMLElement).querySelectorAll("td")[1]?.textContent).toBe("1")
    expect((historiaRow as HTMLElement).querySelectorAll("td")[1]?.textContent).toBe("1")
  })

  it("allows mixed pool spending across skills and blocks spending beyond total available units", () => {
    const { attributesSection, skillsSection } = renderEon5Sections()
    applyWisdomNineteenBuild(attributesSection)

    act(() => {
      setFreeUnits(3)
      setGroupUnits([
        { group: "Kunskapsenheter", units: 1 },
        { group: "Mystikenheter", units: 1 },
      ])
      setSpecificUnits([{ skill: "Filosofi", units: 1 }])
      addDynamicSkill({
        name: "Expertis: Alkemi",
        group: "Övriga färdigheter",
        baseValue: 0,
        spentUnits: 0,
        status: null,
        dynamicType: "E",
      })
    })

    act(() => {
      setSkillUnits("Filosofi", 3)
      setSkillUnits("Ceremoni", 2)
      setSkillUnits("Dansa", 1)
      setSkillUnits("Expertis: Alkemi", 6)
    })

    const budgetBlock = within(skillsSection).getByText(/Enhetsbudget:/).closest("div")
    expect(budgetBlock).not.toBeNull()
    expect((budgetBlock as HTMLElement).textContent || "").toContain("12 / 13 spenderade")
    expect((budgetBlock as HTMLElement).textContent || "").toContain("(1 kvar att spendera)")

    const filosofiRow = within(skillsSection).getByText("Filosofi").closest("tr")
    const ceremoniRow = within(skillsSection).getByText("Ceremoni").closest("tr")
    const dansaRow = within(skillsSection).getByText("Dansa").closest("tr")
    const expertisRow = within(skillsSection).getByText("Expertis: Alkemi").closest("tr")
    expect(filosofiRow).not.toBeNull()
    expect(ceremoniRow).not.toBeNull()
    expect(dansaRow).not.toBeNull()
    expect(expertisRow).not.toBeNull()

    expect((filosofiRow as HTMLElement).querySelectorAll("td")[2]?.textContent).toContain("3")
    expect((ceremoniRow as HTMLElement).querySelectorAll("td")[2]?.textContent).toContain("2")
    expect((dansaRow as HTMLElement).querySelectorAll("td")[2]?.textContent).toContain("1")
    expect((expertisRow as HTMLElement).querySelectorAll("td")[2]?.textContent).toContain("6")

    act(() => {
      setSkillUnits("Dansa", 3)
    })

    expect((dansaRow as HTMLElement).querySelectorAll("td")[2]?.textContent).toContain("2")
    expect((budgetBlock as HTMLElement).textContent || "").toContain("13 / 13 spenderade")
  })
})
