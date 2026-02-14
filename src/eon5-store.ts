import { signal } from "@preact/signals-react"
import { produce } from "immer"

import {
  ATTRIBUTES,
  KNOWLEDGE_SKILLS,
  MAX_SKILL_VALUE,
  SKILL_STATUS_INFO,
  TOTAL_KNOWLEDGE_SKILLS,
  UNIT_SPENDING_RULES,
  type AttributeName,
  type SkillStatus,
} from "./eon5-data"
import type {
  Eon5CharState,
  Eon5Skill,
  GroupUnitAllocation,
  LanguageEntry,
  MysteryEntry,
  SpecificUnitAllocation,
} from "./eon5-types"
import { createInitialState, getChunks, getFinalAttributeValue, getWisdomEntry } from "./eon5-utils"

export const eon5State = signal<Eon5CharState>(createInitialState())

export function loadEon5State(state: Eon5CharState): void {
  eon5State.value = state
}

export function resetEon5State(): void {
  eon5State.value = createInitialState()
}

function updateEon5(updater: (draft: Eon5CharState, current: Eon5CharState) => void): void {
  const current = eon5State.value
  eon5State.value = produce(current, (draft) => {
    updater(draft, current)
    applyWisdomDerivedRules(draft)
  })
}

export function setDistributionModel(model: Eon5CharState["distributionModel"]): void {
  updateEon5((draft) => {
    for (const attr of ATTRIBUTES) {
      draft.attributes[attr].assignedChunk = null
    }
    draft.distributionModel = model
  })
}

export function setAttributeBase(attribute: AttributeName, value: number): void {
  updateEon5((draft) => {
    draft.attributes[attribute].base = value
  })
}

export function setAttributeModifiers(attribute: AttributeName, value: number): void {
  updateEon5((draft) => {
    draft.attributes[attribute].modifiers = value
  })
}

export function assignChunk(attribute: AttributeName, chunkIndex: number): void {
  updateEon5((draft, state) => {
    if (!state.distributionModel) return
    const chunks = getChunks(state.distributionModel)
    const chunkValue = chunks[chunkIndex]
    if (chunkValue === undefined) return

    const usedIndices = getUsedChunkIndices(state)
    const prevAttr = usedIndices.get(chunkIndex)
    if (prevAttr) {
      draft.attributes[prevAttr].assignedChunk = null
    }

    draft.attributes[attribute].assignedChunk = chunkValue
  })
}

export function unassignChunk(chunkIndex: number): void {
  updateEon5((draft, state) => {
    if (!state.distributionModel) return
    const usedIndices = getUsedChunkIndices(state)
    const attrName = usedIndices.get(chunkIndex)
    if (!attrName) return
    draft.attributes[attrName].assignedChunk = null
  })
}

export function setAttributeChunk(attribute: AttributeName, value: number): void {
  updateEon5((draft) => {
    draft.attributes[attribute].assignedChunk = Math.max(0, value)
  })
}

export function setExtraAttributePoints(value: number): void {
  updateEon5((draft) => {
    draft.extraAttributePoints = value
  })
}

export function setGrundrustningMod(value: number): void {
  updateEon5((draft) => {
    draft.grundrustningMod = value
  })
}

export function setGrundskadaMod(value: number): void {
  updateEon5((draft) => {
    draft.grundskadaMod = value
  })
}

export function setSkillUnits(skillName: string, units: number): void {
  updateEon5((draft, state) => {
    const allSkills = [...state.skills, ...state.dynamicSkills]
    const currentSkill = allSkills.find((skill) => skill.name === skillName)
    if (!currentSkill) return

    const maxUnitsByStatus = getMaxForSkill(currentSkill.status) - currentSkill.baseValue
    const requestedUnits = Math.max(0, Math.min(units, maxUnitsByStatus))
    const maxSpendable = getMaxSpendableUnitsForSkill(state, skillName, requestedUnits)

    const updateSkillUnits = (skills: typeof draft.skills) => {
      for (const skill of skills) {
        if (skill.name === skillName) {
          skill.spentUnits = maxSpendable
        }
      }
    }
    updateSkillUnits(draft.skills)
    updateSkillUnits(draft.dynamicSkills)
  })
}

export function canIncreaseSkillUnits(skillName: string): boolean {
  const state = eon5State.value
  const allSkills = [...state.skills, ...state.dynamicSkills]
  const skill = allSkills.find((entry) => entry.name === skillName)
  if (!skill) return false

  const maxUnitsByStatus = getMaxForSkill(skill.status) - skill.baseValue
  if (skill.spentUnits >= maxUnitsByStatus) return false

  const maxSpendable = getMaxSpendableUnitsForSkill(state, skillName, skill.spentUnits + 1)
  return maxSpendable > skill.spentUnits
}

