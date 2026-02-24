// Eon 5 — Game Data Constants

export const ATTRIBUTES = [
  "Förflyttning",
  "Intryck",
  "Kroppsbyggnad",
  "Livskraft",
  "Reaktion",
  "Självkontroll",
  "Vaksamhet",
  "Visdom",
] as const

export type AttributeName = (typeof ATTRIBUTES)[number]

export const DISTRIBUTION_MODELS = {
  Balanserad: [10, 6, 6, 6, 4, 4, 2, 2],
  Fokuserad: [10, 10, 8, 8, 4, 0, 0, 0],
  "Fria poäng": [],
} as const

export type DistributionModel = keyof typeof DISTRIBUTION_MODELS

export const DEFAULT_ATTRIBUTE_POINTS = 40

export const MIN_FINAL_ATTRIBUTE_VALUE = 4

export const MAX_CHUNK_VALUE = 10

// Attribute value -> Dice string conversion table
// Pattern: every 4th step +1T6, within a group of 4: +0, +1, +2, +3
export const ATTRIBUTE_TO_DICE: Record<number, string> = {
  4: "1T6",
  5: "1T6+1",
  6: "1T6+2",
  7: "1T6+3",
  8: "2T6",
  9: "2T6+1",
  10: "2T6+2",
  11: "2T6+3",
  12: "3T6",
  13: "3T6+1",
  14: "3T6+2",
  15: "3T6+3",
  16: "4T6",
  17: "4T6+1",
  18: "4T6+2",
  19: "4T6+3",
  20: "5T6",
  21: "5T6+1",
  22: "5T6+2",
  23: "5T6+3",
  24: "6T6",
}

// Derived values from Kroppsbyggnad: [Grundrustning, Grundskada]
export const DERIVED_VALUES: Record<number, [number, string]> = {
  4: [0, "1T6+2"],
  5: [0, "1T6+2"],
  6: [0, "1T6+3"],
  7: [0, "1T6+3"],
  8: [0, "2T6"],
  9: [1, "2T6"],
  10: [1, "2T6+1"],
  11: [2, "2T6+1"],
  12: [2, "2T6+2"],
  13: [3, "2T6+2"],
  14: [3, "2T6+3"],
  15: [4, "2T6+3"],
  16: [4, "3T6"],
  17: [5, "3T6"],
  18: [5, "3T6+1"],
  19: [6, "3T6+1"],
  20: [6, "3T6+2"],
  21: [7, "3T6+2"],
  22: [7, "3T6+3"],
  23: [8, "3T6+3"],
  24: [8, "4T6"],
}

// Wisdom table
export interface WisdomEntry {
  incompetentCount: number // "Samtliga" = 13, "Inga" = 0
  baseValueCount: number // "Samtliga" = 13, "Inga" = 0
  extraUnits: number
  expertiseBonus: number
  newKnowledgeCost: number
}

const we = (
  incompetentCount: number,
  baseValueCount: number,
  extraUnits: number,
  expertiseBonus: number,
  newKnowledgeCost: number,
): WisdomEntry => {
  return {
    incompetentCount,
    baseValueCount,
    extraUnits,
    expertiseBonus,
    newKnowledgeCost,
  }
}
export const WISDOM_TABLE: Record<number, WisdomEntry> = {
  4: we(13, 0, 0, 0, 10),
  5: we(10, 0, 0, 0, 10),
  6: we(9, 0, 0, 0, 8),
  7: we(6, 0, 0, 0, 8),
  8: we(5, 0, 0, 0, 6),
  9: we(3, 1, 0, 0, 6),
  10: we(2, 2, 0, 0, 5),
  11: we(0, 3, 0, 0, 5),
  12: we(0, 4, 0, 0, 4),
  13: we(0, 6, 0, 0, 4),
  14: we(0, 8, 0, 0, 4),
  15: we(0, 9, 2, 0, 4),
  16: we(0, 10, 0, 2, 3),
  17: we(0, 11, 0, 4, 3),
  18: we(0, 13, 0, 4, 3),
  19: we(0, 13, 1, 6, 3),
  20: we(0, 13, 1, 8, 2),
  21: we(0, 13, 2, 10, 2),
  22: we(0, 13, 3, 12, 2),
  23: we(0, 13, 4, 14, 2),
  24: we(0, 13, 5, 16, 2),
}

// Skill groups and their skills
export const KNOWLEDGE_SKILLS = [
  "Filosofi",
  "Geografi",
  "Gifter & droger",
  "Historia",
  "Kalkylera",
  "Krigföring",
  "Kulturkännedom",
  "Lagkunskap",
  "Läkekonst",
  "Ockultism",
  "Teologi",
  "Teoretisk magi",
  "Undervisa",
] as const

// Total knowledge skills count
export const TOTAL_KNOWLEDGE_SKILLS = KNOWLEDGE_SKILLS.length

export const MYSTIC_SKILLS_BASE = ["Ceremoni", "Förnimma", "Förvränga"] as const

export const MOVEMENT_SKILLS = [
  "Dansa",
  "Fingerfärdighet",
  "Gömma",
  "Hoppa",
  "Klättra",
  "Marsch",
  "Simma",
  "Smyga",
  "Undvika",
] as const

