import { produce } from "immer"
import { ATTRIBUTES, MAX_SKILL_VALUE, SKILL_STATUS_INFO, type AttributeName } from "./eon5-data"
import type { Eon5Action, Eon5CharState } from "./eon5-types"
import { getChunks } from "./eon5-utils"

export function eon5Reducer(state: Eon5CharState, action: Eon5Action): Eon5CharState {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_DISTRIBUTION_MODEL": {
        // Clear all chunk assignments when switching models
        for (const attr of ATTRIBUTES) {
          draft.attributes[attr].assignedChunk = null
        }
        draft.distributionModel = action.model
        break
      }

      case "SET_ATTRIBUTE_BASE": {
        draft.attributes[action.attribute].base = action.value
        break
      }

      case "SET_ATTRIBUTE_MODIFIERS": {
        draft.attributes[action.attribute].modifiers = action.value
        break
      }

      case "ASSIGN_CHUNK": {
        if (!state.distributionModel) return
        const chunks = getChunks(state.distributionModel)
        const chunkValue = chunks[action.chunkIndex]
        if (chunkValue === undefined) return

        // Find which attribute currently has this chunk index
        const usedIndices = getUsedChunkIndices(state)
        const prevAttr = usedIndices.get(action.chunkIndex)
        if (prevAttr) {
          draft.attributes[prevAttr].assignedChunk = null
        }

        // Assign to the target attribute
        draft.attributes[action.attribute].assignedChunk = chunkValue
        break
      }

      case "UNASSIGN_CHUNK": {
        if (!state.distributionModel) return
        const usedIndices = getUsedChunkIndices(state)
        const attrName = usedIndices.get(action.chunkIndex)
        if (!attrName) return

        draft.attributes[attrName].assignedChunk = null
        break
      }

      case "SET_ATTRIBUTE_CHUNK": {
        draft.attributes[action.attribute].assignedChunk = action.value
        break
      }

      case "SET_EXTRA_ATTRIBUTE_POINTS": {
        draft.extraAttributePoints = action.value
        break
      }

      case "SET_GRUNDRUSTNING_MOD": {
        draft.grundrustningMod = action.value
        break
      }

      case "SET_GRUNDSKADA_MOD": {
        draft.grundskadaMod = action.value
        break
      }

      case "SET_SKILL_UNITS": {
        const updateSkillUnits = (skills: typeof draft.skills) => {
          for (const skill of skills) {
            if (skill.name === action.skillName) {
              skill.spentUnits = Math.max(
                0,
                Math.min(action.units, getMaxForSkill(skill.status) - skill.baseValue),
              )
            }
          }
        }
        updateSkillUnits(draft.skills)
        updateSkillUnits(draft.dynamicSkills)
        break
      }

      case "SET_SKILL_STATUS": {
        const updateStatus = (skills: typeof draft.skills) => {
          for (const skill of skills) {
            if (skill.name === action.skillName) {
              skill.status = action.status
            }
          }
        }
        updateStatus(draft.skills)
        updateStatus(draft.dynamicSkills)
        break
      }

      case "SET_SKILL_BASE_VALUE": {
        const updateBase = (skills: typeof draft.skills) => {
          for (const skill of skills) {
            if (skill.name === action.skillName) {
              skill.baseValue = action.value
            }
          }
        }
        updateBase(draft.skills)
        updateBase(draft.dynamicSkills)
        break
      }

      case "ADD_DYNAMIC_SKILL": {
        draft.dynamicSkills.push(action.skill)
        break
      }

      case "REMOVE_DYNAMIC_SKILL": {
        draft.dynamicSkills = draft.dynamicSkills.filter((s) => s.name !== action.skillName)
        break
      }

      case "SET_SPECIFIC_UNITS": {
        draft.specificUnits = action.allocations
        break
      }

      case "SET_GROUP_UNITS": {
        draft.groupUnits = action.allocations
        break
      }

      case "SET_FREE_UNITS": {
        draft.freeUnits = action.units
        break
      }

      case "TOGGLE_INCOMPETENT_SKILL": {
        const isCurrently = state.incompetentSkills.includes(action.skillName)

        if (isCurrently) {
          draft.incompetentSkills = draft.incompetentSkills.filter((s) => s !== action.skillName)
        } else {
          draft.incompetentSkills.push(action.skillName)
        }

        // Also update the skill status
        for (const skill of draft.skills) {
          if (skill.name === action.skillName) {
            skill.status = (isCurrently ? null : "I") as typeof skill.status
          }
        }
        break
      }

      case "TOGGLE_BASE_VALUE_SKILL": {
        const isCurrently = state.baseValueSkills.includes(action.skillName)

        if (isCurrently) {
          draft.baseValueSkills = draft.baseValueSkills.filter((s) => s !== action.skillName)
        } else {
          draft.baseValueSkills.push(action.skillName)
        }

        // Also update the skill base value
        for (const skill of draft.skills) {
          if (skill.name === action.skillName) {
            skill.baseValue = isCurrently ? 0 : 1
          }
        }
        break
      }

      case "SET_DESENSITIZATION": {
        draft.desensitization[action.category] = Math.max(0, action.value)
        break
      }

      case "ADD_LANGUAGE": {
        draft.languages.push(action.language)
        break
      }

      case "REMOVE_LANGUAGE": {
        draft.languages.splice(action.index, 1)
        break
      }

      case "ADD_MYSTERY": {
        draft.mysteries.push(action.mystery)
        break
      }

      case "REMOVE_MYSTERY": {
        draft.mysteries.splice(action.index, 1)
        break
      }

      case "SET_STEP": {
        draft.currentStep = action.step
        break
      }

      case "LOAD_STATE": {
        return action.state
      }
    }
  })
}

// Helper to get max value for a skill given its status
function getMaxForSkill(status: "T" | "I" | "B" | null): number {
  if (status === null) return MAX_SKILL_VALUE
  return SKILL_STATUS_INFO[status].maxValue
}

// Helper to build a map of chunkIndex -> attributeName
// This handles duplicate chunk values in the model
function getUsedChunkIndices(state: Eon5CharState): Map<number, AttributeName> {
  if (!state.distributionModel) return new Map()
  const chunks = getChunks(state.distributionModel)
  const result = new Map<number, AttributeName>()

  // Build reverse map: for each attribute that has an assigned chunk,
  // find the corresponding chunk index
  const assignedAttrs = ATTRIBUTES.filter((a) => state.attributes[a].assignedChunk !== null)

  const usedIndices = new Set<number>()
  for (const attrName of assignedAttrs) {
    const chunkValue = state.attributes[attrName].assignedChunk
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] === chunkValue && !usedIndices.has(i)) {
        result.set(i, attrName)
        usedIndices.add(i)
        break
      }
    }
  }

  return result
}