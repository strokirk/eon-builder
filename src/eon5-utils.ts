import {
  ATTRIBUTES,
  ATTRIBUTE_TO_DICE,
  DEFAULT_ATTRIBUTE_POINTS,
  DERIVED_VALUES,
  DISTRIBUTION_MODELS,
  KNOWLEDGE_SKILLS,
  MAX_SKILL_VALUE,
  MIN_FINAL_ATTRIBUTE_VALUE,
  SKILL_STATUS_INFO,
  SKILL_UNITS_TO_DICE,
  TOTAL_KNOWLEDGE_SKILLS,
  WISDOM_TABLE,
  type AttributeName,
  type DistributionModel,
  type SkillStatus,
  type WisdomEntry,
} from "./eon5-data"
import type { Eon5Attribute, Eon5CharState, ValidationError } from "./eon5-types"

// --- Attribute calculations ---

export function getPreSpend(attr: Eon5Attribute): number {
  return attr.base + attr.modifiers
}

export function getFinalAttributeValue(attr: Eon5Attribute): number {
  return getPreSpend(attr) + (attr.assignedChunk ?? 0)
}

// Convert an attribute value to dice notation (all attributes except Visdom)
export function attributeToDice(value: number): string {
  if (value < 4) return `<4`
  if (ATTRIBUTE_TO_DICE[value]) return ATTRIBUTE_TO_DICE[value]
  // Extend pattern for values > 24
  const numDice = Math.floor((value - 4) / 4) + 1
  const bonus = (value - 4) % 4
  return bonus > 0 ? `${numDice}T6+${bonus}` : `${numDice}T6`
}

// Compute { numDice, bonus } for arbitrary attribute values
export function attributeToDiceComponents(value: number): {
  numDice: number
  bonus: number
} {
  if (value < 4) return { numDice: 0, bonus: 0 }
  const numDice = Math.floor((value - 4) / 4) + 1
  const bonus = (value - 4) % 4
  return { numDice, bonus }
}

// --- Derived values from Kroppsbyggnad ---

export function getGrundrustning(kb: number): number {
  if (kb <= 8) return 0
  return Math.floor((kb - 7) / 2)
}

export function getGrundskada(kb: number): string {
  if (DERIVED_VALUES[kb]) return DERIVED_VALUES[kb][1]
  // Extend pattern for values > 24
  // Pattern follows similar dice progression offset from attributeToDice
  const numDice = Math.floor((kb - 4) / 4) + 1
  const bonusPattern = [2, 2, 3, 3]
  const bonus = bonusPattern[(kb - 4) % 4]
  return bonus > 0 ? `${numDice}T6+${bonus}` : `${numDice}T6`
}

export function getGrundrustningFromTable(kb: number): number {
  if (DERIVED_VALUES[kb]) return DERIVED_VALUES[kb][0]
  return getGrundrustning(kb)
}

// --- Wisdom lookup ---

export function getWisdomEntry(wisdomValue: number): WisdomEntry {
  if (WISDOM_TABLE[wisdomValue]) return WISDOM_TABLE[wisdomValue]
  // Extend pattern for values > 24
  if (wisdomValue > 24) {
    const stepsAbove24 = wisdomValue - 24
    return {
      incompetentCount: 0,
      baseValueCount: TOTAL_KNOWLEDGE_SKILLS,
      extraUnits: 5 + stepsAbove24,
      expertiseBonus: 16 + stepsAbove24 * 2,
      newKnowledgeCost: 2,
    }
  }
  // For values < 4, use the value 4 entry
  return WISDOM_TABLE[4]
}

// --- Skill dice conversion ---

export function skillValueToDice(value: number): string {
  if (value < 0) return "-"
  if (SKILL_UNITS_TO_DICE[value] !== undefined)
    return SKILL_UNITS_TO_DICE[value]
  if (value > MAX_SKILL_VALUE) return SKILL_UNITS_TO_DICE[MAX_SKILL_VALUE]
  return "-"
}

export function getMaxSkillValue(status: SkillStatus): number {
  if (status === null) return MAX_SKILL_VALUE
  return SKILL_STATUS_INFO[status].maxValue
}

// --- Distribution model helpers ---

export function getChunks(model: DistributionModel): number[] {
  return [...DISTRIBUTION_MODELS[model]]
}

export function getTotalAttributePoints(extraPoints: number): number {
  return DEFAULT_ATTRIBUTE_POINTS + extraPoints
}

