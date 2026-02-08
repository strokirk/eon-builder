import {
  ATTRIBUTES,
  MAX_SKILL_VALUE,
  SKILL_STATUS_INFO,
  type AttributeName,
} from "./eon5-data"
import type { Eon5Action, Eon5CharState } from "./eon5-types"
import { getChunks } from "./eon5-utils"

export function eon5Reducer(
  state: Eon5CharState,
  action: Eon5Action,
): Eon5CharState {
  switch (action.type) {
    case "SET_DISTRIBUTION_MODEL": {
      // Clear all chunk assignments when switching models
      const attributes = { ...state.attributes }
      for (const attr of ATTRIBUTES) {
        attributes[attr] = { ...attributes[attr], assignedChunk: null }
      }
      return { ...state, distributionModel: action.model, attributes }
    }

    case "SET_ATTRIBUTE_BASE": {
      return {
        ...state,
        attributes: {
          ...state.attributes,
          [action.attribute]: {
            ...state.attributes[action.attribute],
            base: action.value,
          },
        },
      }
    }

    case "SET_ATTRIBUTE_MODIFIERS": {
      return {
        ...state,
        attributes: {
          ...state.attributes,
          [action.attribute]: {
            ...state.attributes[action.attribute],
            modifiers: action.value,
          },
        },
      }
    }

    case "ASSIGN_CHUNK": {
      if (!state.distributionModel) return state
      const chunks = getChunks(state.distributionModel)
      const chunkValue = chunks[action.chunkIndex]
      if (chunkValue === undefined) return state

      // Remove this chunk from any previously assigned attribute
      const attributes = { ...state.attributes }
      for (const attr of ATTRIBUTES) {
        if (attributes[attr].assignedChunk === chunkValue) {
          // Check if this specific chunk index was assigned here
          // We need to track by index to handle duplicate values
          attributes[attr] = { ...attributes[attr] }
        }
      }

      // Find which attribute currently has this chunk index
      const usedIndices = getUsedChunkIndices(state)
      const prevAttr = usedIndices.get(action.chunkIndex)
      if (prevAttr) {
        attributes[prevAttr] = { ...attributes[prevAttr], assignedChunk: null }
      }

      // Assign to the target attribute
      attributes[action.attribute] = {
        ...attributes[action.attribute],
        assignedChunk: chunkValue,
      }

      return { ...state, attributes }
    }

    case "UNASSIGN_CHUNK": {
      if (!state.distributionModel) return state
      const usedIndices = getUsedChunkIndices(state)
      const attrName = usedIndices.get(action.chunkIndex)
      if (!attrName) return state

      return {
        ...state,
        attributes: {
          ...state.attributes,
          [attrName]: {
            ...state.attributes[attrName],
            assignedChunk: null,
          },
        },
      }
    }

    case "SET_EXTRA_ATTRIBUTE_POINTS": {
      return { ...state, extraAttributePoints: action.value }
    }

    case "SET_GRUNDRUSTNING_MOD": {
      return { ...state, grundrustningMod: action.value }
    }

    case "SET_GRUNDSKADA_MOD": {
      return { ...state, grundskadaMod: action.value }
    }

    case "SET_SKILL_UNITS": {
      const updateSkillUnits = (skills: Eon5CharState["skills"]) =>
        skills.map((s) =>
          s.name === action.skillName
            ? {
                ...s,
                spentUnits: Math.max(
                  0,
                  Math.min(
                    action.units,
                    getMaxForSkill(s.status) - s.baseValue,
                  ),
                ),
              }
            : s,
        )
      return {
        ...state,
        skills: updateSkillUnits(state.skills),
        dynamicSkills: updateSkillUnits(state.dynamicSkills),
      }
    }

    case "SET_SKILL_STATUS": {
      const updateStatus = (skills: Eon5CharState["skills"]) =>
        skills.map((s) =>
          s.name === action.skillName ? { ...s, status: action.status } : s,
        )
      return {
        ...state,
        skills: updateStatus(state.skills),
        dynamicSkills: updateStatus(state.dynamicSkills),
      }
    }

    case "SET_SKILL_BASE_VALUE": {
      const updateBase = (skills: Eon5CharState["skills"]) =>
        skills.map((s) =>
          s.name === action.skillName ? { ...s, baseValue: action.value } : s,
        )
      return {
        ...state,
        skills: updateBase(state.skills),
        dynamicSkills: updateBase(state.dynamicSkills),
      }
    }

    case "ADD_DYNAMIC_SKILL": {
      return {
        ...state,
        dynamicSkills: [...state.dynamicSkills, action.skill],
      }
    }

    case "REMOVE_DYNAMIC_SKILL": {
      return {
        ...state,
        dynamicSkills: state.dynamicSkills.filter(
          (s) => s.name !== action.skillName,
        ),
      }
    }

    case "SET_SPECIFIC_UNITS": {
      return { ...state, specificUnits: action.allocations }
    }

    case "SET_GROUP_UNITS": {
      return { ...state, groupUnits: action.allocations }
    }

    case "SET_FREE_UNITS": {
      return { ...state, freeUnits: action.units }
    }

    case "TOGGLE_INCOMPETENT_SKILL": {
      const isCurrently = state.incompetentSkills.includes(action.skillName)
      const incompetentSkills = isCurrently
        ? state.incompetentSkills.filter((s) => s !== action.skillName)
        : [...state.incompetentSkills, action.skillName]

      // Also update the skill status
      const skills = state.skills.map((s) => {
        if (s.name === action.skillName) {
          return {
            ...s,
            status: (isCurrently ? null : "I") as typeof s.status,
          }
        }
        return s
      })

      return { ...state, incompetentSkills, skills }
    }

    case "TOGGLE_BASE_VALUE_SKILL": {
      const isCurrently = state.baseValueSkills.includes(action.skillName)
      const baseValueSkills = isCurrently
        ? state.baseValueSkills.filter((s) => s !== action.skillName)
        : [...state.baseValueSkills, action.skillName]

      // Also update the skill base value
      const skills = state.skills.map((s) => {
        if (s.name === action.skillName) {
          return { ...s, baseValue: isCurrently ? 0 : 1 }
        }
        return s
      })

      return { ...state, baseValueSkills, skills }
    }

    case "SET_DESENSITIZATION": {
      return {
        ...state,
        desensitization: {
          ...state.desensitization,
          [action.category]: Math.max(0, action.value),
        },
      }
    }

    case "ADD_LANGUAGE": {
      return { ...state, languages: [...state.languages, action.language] }
    }

    case "REMOVE_LANGUAGE": {
      return {
        ...state,
        languages: state.languages.filter((_, i) => i !== action.index),
      }
    }

    case "ADD_MYSTERY": {
      return { ...state, mysteries: [...state.mysteries, action.mystery] }
    }

    case "REMOVE_MYSTERY": {
      return {
        ...state,
        mysteries: state.mysteries.filter((_, i) => i !== action.index),
      }
    }

    case "SET_STEP": {
      return { ...state, currentStep: action.step }
    }

    case "LOAD_STATE": {
      return action.state
    }

    default:
      return state
  }
}

// Helper to get max value for a skill given its status
function getMaxForSkill(status: "T" | "I" | "B" | null): number {
  if (status === null) return MAX_SKILL_VALUE
  return SKILL_STATUS_INFO[status].maxValue
}

// Helper to build a map of chunkIndex -> attributeName
// This handles duplicate chunk values in the model
function getUsedChunkIndices(
  state: Eon5CharState,
): Map<number, AttributeName> {
  if (!state.distributionModel) return new Map()
  const chunks = getChunks(state.distributionModel)
  const result = new Map<number, AttributeName>()

  // Build reverse map: for each attribute that has an assigned chunk,
  // find the corresponding chunk index
  const assignedAttrs = ATTRIBUTES.filter(
    (a) => state.attributes[a].assignedChunk !== null,
  )

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