export function setSkillStatus(skillName: string, status: SkillStatus): void {
  updateEon5((draft) => {
    const updateStatus = (skills: typeof draft.skills) => {
      for (const skill of skills) {
        if (skill.name === skillName) {
          skill.status = status
        }
      }
    }
    updateStatus(draft.skills)
    updateStatus(draft.dynamicSkills)
  })
}

export function setSkillBaseValue(skillName: string, value: number): void {
  updateEon5((draft) => {
    const updateBase = (skills: typeof draft.skills) => {
      for (const skill of skills) {
        if (skill.name === skillName) {
          skill.baseValue = value
        }
      }
    }
    updateBase(draft.skills)
    updateBase(draft.dynamicSkills)
  })
}

export function addDynamicSkill(skill: Eon5Skill): void {
  updateEon5((draft) => {
    draft.dynamicSkills.push(skill)
  })
}

export function removeDynamicSkill(skillName: string): void {
  updateEon5((draft) => {
    draft.dynamicSkills = draft.dynamicSkills.filter((s) => s.name !== skillName)
  })
}

export function setSpecificUnits(allocations: SpecificUnitAllocation[]): void {
  updateEon5((draft) => {
    draft.specificUnits = allocations
  })
}

export function setGroupUnits(allocations: GroupUnitAllocation[]): void {
  updateEon5((draft) => {
    draft.groupUnits = allocations
  })
}

export function setFreeUnits(units: number): void {
  updateEon5((draft) => {
    draft.freeUnits = units
  })
}

export function toggleIncompetentSkill(skillName: string): void {
  updateEon5((draft, state) => {
    const isCurrently = state.incompetentSkills.includes(skillName)

    if (isCurrently) {
      draft.incompetentSkills = draft.incompetentSkills.filter((s) => s !== skillName)
    } else {
      draft.incompetentSkills.push(skillName)
    }

    for (const skill of draft.skills) {
      if (skill.name === skillName) {
        skill.status = isCurrently ? null : "I"
      }
    }
  })
}

export function toggleBaseValueSkill(skillName: string): void {
  updateEon5((draft, state) => {
    const isCurrently = state.baseValueSkills.includes(skillName)

    if (isCurrently) {
      draft.baseValueSkills = draft.baseValueSkills.filter((s) => s !== skillName)
    } else {
      draft.baseValueSkills.push(skillName)
    }

    for (const skill of draft.skills) {
      if (skill.name === skillName) {
        skill.baseValue = isCurrently ? 0 : 1
      }
    }
  })
}

export function setDesensitization(
  category: keyof Eon5CharState["desensitization"],
  value: number,
): void {
  updateEon5((draft) => {
    draft.desensitization[category] = Math.max(0, value)
  })
}

export function addLanguage(language: LanguageEntry): void {
  updateEon5((draft) => {
    draft.languages.push(language)
  })
}

export function removeLanguage(index: number): void {
  updateEon5((draft) => {
    draft.languages.splice(index, 1)
  })
}

export function addMystery(mystery: MysteryEntry): void {
  updateEon5((draft) => {
    draft.mysteries.push(mystery)
  })
}

export function removeMystery(index: number): void {
  updateEon5((draft) => {
    draft.mysteries.splice(index, 1)
  })
}

function getMaxForSkill(status: "T" | "I" | "B" | null): number {
  if (status === null) return MAX_SKILL_VALUE
  return SKILL_STATUS_INFO[status].maxValue
}

