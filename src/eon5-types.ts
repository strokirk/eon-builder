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
}
// Validation error
export interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning"
}