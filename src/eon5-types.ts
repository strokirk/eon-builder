import type {
  AttributeName,
  DesensitizationCategory,
  DistributionModel,
  DynamicSkillType,
  SkillGroupName,
  SkillStatus,
  UnitType,
} from "./eon5-data"

// Attribute state for a single attribute
export interface Eon5Attribute {
  base: number // Folk base value (typically 4-15)
  modifiers: number // Sum of modifiers from environment + event tables
  assignedChunk: number | null // The chunk assigned from the distribution model
}

// A single skill entry
export interface Eon5Skill {
  name: string
  group: SkillGroupName
  baseValue: number // 0 or 1
  spentUnits: number
  status: SkillStatus
  dynamicType?: DynamicSkillType // E, F, H, K for dynamic skills
  isOmstöpt?: boolean // Special Förnimma handling
}

// A unit allocation (specific skill, group, or free)
export interface SpecificUnitAllocation {
  skill: string
  units: number
}

export interface GroupUnitAllocation {
  group: UnitType
  units: number
}

// Desensitization state
export type DesensitizationState = Record<DesensitizationCategory, number>

// Language entry
export interface LanguageEntry {
  name: string
  type: "tal" | "skrift" // spoken or written
}

// Mystery entry
export interface MysteryEntry {
  name: string
}

// Complete Eon 5 character tool state
export interface Eon5CharState {
  // Step 1: Attributes
  attributes: Record<AttributeName, Eon5Attribute>
  distributionModel: DistributionModel | null
  extraAttributePoints: number // Modifies total pool (default 0)
  grundrustningMod: number // Direct modifier to Grundrustning
  grundskadaMod: number // Direct modifier to Grundskada

  // Step 2: Skills
  skills: Eon5Skill[]
  dynamicSkills: Eon5Skill[] // Aspect skills, weapon skills, expertises, etc.

  // Step 3: Unit pools
  specificUnits: SpecificUnitAllocation[]
  groupUnits: GroupUnitAllocation[]
  freeUnits: number

  // Wisdom-derived
  incompetentSkills: string[] // Names of knowledge skills marked incompetent
  baseValueSkills: string[] // Names of knowledge skills with base value 1

  // Desensitization, languages, mysteries
  desensitization: DesensitizationState
  languages: LanguageEntry[]
  mysteries: MysteryEntry[]

  // UI state
  currentStep: number
}

// Action types for the reducer
export type Eon5Action =
  | { type: "SET_DISTRIBUTION_MODEL"; model: DistributionModel }
  | {
      type: "SET_ATTRIBUTE_BASE"
      attribute: AttributeName
      value: number
    }
  | {
      type: "SET_ATTRIBUTE_MODIFIERS"
      attribute: AttributeName
      value: number
    }
  | {
      type: "ASSIGN_CHUNK"
      attribute: AttributeName
      chunkIndex: number
    }
  | { type: "UNASSIGN_CHUNK"; chunkIndex: number }
  | {
      type: "SET_ATTRIBUTE_CHUNK"
      attribute: AttributeName
      value: number
    }
  | { type: "SET_EXTRA_ATTRIBUTE_POINTS"; value: number }
  | { type: "SET_GRUNDRUSTNING_MOD"; value: number }
  | { type: "SET_GRUNDSKADA_MOD"; value: number }
  | { type: "SET_SKILL_UNITS"; skillName: string; units: number }
  | { type: "SET_SKILL_STATUS"; skillName: string; status: SkillStatus }
  | { type: "SET_SKILL_BASE_VALUE"; skillName: string; value: number }
  | {
      type: "ADD_DYNAMIC_SKILL"
      skill: Eon5Skill
    }
  | { type: "REMOVE_DYNAMIC_SKILL"; skillName: string }
  | {
      type: "SET_SPECIFIC_UNITS"
      allocations: SpecificUnitAllocation[]
    }
  | {
      type: "SET_GROUP_UNITS"
      allocations: GroupUnitAllocation[]
    }
  | { type: "SET_FREE_UNITS"; units: number }
  | { type: "TOGGLE_INCOMPETENT_SKILL"; skillName: string }
  | { type: "TOGGLE_BASE_VALUE_SKILL"; skillName: string }
  | {
      type: "SET_DESENSITIZATION"
      category: DesensitizationCategory
      value: number
    }
  | { type: "ADD_LANGUAGE"; language: LanguageEntry }
  | { type: "REMOVE_LANGUAGE"; index: number }
  | { type: "ADD_MYSTERY"; mystery: MysteryEntry }
  | { type: "REMOVE_MYSTERY"; index: number }
  | { type: "SET_STEP"; step: number }
  | { type: "LOAD_STATE"; state: Eon5CharState }

// Validation error
export interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning"
}