function getUsedChunkIndices(state: Eon5CharState): Map<number, AttributeName> {
  if (!state.distributionModel) return new Map()
  const chunks = getChunks(state.distributionModel)
  const result = new Map<number, AttributeName>()
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

type SpendingTarget = {
  id: string
  category: string
  units: number
}

type SpendingPool = {
  kind: "specific" | "group" | "free" | "wisdomKnowledge" | "wisdomExpertise"
  label: string
  capacity: number
  categories: string[]
  specificSkillName?: string
}

export type UnitPoolUsage = {
  kind: "specific" | "group" | "free" | "wisdomKnowledge" | "wisdomExpertise"
  label: string
  used: number
  total: number
}

function getMaxSpendableUnitsForSkill(
  state: Eon5CharState,
  skillName: string,
  requestedUnits: number,
): number {
  for (let units = requestedUnits; units >= 0; units--) {
    if (isSpendingAllocationFeasible(state, skillName, units)) {
      return units
    }
  }
  return 0
}

function isSpendingAllocationFeasible(
  state: Eon5CharState,
  skillNameOverride: string,
  skillUnitsOverride: number,
): boolean {
  const pools = buildSpendingPools(state)
  const targets = buildSpendingTargets(state, skillNameOverride, skillUnitsOverride)
  const totalDemand = targets.reduce((sum, target) => sum + target.units, 0)

  if (totalDemand === 0) return true
  const totalSupply = pools.reduce((sum, pool) => sum + pool.capacity, 0)
  if (totalDemand > totalSupply) return false

  return canRouteAllDemand(pools, targets, totalDemand)
}

function buildSpendingPools(state: Eon5CharState): SpendingPool[] {
  const pools: SpendingPool[] = []

  for (const alloc of state.specificUnits) {
    if (alloc.units > 0) {
      pools.push({
        kind: "specific",
        label: alloc.skill,
        capacity: alloc.units,
        categories: [],
        specificSkillName: alloc.skill,
      })
    }
  }

  for (const alloc of state.groupUnits) {
    if (alloc.units > 0) {
      pools.push({
        kind: "group",
        label: alloc.group,
        capacity: alloc.units,
        categories: UNIT_SPENDING_RULES[alloc.group],
      })
    }
  }

  if (state.freeUnits > 0) {
    pools.push({
      kind: "free",
      label: "Valfria",
      capacity: state.freeUnits,
      categories: UNIT_SPENDING_RULES["Valfria enheter"],
    })
  }

  const wisdomAttr = state.attributes["Visdom"]
  if (wisdomAttr.assignedChunk !== null) {
    const wisdomEntry = getWisdomEntry(getFinalAttributeValue(wisdomAttr))

    if (wisdomEntry.extraUnits > 0) {
      pools.push({
        kind: "wisdomKnowledge",
        label: "Visdom bonus kunskapsenheter",
        capacity: wisdomEntry.extraUnits,
        categories: UNIT_SPENDING_RULES["Kunskapsenheter"],
      })
    }

    if (wisdomEntry.expertiseBonus > 0) {
      pools.push({
        kind: "wisdomExpertise",
        label: "Visdom expertisbonus",
        capacity: wisdomEntry.expertiseBonus,
        categories: ["Expertiser"],
      })
    }
  }

  return pools
}

function buildSpendingTargets(
  state: Eon5CharState,
  skillNameOverride?: string,
  skillUnitsOverride?: number,
): SpendingTarget[] {
  const targets: SpendingTarget[] = []
  const pushTarget = (id: string, category: string, units: number) => {
    if (units > 0) {
      targets.push({ id, category, units })
    }
  }

  const allSkills = [...state.skills, ...state.dynamicSkills]
  for (const skill of allSkills) {
    const units =
      skillNameOverride !== undefined &&
      skillUnitsOverride !== undefined &&
      skill.name === skillNameOverride
        ? skillUnitsOverride
        : skill.spentUnits
    pushTarget(`skill:${skill.name}`, getSpendingCategoryForSkill(skill), units)
  }

  if (state.desensitization.Utsatthet > 0) {
    pushTarget("desens:Utsatthet", "Avtrubbning_Utsatthet", state.desensitization.Utsatthet)
  }
  if (state.desensitization.Våld > 0) {
    pushTarget("desens:Våld", "Avtrubbning_Våld", state.desensitization.Våld)
  }
  if (state.desensitization.Övernaturligt > 0) {
    pushTarget(
      "desens:Övernaturligt",
      "Avtrubbning_Övernaturligt",
      state.desensitization.Övernaturligt,
    )
  }

  if (state.languages.length > 0) {
    pushTarget("languages", "Språk", state.languages.length)
  }
  if (state.mysteries.length > 0) {
    pushTarget("mysteries", "Mysterier", state.mysteries.length)
  }

  return targets
}

function getSpendingCategoryForSkill(skill: Eon5Skill): string {
  if (skill.dynamicType === "E") return "Expertiser"
  if (skill.dynamicType === "H") return "Hantverk"
  if (skill.dynamicType === "K") return "Kännetecken"
  if (skill.dynamicType === "F") return "Förmågor"
  return skill.group
}

function canRouteAllDemand(
  pools: SpendingPool[],
  targets: SpendingTarget[],
  totalDemand: number,
): boolean {
  const network = buildFlowNetwork(pools, targets)
  const flow = runMaxFlow(network.capacity, network.source, network.sink)
  return flow >= totalDemand
}

export function getUnitPoolUsageBreakdown(state: Eon5CharState = eon5State.value): UnitPoolUsage[] {
  const pools = buildSpendingPools(state)
  const targets = buildSpendingTargets(state)

  if (pools.length === 0) return []

  const network = buildFlowNetwork(pools, targets)
  runMaxFlow(network.capacity, network.source, network.sink)

  const usageByKey = new Map<string, UnitPoolUsage>()
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]
    const poolNode = network.poolStart + i
    const used = pool.capacity - network.capacity[network.source][poolNode]
    const key = `${pool.kind}:${pool.label}`
    const existing = usageByKey.get(key)

    if (existing) {
      existing.used += used
      existing.total += pool.capacity
      continue
    }

    usageByKey.set(key, {
      kind: pool.kind,
      label: pool.label,
      used,
      total: pool.capacity,
    })
  }

  return [...usageByKey.values()]
}