export const SOCIAL_SKILLS = [
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
] as const

export const COMBAT_SKILLS_BASE = ["Slagsmål"] as const

export const WILDERNESS_SKILLS = [
  "Genomsöka",
  "Jakt & fiske",
  "Naturlära",
  "Orientering",
  "Rida",
  "Sjömannaskap",
  "Speja",
  "Spåra",
  "Vildmarksvana",
] as const

export type SkillGroupName =
  | "Kunskapsfärdigheter"
  | "Mystikfärdigheter"
  | "Rörelsefärdigheter"
  | "Sociala färdigheter"
  | "Stridsfärdigheter"
  | "Vildmarksfärdigheter"
  | "Övriga färdigheter"

export const SKILL_GROUPS: Record<SkillGroupName, readonly string[]> = {
  Kunskapsfärdigheter: KNOWLEDGE_SKILLS,
  Mystikfärdigheter: MYSTIC_SKILLS_BASE,
  Rörelsefärdigheter: MOVEMENT_SKILLS,
  "Sociala färdigheter": SOCIAL_SKILLS,
  Stridsfärdigheter: COMBAT_SKILLS_BASE,
  Vildmarksfärdigheter: WILDERNESS_SKILLS,
  "Övriga färdigheter": [],
}

// Dynamic skill type codes
export type DynamicSkillType = "E" | "F" | "H" | "K"

export const DYNAMIC_SKILL_TYPES: Record<DynamicSkillType, { name: string; label: string }> = {
  E: { name: "Expertis", label: "Expertis (E)" },
  F: { name: "Förmåga", label: "Förmåga (F)" },
  H: { name: "Hantverk", label: "Hantverk (H)" },
  K: { name: "Kännetecken", label: "Kännetecken (K)" },
}

// Unit spending rules: which unit types can be spent on which targets
export type UnitType =
  | "Kunskapsenheter"
  | "Mystikenheter"
  | "Rörelseenheter"
  | "Sociala enheter"
  | "Stridsenheter"
  | "Vildmarksenheter"
  | "Valfria enheter"

export const UNIT_SPENDING_RULES: Record<UnitType, string[]> = {
  Kunskapsenheter: ["Kunskapsfärdigheter", "Expertiser", "Språk"],
  Mystikenheter: ["Mystikfärdigheter", "Avtrubbning_Övernaturligt", "Mysterier"],
  Rörelseenheter: ["Rörelsefärdigheter", "Hantverk"],
  "Sociala enheter": ["Sociala färdigheter", "Kännetecken", "Avtrubbning_Utsatthet"],
  Stridsenheter: ["Stridsfärdigheter", "Avtrubbning_Våld"],
  Vildmarksenheter: ["Vildmarksfärdigheter", "Hantverk", "Avtrubbning_Utsatthet"],
  "Valfria enheter": [
    "Kunskapsfärdigheter",
    "Mystikfärdigheter",
    "Rörelsefärdigheter",
    "Sociala färdigheter",
    "Stridsfärdigheter",
    "Vildmarksfärdigheter",
    "Expertiser",
    "Hantverk",
    "Kännetecken",
    "Avtrubbning_Utsatthet",
    "Avtrubbning_Våld",
    "Avtrubbning_Övernaturligt",
    "Språk",
    "Mysterier",
    // NOT "Förmågor"
  ],
}

// Skill units to dice conversion
export const SKILL_UNITS_TO_DICE: Record<number, string> = {
  0: "-",
  1: "2T6",
  2: "3T6",
  3: "3T6+2",
  4: "4T6",
  5: "4T6+1",
  6: "4T6+2",
  7: "4T6+3",
  8: "5T6",
}

export const MAX_SKILL_VALUE = 8

// Skill status types
export type SkillStatus = "T" | "I" | "B" | null

export const SKILL_STATUS_INFO = {
  T: {
    name: "Talang",
    effect: "Ger +1T6 bonus vid Fokus-spendering",
    maxValue: MAX_SKILL_VALUE,
  },
  I: {
    name: "Inkompetent",
    effect: "Kan ej höjas över värde 1 (= 2T6)",
    maxValue: 1,
  },
  B: {
    name: "Blockerad",
    effect: "Kan ej höjas, Fokus får ej spenderas, -1 Välmående att använda (max 1/scen)",
    maxValue: 0,
  },
} as const

// Desensitization categories
export const DESENSITIZATION_CATEGORIES = ["Utsatthet", "Våld", "Övernaturligt"] as const

export type DesensitizationCategory = (typeof DESENSITIZATION_CATEGORIES)[number]

export const DESENSITIZATION_BUYABLE_WITH: Record<DesensitizationCategory, UnitType[]> = {
  Utsatthet: ["Sociala enheter", "Vildmarksenheter", "Valfria enheter"],
  Våld: ["Stridsenheter", "Valfria enheter"],
  Övernaturligt: ["Mystikenheter", "Valfria enheter"],
}

export const DESENSITIZATION_THRESHOLDS = [5, 10, 15, 20, 25]