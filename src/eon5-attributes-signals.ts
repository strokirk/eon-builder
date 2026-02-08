import { signal, computed, batch } from "@preact/signals-react"
import {
  ATTRIBUTES,
  DISTRIBUTION_MODELS,
  MIN_FINAL_ATTRIBUTE_VALUE,
  REFERENCE_VALUE,
  type AttributeName,
  type DistributionModel,
} from "./eon5-data"
import {
  attributeToDice,
  getFinalAttributeValue,
  getGrundrustningFromTable,
  getGrundskada,
  getTotalAttributePoints,
  getChunks,
  getPreSpend,
} from "./eon5-utils"
import type { Eon5AttributeState } from "./eon5-types"

// Core signals
export const distributionModel = signal<DistributionModel | null>(null)
export const extraAttributePoints = signal(0)
export const grundrustningMod = signal(0)
export const grundskadaMod = signal(0)

// Attributes map
export const attributes = signal<Record<AttributeName, Eon5AttributeState>>(
  ATTRIBUTES.reduce(
    (acc, name) => ({
      ...acc,
      [name]: { base: 8, modifiers: 0, assignedChunk: null },
    }),
    {} as Record<AttributeName, Eon5AttributeState>,
  ),
)

// Computed values
export const totalPoints = computed(() => getTotalAttributePoints(extraAttributePoints.value))

export const chunks = computed(() => {
  const model = distributionModel.value
  return model !== null ? getChunks(model) : []
})

export const isFreePoints = computed(() => distributionModel.value === "Fria poäng")

// Get chunk assignments (which chunk index is assigned to which attribute)
export const chunkAssignments = computed(() => {
  const map = new Map<number, AttributeName>()
  const usedIndices = new Set<number>()
  const chunkList = chunks.value

  for (const attrName of ATTRIBUTES) {
    const chunk = attributes.value[attrName].assignedChunk
    if (chunk !== null) {
      for (let i = 0; i < chunkList.length; i++) {
        if (chunkList[i] === chunk && !usedIndices.has(i)) {
          map.set(i, attrName)
          usedIndices.add(i)
          break
        }
      }
    }
  }

  return map
})

export const availableChunkIndices = computed(() => {
  const chunkList = chunks.value
  const assignments = chunkAssignments.value
  return chunkList.map((_, i) => i).filter((i) => !assignments.has(i))
})

// Calculate remaining points for "Fria poäng" model
export const remainingPoints = computed(() => {
  if (!isFreePoints.value) return 0
  const total = totalPoints.value
  const used = ATTRIBUTES.reduce(
    (sum, attr) => sum + (attributes.value[attr].assignedChunk ?? 0),
    0,
  )
  return total - used
})

// Derived values for Kroppsbyggnad
export const kroppsbyggnadFinal = computed(() => {
  const kbAttr = attributes.value["Kroppsbyggnad"]
  return getFinalAttributeValue(kbAttr)
})

export const hasKroppsbyggnad = computed(() => {
  return attributes.value["Kroppsbyggnad"].assignedChunk !== null
})

export const grundrustning = computed(() => {
  if (!hasKroppsbyggnad.value) return null
  return getGrundrustningFromTable(kroppsbyggnadFinal.value) + grundrustningMod.value
})

export const grundskada = computed(() => {
  if (!hasKroppsbyggnad.value) return null
  return getGrundskada(kroppsbyggnadFinal.value)
})

// Helper functions to get computed values for specific attributes
export function getAttributeFinalValue(attrName: AttributeName): number {
  return getFinalAttributeValue(attributes.value[attrName])
}

export function getAttributePreSpend(attrName: AttributeName): number {
  return getPreSpend(attributes.value[attrName])
}

export function getAttributeDice(attrName: AttributeName): string {
  const finalVal = getAttributeFinalValue(attrName)
  return attributeToDice(finalVal)
}

export function isAttributeInvalid(attrName: AttributeName): boolean {
  const attr = attributes.value[attrName]
  const finalVal = getFinalAttributeValue(attr)
  return attr.assignedChunk !== null && finalVal < MIN_FINAL_ATTRIBUTE_VALUE
}

export function isAttributeReference(attrName: AttributeName): boolean {
  const finalVal = getAttributeFinalValue(attrName)
  return finalVal === REFERENCE_VALUE
}

export function getAssignedChunkIndex(attrName: AttributeName): number | null {
  const assignments = chunkAssignments.value
  for (const [idx, name] of assignments) {
    if (name === attrName) return idx
  }
  return null
}

// Actions (direct mutations)
export function setDistributionModel(model: DistributionModel) {
  batch(() => {
    distributionModel.value = model
    // Clear all chunk assignments when switching models
    const newAttrs = { ...attributes.value }
    for (const attr of ATTRIBUTES) {
      newAttrs[attr] = { ...newAttrs[attr], assignedChunk: null }
    }
    attributes.value = newAttrs
  })
}

export function setAttributeBase(attrName: AttributeName, value: number) {
  attributes.value = {
    ...attributes.value,
    [attrName]: {
      ...attributes.value[attrName],
      base: value,
    },
  }
}

export function setAttributeModifiers(attrName: AttributeName, value: number) {
  attributes.value = {
    ...attributes.value,
    [attrName]: {
      ...attributes.value[attrName],
      modifiers: value,
    },
  }
}

export function assignChunk(attrName: AttributeName, chunkIndex: number) {
  const chunkList = chunks.value
  const chunkValue = chunkList[chunkIndex]
  if (chunkValue === undefined) return

  batch(() => {
    // Find which attribute currently has this chunk index
    const assignments = chunkAssignments.value
    const prevAttr = assignments.get(chunkIndex)

    const newAttrs = { ...attributes.value }

    // Clear previous assignment
    if (prevAttr) {
      newAttrs[prevAttr] = { ...newAttrs[prevAttr], assignedChunk: null }
    }

    // Assign to target attribute
    newAttrs[attrName] = {
      ...newAttrs[attrName],
      assignedChunk: chunkValue,
    }

    attributes.value = newAttrs
  })
}

export function unassignChunk(chunkIndex: number) {
  const assignments = chunkAssignments.value
  const attrName = assignments.get(chunkIndex)
  if (!attrName) return

  attributes.value = {
    ...attributes.value,
    [attrName]: {
      ...attributes.value[attrName],
      assignedChunk: null,
    },
  }
}

export function setAttributeChunk(attrName: AttributeName, value: number) {
  attributes.value = {
    ...attributes.value,
    [attrName]: {
      ...attributes.value[attrName],
      assignedChunk: value,
    },
  }
}

export function setExtraAttributePoints(value: number) {
  extraAttributePoints.value = value
}

export function setGrundrustningMod(value: number) {
  grundrustningMod.value = value
}

export function setGrundskadaMod(value: number) {
  grundskadaMod.value = value
}