// Get chunk assignments as a map of chunkIndex -> attributeName
export function getChunkAssignments(
  state: Eon5CharState,
): Map<number, AttributeName> {
  const assignments = new Map<number, AttributeName>()
  for (const attrName of ATTRIBUTES) {
    const attr = state.attributes[attrName]
    if (attr.assignedChunk !== null && state.distributionModel) {
      const chunks = getChunks(state.distributionModel)
      const chunkIdx = chunks.indexOf(attr.assignedChunk)
      if (chunkIdx !== -1) {
        assignments.set(chunkIdx, attrName)
      }
    }
  }
  return assignments
}

// --- Overflow calculation ---

export function calculateOverflow(
  skillValue: number,
  maxValue: number,
): number {
  if (skillValue > maxValue) {
    return skillValue - maxValue
  }
  return 0
}

// --- Validation ---

export function validateAttributes(state: Eon5CharState): ValidationError[] {
  const errors: ValidationError[] = []

  if (!state.distributionModel) {
    errors.push({
      field: "distributionModel",
      message: "Välj en fördelningsmodell (Balanserad eller Fokuserad)",
      severity: "error",
    })
    return errors
  }

  const chunks = getChunks(state.distributionModel)
  const assignedCount = ATTRIBUTES.filter(
    (a) => state.attributes[a].assignedChunk !== null,
  ).length

  if (assignedCount < ATTRIBUTES.length) {
    errors.push({
      field: "chunks",
      message: `${ATTRIBUTES.length - assignedCount} klumpsumma(or) ej tilldelade`,
      severity: "error",
    })
  }

  // Check for duplicate chunk usage
  const usedChunkIndices = new Set<number>()
  for (const attrName of ATTRIBUTES) {
    const chunk = state.attributes[attrName].assignedChunk
    if (chunk !== null) {
      // Find the actual index accounting for duplicates
      let foundIdx = -1
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i] === chunk && !usedChunkIndices.has(i)) {
          foundIdx = i
          break
        }
      }
      if (foundIdx !== -1) {
        usedChunkIndices.add(foundIdx)
      }
    }
  }

  // Check minimum final values
  for (const attrName of ATTRIBUTES) {
    const finalVal = getFinalAttributeValue(state.attributes[attrName])
    if (
      state.attributes[attrName].assignedChunk !== null &&
      finalVal < MIN_FINAL_ATTRIBUTE_VALUE
    ) {
      errors.push({
        field: attrName,
        message: `${attrName} slutvärde (${finalVal}) är under minimum (${MIN_FINAL_ATTRIBUTE_VALUE})`,
        severity: "error",
      })
    }
  }

  return errors
}

export function validateSkills(state: Eon5CharState): ValidationError[] {
  const errors: ValidationError[] = []
  const allSkills = [...state.skills, ...state.dynamicSkills]

  for (const skill of allSkills) {
    const totalValue = skill.baseValue + skill.spentUnits

    // Check max value
    if (totalValue > MAX_SKILL_VALUE) {
      errors.push({
        field: skill.name,
        message: `${skill.name} värde (${totalValue}) överstiger max (${MAX_SKILL_VALUE})`,
        severity: "error",
      })
    }

    // Check incompetent max
    if (skill.status === "I" && totalValue > 1) {
      errors.push({
        field: skill.name,
        message: `${skill.name} är Inkompetent och kan inte ha värde över 1 (har ${totalValue})`,
        severity: "error",
      })
    }

    // Check blocked no spend
    if (skill.status === "B" && skill.spentUnits > 0) {
      errors.push({
        field: skill.name,
        message: `${skill.name} är Blockerad — inga enheter kan spenderas`,
        severity: "error",
      })
    }
  }

  // Check wisdom incompetent count
  const wisdomAttr = state.attributes["Visdom"]
  if (wisdomAttr) {
    const wisdomFinal = getFinalAttributeValue(wisdomAttr)
    const wisdomEntry = getWisdomEntry(wisdomFinal)

    if (wisdomEntry.incompetentCount > 0) {
      const actualIncompetent = state.incompetentSkills.length
      if (actualIncompetent !== wisdomEntry.incompetentCount) {
        errors.push({
          field: "incompetentSkills",
          message: `Visdom ${wisdomFinal} kräver ${wisdomEntry.incompetentCount} Inkompetenta kunskapsfärdigheter (${actualIncompetent} markerade)`,
          severity: "error",
        })
      }
    }

    if (wisdomEntry.baseValueCount > 0) {
      const actualBaseValue = state.baseValueSkills.length
      const requiredCount = Math.min(
        wisdomEntry.baseValueCount,
        TOTAL_KNOWLEDGE_SKILLS,
      )
      if (
        wisdomEntry.baseValueCount < TOTAL_KNOWLEDGE_SKILLS &&
        actualBaseValue !== requiredCount
      ) {
        errors.push({
          field: "baseValueSkills",
          message: `Visdom ${wisdomFinal} ger ${requiredCount} kunskapsfärdigheter Grundvärde 1 (${actualBaseValue} markerade)`,
          severity: "error",
        })
      }
    }
  }

  // Warn about unspent units
  const totalUnitsAvailable = computeTotalUnitsAvailable(state)
  const totalUnitsSpent = computeTotalUnitsSpent(state)
  if (totalUnitsAvailable > totalUnitsSpent) {
    errors.push({
      field: "units",
      message: `${totalUnitsAvailable - totalUnitsSpent} enheter kvar att spendera`,
      severity: "warning",
    })
  }

  return errors
}