function buildFlowNetwork(pools: SpendingPool[], targets: SpendingTarget[]) {
  const source = 0
  const poolStart = 1
  const targetStart = poolStart + pools.length
  const sink = targetStart + targets.length
  const nodeCount = sink + 1
  const capacity = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(0))

  for (let i = 0; i < pools.length; i++) {
    const poolNode = poolStart + i
    capacity[source][poolNode] = pools[i].capacity
  }

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]
    const poolNode = poolStart + i
    for (let j = 0; j < targets.length; j++) {
      const target = targets[j]
      const targetNode = targetStart + j
      const canSpendOnTarget = pool.specificSkillName
        ? target.id === `skill:${pool.specificSkillName}`
        : pool.categories.includes(target.category)
      if (canSpendOnTarget) {
        capacity[poolNode][targetNode] = target.units
      }
    }
  }

  for (let j = 0; j < targets.length; j++) {
    const targetNode = targetStart + j
    capacity[targetNode][sink] = targets[j].units
  }

  return { capacity, source, sink, poolStart }
}

function runMaxFlow(capacity: number[][], source: number, sink: number): number {
  let flow = 0
  const nodeCount = capacity.length

  while (true) {
    const parent = Array(nodeCount).fill(-1)
    parent[source] = source
    const queue: number[] = [source]

    for (let qi = 0; qi < queue.length; qi++) {
      const node = queue[qi]
      for (let next = 0; next < nodeCount; next++) {
        if (parent[next] === -1 && capacity[node][next] > 0) {
          parent[next] = node
          queue.push(next)
          if (next === sink) {
            break
          }
        }
      }
      if (parent[sink] !== -1) {
        break
      }
    }

    if (parent[sink] === -1) {
      break
    }

    let augment = Number.MAX_SAFE_INTEGER
    for (let node = sink; node !== source; node = parent[node]) {
      augment = Math.min(augment, capacity[parent[node]][node])
    }

    for (let node = sink; node !== source; node = parent[node]) {
      capacity[parent[node]][node] -= augment
      capacity[node][parent[node]] += augment
    }
    flow += augment
  }

  return flow
}

function applyWisdomDerivedRules(draft: Eon5CharState): void {
  const wisdomAttr = draft.attributes["Visdom"]
  const wisdomFinal = getFinalAttributeValue(wisdomAttr)
  const wisdomEntry = getWisdomEntry(wisdomFinal)
  const knowledgeSet = new Set(KNOWLEDGE_SKILLS)

  if (wisdomEntry.baseValueCount === TOTAL_KNOWLEDGE_SKILLS) {
    draft.baseValueSkills = [...KNOWLEDGE_SKILLS]
    for (const skill of draft.skills) {
      if (knowledgeSet.has(skill.name as (typeof KNOWLEDGE_SKILLS)[number])) {
        skill.baseValue = 1
      }
    }
  } else if (draft.baseValueSkills.length === TOTAL_KNOWLEDGE_SKILLS) {
    draft.baseValueSkills = []
    for (const skill of draft.skills) {
      if (
        knowledgeSet.has(skill.name as (typeof KNOWLEDGE_SKILLS)[number]) &&
        skill.baseValue === 1
      ) {
        skill.baseValue = 0
      }
    }
  }

  if (wisdomEntry.incompetentCount === TOTAL_KNOWLEDGE_SKILLS) {
    draft.incompetentSkills = [...KNOWLEDGE_SKILLS]
    for (const skill of draft.skills) {
      if (knowledgeSet.has(skill.name as (typeof KNOWLEDGE_SKILLS)[number])) {
        skill.status = "I"
      }
    }
  } else if (draft.incompetentSkills.length === TOTAL_KNOWLEDGE_SKILLS) {
    draft.incompetentSkills = []
    for (const skill of draft.skills) {
      if (
        knowledgeSet.has(skill.name as (typeof KNOWLEDGE_SKILLS)[number]) &&
        skill.status === "I"
      ) {
        skill.status = null
      }
    }
  }
}