// --- Unit computation helpers ---

export function computeTotalUnitsAvailable(state: Eon5CharState): number {
  let total = state.freeUnits
  for (const alloc of state.specificUnits) {
    total += alloc.units
  }
  for (const alloc of state.groupUnits) {
    total += alloc.units
  }
  // Add wisdom extra units
  const wisdomAttr = state.attributes["Visdom"]
  if (wisdomAttr && wisdomAttr.assignedChunk !== null) {
    const wisdomEntry = getWisdomEntry(getFinalAttributeValue(wisdomAttr))
    total += wisdomEntry.extraUnits
    total += wisdomEntry.expertiseBonus
  }
  return total
}

export function computeTotalUnitsSpent(state: Eon5CharState): number {
  let total = 0
  const allSkills = [...state.skills, ...state.dynamicSkills]
  for (const skill of allSkills) {
    total += skill.spentUnits
  }
  // Add desensitization
  for (const cat of Object.values(state.desensitization)) {
    total += cat
  }
  // Add languages and mysteries
  total += state.languages.length
  total += state.mysteries.length
  return total
}

// --- Unit type to skill group mapping ---

export function getSkillGroupForUnitType(
  unitType: string,
): string | undefined {
  const mapping: Record<string, string> = {
    Kunskapsenheter: "Kunskapsfärdigheter",
    Mystikenheter: "Mystikfärdigheter",
    Rörelseenheter: "Rörelsefärdigheter",
    "Sociala enheter": "Sociala färdigheter",
    Stridsenheter: "Stridsfärdigheter",
    Vildmarksenheter: "Vildmarksfärdigheter",
  }
  return mapping[unitType]
}

// --- Initial state factory ---

export function createInitialState(): Eon5CharState {
  const attributes = {} as Record<AttributeName, Eon5Attribute>
  for (const attr of ATTRIBUTES) {
    attributes[attr] = { base: 0, modifiers: 0, assignedChunk: null }
  }

  const skills = createDefaultSkills()

  return {
    attributes,
    distributionModel: null,
    extraAttributePoints: 0,
    grundrustningMod: 0,
    grundskadaMod: 0,
    skills,
    dynamicSkills: [],
    specificUnits: [],
    groupUnits: [],
    freeUnits: 0,
    incompetentSkills: [],
    baseValueSkills: [],
    desensitization: { Utsatthet: 0, Våld: 0, Övernaturligt: 0 },
    languages: [],
    mysteries: [],
    currentStep: 0,
  }
}

function createDefaultSkills() {
  const skills = [] as Eon5CharState["skills"]

  const addGroup = (
    group: Parameters<typeof skills.push>[0]["group"],
    names: readonly string[],
  ) => {
    for (const name of names) {
      skills.push({
        name,
        group,
        baseValue: 0,
        spentUnits: 0,
        status: null,
      })
    }
  }

  addGroup("Kunskapsfärdigheter", KNOWLEDGE_SKILLS)
  addGroup("Mystikfärdigheter", ["Ceremoni", "Förnimma", "Förvränga"])
  addGroup("Rörelsefärdigheter", [
    "Dansa",
    "Fingerfärdighet",
    "Gömma",
    "Hoppa",
    "Klättra",
    "Marsch",
    "Simma",
    "Smyga",
    "Undvika",
  ])
  addGroup("Sociala färdigheter", [
    "Argumentera",
    "Berättarkonst",
    "Charm",
    "Dupera",
    "Genomskåda",
    "Handel",
    "Hovliv",
    "Injaga fruktan",
    "Ledarskap",
    "Skumraskaffärer",
    "Spel & dobbel",
    "Sång & musik",
  ])
  addGroup("Stridsfärdigheter", ["Slagsmål"])
  addGroup("Vildmarksfärdigheter", [
    "Genomsöka",
    "Jakt & fiske",
    "Naturlära",
    "Orientering",
    "Rida",
    "Sjömannaskap",
    "Speja",
    "Spåra",
    "Vildmarksvana",
  ])

  return skills
}
