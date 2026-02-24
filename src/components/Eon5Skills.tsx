import classNames from "classnames"
import { useState } from "react"

import { MinusButton, PlusButton } from "../buttons"
import {
  addDynamicSkill,
  addLanguage,
  addMystery,
  canIncreaseSkillUnits,
  eon5State,
  getUnitPoolUsageBreakdown,
  removeDynamicSkill,
  removeLanguage,
  removeMystery,
  setDesensitization,
  setFreeUnits,
  setGroupUnits,
  setSkillStatus,
  setSkillUnits,
  setSpecificUnits,
} from "../eon5-store"
import { Eon5WisdomPanel } from "./Eon5WisdomPanel"
import {
  DESENSITIZATION_CATEGORIES,
  DYNAMIC_SKILL_TYPES,
  MAX_SKILL_VALUE,
  SKILL_STATUS_INFO,
  type DynamicSkillType,
  type SkillGroupName,
  type SkillStatus,
  type UnitType,
} from "../eon5-data"
import type { Eon5Skill } from "../eon5-types"
import {
  computeTotalUnitsAvailable,
  computeTotalUnitsSpent,
  getFinalAttributeValue,
  getWisdomEntry,
  skillValueToDice,
} from "../eon5-utils"
import { NumberInput } from "./ui/NumberInput"

export function Eon5Skills() {
  const state = eon5State.value

  const totalAvailable = computeTotalUnitsAvailable(state)
  const totalSpent = computeTotalUnitsSpent(state)
  const remaining = totalAvailable - totalSpent

  return (
    <div className="space-y-6">
      {/* Wisdom panel */}
      <Eon5WisdomPanel />

      {/* Unit pool summary */}
      <UnitPoolSummary />

      {/* Specific unit allocations input */}
      <SpecificUnitsInput />

      {/* Group unit allocations */}
      <GroupUnitsInput />

      {/* Free units */}
      <FreeUnitsInput />

      {/* Budget bar */}
      <div
        className={`status-banner ${
          remaining > 0
            ? "status-banner--warn"
            : remaining < 0
              ? "status-banner--error"
              : "status-banner--ok"
        }`}
      >
        <span className="font-medium">Enhetsbudget:</span> <span>{totalSpent}</span> /{" "}
        <span>{totalAvailable}</span> spenderade
        {remaining > 0 && (
          <span className="text-amber-600 ml-2">({remaining} kvar att spendera)</span>
        )}
        {remaining < 0 && (
          <span className="text-red-600 ml-2">({Math.abs(remaining)} för mycket!)</span>
        )}
        {remaining === 0 && <span className="text-green-600 ml-2">(alla spenderade)</span>}
      </div>

      {/* Skill groups */}
      <SkillGroupSection title="Kunskapsfärdigheter" group="Kunskapsfärdigheter" />
      <SkillGroupSection title="Mystikfärdigheter" group="Mystikfärdigheter" />
      <SkillGroupSection title="Rörelsefärdigheter" group="Rörelsefärdigheter" />
      <SkillGroupSection title="Sociala färdigheter" group="Sociala färdigheter" />
      <SkillGroupSection title="Stridsfärdigheter" group="Stridsfärdigheter" />
      <SkillGroupSection title="Vildmarksfärdigheter" group="Vildmarksfärdigheter" />

      {/* Dynamic skills (Övriga färdigheter) */}
      <DynamicSkillsSection />

      {/* Desensitization */}
      <DesensitizationSection />

      {/* Languages */}
      <LanguagesSection />

      {/* Mysteries */}
      <MysteriesSection />
    </div>
  )
}

function getCurrentSkillUnits(skillName: string): number {
  const state = eon5State.value
  const skill = [...state.skills, ...state.dynamicSkills].find((entry) => entry.name === skillName)
  return skill?.spentUnits ?? 0
}

function UnitPoolSummary() {
  const state = eon5State.value
  const poolUsage = getUnitPoolUsageBreakdown(state)
  const specificUsage = poolUsage.filter((pool) => pool.kind === "specific")
  const groupUsage = poolUsage.filter((pool) => pool.kind === "group")
  const freeUsage = poolUsage.find((pool) => pool.kind === "free")
  const wisdomKnowledgeUsage = poolUsage.find((pool) => pool.kind === "wisdomKnowledge")
  const wisdomExpertiseUsage = poolUsage.find((pool) => pool.kind === "wisdomExpertise")

  const wisdomAttr = state.attributes["Visdom"]
  const wisdomFinal = getFinalAttributeValue(wisdomAttr)
  const hasWisdom = wisdomAttr.assignedChunk !== null
  const wisdomEntry = hasWisdom ? getWisdomEntry(wisdomFinal) : null

  return (
    <div className="status-banner status-banner--info space-y-1">
      <h4 className="font-medium">Enhetssammanställning</h4>
      {specificUsage.length > 0 && (
        <div>
          <span className="font-medium">Specifika: </span>
          {specificUsage.map((u, i) => (
            <span key={i}>
              {u.label} ({u.used} / {u.total}){i < specificUsage.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
      {groupUsage.length > 0 && (
        <div>
          <span className="font-medium">Gruppenheter: </span>
          {groupUsage.map((u, i) => (
            <span key={i}>
              {u.label} ({u.used} / {u.total}){i < groupUsage.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
      {freeUsage && <Used label="Valfria" used={freeUsage} />}
      {wisdomEntry && wisdomEntry.extraUnits > 0 && (
        <Used label="Visdom bonus kunskapsenheter" used={wisdomKnowledgeUsage} />
      )}
      {wisdomEntry && wisdomEntry.expertiseBonus > 0 && (
        <Used label="Visdom expertisbonus" used={wisdomExpertiseUsage} />
      )}
    </div>
  )
}

const Used = ({
  label,
  used: { used, total } = {},
}: {
  label: string
  used?: { used?: number; total?: number }
}) =>
  total && (
    <>
      <span className="font-medium">{label}: </span>
      {used} / {total}
    </>
  )

function SpecificUnitsInput() {
  const state = eon5State.value
  const [newSkill, setNewSkill] = useState("")
  const [newUnits, setNewUnits] = useState(0)

  const addAllocation = () => {
    if (newSkill.trim() && newUnits > 0) {
      setSpecificUnits([...state.specificUnits, { skill: newSkill.trim(), units: newUnits }])
      setNewSkill("")
      setNewUnits(0)
    }
  }

  const removeAllocation = (index: number) => {
    setSpecificUnits(state.specificUnits.filter((_, i) => i !== index))
  }

  const updateUnits = (index: number, val: number) => {
    if (val <= 0) {
      removeAllocation(index)
    } else {
      setSpecificUnits(state.specificUnits.map((a, i) => (i === index ? { ...a, units: val } : a)))
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Specifika färdighetsenheter</h4>
      {state.specificUnits.map((alloc, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="flex-1">{alloc.skill}</span>
          <NumberInput
            min={1}
            className="w-16"
            value={alloc.units}
            onChange={(e) => updateUnits(i, e)}
          />
          <MinusButton onClick={() => removeAllocation(i)} />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="specific-unit-skill-name">
          Färdighetsnamn
        </label>
        <input
          id="specific-unit-skill-name"
          name="specific-unit-skill-name"
          type="text"
          className="input-base flex-1"
          placeholder="Färdighetsnamn"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addAllocation()
          }}
        />
        <label className="sr-only" htmlFor="specific-unit-count">
          Antal enheter
        </label>
        <NumberInput
          id="specific-unit-count"
          name="specific-unit-count"
          className="w-14"
          min={1}
          value={newUnits || undefined}
          onChange={setNewUnits}
        />
        <PlusButton onClick={addAllocation} />
      </div>
    </div>
  )
}

function GroupUnitsInput() {
  const state = eon5State.value

  const unitTypes: UnitType[] = [
    "Kunskapsenheter",
    "Mystikenheter",
    "Rörelseenheter",
    "Sociala enheter",
    "Stridsenheter",
    "Vildmarksenheter",
  ]

  const setUnits = (type: UnitType, val: number) => {
    const sanitized = Math.max(0, val)
    const group = state.groupUnits
    const existing = group.find((g) => g.group === type)
    if (sanitized === 0) {
      setGroupUnits(group.filter((g) => g.group !== type))
    } else if (existing) {
      setGroupUnits(group.map((g) => (g.group === type ? { ...g, units: sanitized } : g)))
    } else {
      setGroupUnits([...group, { group: type, units: sanitized }])
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Gruppenheter</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {unitTypes.map((type) => {
          const current = state.groupUnits.find((g) => g.group === type)?.units ?? 0
          const inputId = `group-units-${type.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`
          return (
            <div key={type} className="flex items-center gap-2">
              <label className="text-sm flex-1" htmlFor={inputId}>
                {type}:
              </label>
              <NumberInput
                id={inputId}
                name={inputId}
                positive
                className="w-16"
                value={current || undefined}
                onChange={(e) => setUnits(type, e)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FreeUnitsInput() {
  const state = eon5State.value

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium" htmlFor="free-units">
        Valfria enheter:
      </label>
      <NumberInput
        id="free-units"
        name="free-units"
        positive
        className="w-16"
        value={state.freeUnits || undefined}
        onChange={setFreeUnits}
      />
    </div>
  )
}

function SkillGroupSection({ title, group }: { title: string; group: SkillGroupName }) {
  const state = eon5State.value

  const skills = [
    ...state.skills.filter((s) => s.group === group),
    ...state.dynamicSkills.filter((s) => s.group === group),
  ]

  if (skills.length === 0) return null

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium fg-eon-red">{title}</h4>
      <div className="table-wrap">
        <table className="table-eon table-eon--dense w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Färdighet</th>
              <th className="text-center w-12">Grund</th>
              <th className="text-center w-20">Enheter</th>
              <th className="text-center w-12">Värde</th>
              <th className="text-center w-16">Tärningar</th>
              <th className="text-center w-16">Status</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <SkillRow key={skill.name} skill={skill} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SkillRow({ skill }: { skill: Eon5Skill }) {
  const [showBlockedHint, setShowBlockedHint] = useState(false)
  const totalValue = skill.baseValue + skill.spentUnits
  const statusId = `skill-status-${skill.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`
  const maxForStatus =
    skill.status && skill.status in SKILL_STATUS_INFO
      ? SKILL_STATUS_INFO[skill.status].maxValue
      : MAX_SKILL_VALUE
  const isOverMax = totalValue > maxForStatus
  const overflow = isOverMax ? totalValue - maxForStatus : 0
  const canIncrease = canIncreaseSkillUnits(skill.name)
  const blockedByBudget = !canIncrease && totalValue < maxForStatus && skill.status !== "B"

  const handleIncrease = () => {
    const before = skill.spentUnits
    setSkillUnits(skill.name, skill.spentUnits + 1)
    const after = getCurrentSkillUnits(skill.name)
    if (after === before) {
      setShowBlockedHint(true)
      window.setTimeout(() => setShowBlockedHint(false), 900)
    }
  }

  return (
    <tr className={isOverMax ? "bg-red-50" : ""}>
      <td>
        {skill.name}
        {skill.dynamicType && (
          <span className="text-xs text-gray-500 ml-1">({skill.dynamicType})</span>
        )}
        {skill.isOmstöpt && <span className="text-xs text-purple-600 ml-1">(Omstöpt)</span>}
      </td>
      <td className="text-center">{skill.baseValue}</td>
      <td className="text-center">
        {skill.status === "B" ? (
          <span className="text-gray-400">—</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="btn btn--ghost w-6 h-6 p-0 text-xs"
              onClick={() => setSkillUnits(skill.name, skill.spentUnits - 1)}
              disabled={skill.spentUnits <= 0}
            >
              -
            </button>
            <span className="w-6 text-center">{skill.spentUnits}</span>
            <button
              type="button"
              className={classNames("btn btn--ghost w-6 h-6 p-0 text-xs", {
                "opacity-45": blockedByBudget,
              })}
              onClick={handleIncrease}
              disabled={totalValue >= maxForStatus}
              aria-disabled={blockedByBudget}
              title={blockedByBudget ? "Inga kompatibla enheter kvar att spendera" : undefined}
            >
              +
            </button>
            {showBlockedHint && (
              <span className="text-[10px] text-amber-700 ml-1">Ingen giltig enhetspool kvar</span>
            )}
          </div>
        )}
      </td>
      <td className={classNames(`text-center font-bold`, { "text-red-600": isOverMax })}>
        {totalValue}
        {overflow > 0 && <span className="text-xs text-red-500 ml-1">(+{overflow} overflow)</span>}
      </td>
      <td className="text-center fn-dice">{skillValueToDice(totalValue)}</td>
      <td className="text-center">
        <label className="sr-only" htmlFor={statusId}>
          {skill.name} status
        </label>
        <select
          id={statusId}
          name={statusId}
          aria-label={`${skill.name} status`}
          className="input-base input-compact text-xs w-14"
          value={skill.status || ""}
          onChange={(e) => setSkillStatus(skill.name, (e.target.value || null) as SkillStatus)}
        >
          <option value="">—</option>
          <option value="T">T</option>
          <option value="I">I</option>
          <option value="B">B</option>
        </select>
      </td>
    </tr>
  )
}

function DynamicSkillsSection() {
  const state = eon5State.value
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<DynamicSkillType>("E")
  const [newGroup, setNewGroup] = useState<SkillGroupName>("Övriga färdigheter")

  const dynamicGroupOptions: { value: SkillGroupName; label: string }[] = [
    { value: "Övriga färdigheter", label: "Övriga färdigheter" },
    { value: "Mystikfärdigheter", label: "Mystikfärdigheter (aspekt)" },
    { value: "Stridsfärdigheter", label: "Stridsfärdigheter (vapen)" },
  ]

  const addSkill = () => {
    if (newName.trim()) {
      addDynamicSkill({
        name: newName.trim(),
        group: newGroup,
        baseValue: 0,
        spentUnits: 0,
        status: null,
        dynamicType: newType,
      })
      setNewName("")
    }
  }

  const övrigaSkills = state.dynamicSkills.filter((s) => s.group === "Övriga färdigheter")

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium fg-eon-red">
        Övriga färdigheter (Expertiser, Förmågor, Hantverk, Kännetecken)
      </h4>

      {övrigaSkills.length > 0 && (
        <div className="table-wrap">
          <table className="table-eon table-eon--dense w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Färdighet</th>
                <th className="text-center w-12">Grund</th>
                <th className="text-center w-20">Enheter</th>
                <th className="text-center w-12">Värde</th>
                <th className="text-center w-16">Tärningar</th>
                <th className="text-center w-16">Status</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {övrigaSkills.map((skill) => (
                <DynamicSkillRow key={skill.name} skill={skill} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="dynamic-skill-name">
          Dynamiskt färdighetsnamn
        </label>
        <input
          id="dynamic-skill-name"
          name="dynamic-skill-name"
          type="text"
          className="input-base flex-1"
          placeholder="Namn (t.ex. Heraldik, Smed, Romantiker...)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSkill()
          }}
        />
        <label className="sr-only" htmlFor="dynamic-skill-type">
          Dynamisk färdighetstyp
        </label>
        <select
          id="dynamic-skill-type"
          name="dynamic-skill-type"
          className="input-base text-sm"
          value={newType}
          onChange={(e) => setNewType(e.target.value as DynamicSkillType)}
        >
          {Object.entries(DYNAMIC_SKILL_TYPES).map(([code, info]) => (
            <option key={code} value={code}>
              {info.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="dynamic-skill-group">
          Dynamisk färdighetsgrupp
        </label>
        <select
          id="dynamic-skill-group"
          name="dynamic-skill-group"
          className="input-base text-sm"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value as SkillGroupName)}
        >
          {dynamicGroupOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <PlusButton onClick={addSkill} />
      </div>
    </div>
  )
}

function DynamicSkillRow({ skill }: { skill: Eon5Skill }) {
  const [showBlockedHint, setShowBlockedHint] = useState(false)
  const totalValue = skill.baseValue + skill.spentUnits
  const statusId = `dynamic-skill-status-${skill.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`
  const canIncrease = canIncreaseSkillUnits(skill.name)
  const blockedByBudget = !canIncrease && totalValue < MAX_SKILL_VALUE && skill.status !== "B"

  const handleIncrease = () => {
    const before = skill.spentUnits
    setSkillUnits(skill.name, skill.spentUnits + 1)
    const after = getCurrentSkillUnits(skill.name)
    if (after === before) {
      setShowBlockedHint(true)
      window.setTimeout(() => setShowBlockedHint(false), 900)
    }
  }

  return (
    <tr>
      <td>
        {skill.name}
        <span className="text-xs text-gray-500 ml-1">({skill.dynamicType})</span>
      </td>
      <td className="text-center">{skill.baseValue}</td>
      <td className="text-center">
        {skill.status === "B" ? (
          <span className="text-gray-400">—</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="btn btn--ghost w-6 h-6 p-0 text-xs"
              onClick={() => setSkillUnits(skill.name, skill.spentUnits - 1)}
              disabled={skill.spentUnits <= 0}
            >
              -
            </button>
            <span className="w-6 text-center">{skill.spentUnits}</span>
            <button
              type="button"
              className={`btn btn--ghost w-6 h-6 p-0 text-xs ${
                blockedByBudget ? "opacity-45" : ""
              }`}
              onClick={handleIncrease}
              disabled={skill.baseValue + skill.spentUnits >= MAX_SKILL_VALUE}
              aria-disabled={blockedByBudget}
              title={blockedByBudget ? "Inga kompatibla enheter kvar att spendera" : undefined}
            >
              +
            </button>
            {showBlockedHint && (
              <span className="text-[10px] text-amber-700 ml-1">Ingen giltig enhetspool kvar</span>
            )}
          </div>
        )}
      </td>
      <td className="text-center font-bold">{skill.baseValue + skill.spentUnits}</td>
      <td className="text-center fn-dice">
        {skillValueToDice(skill.baseValue + skill.spentUnits)}
      </td>
      <td className="text-center">
        <label className="sr-only" htmlFor={statusId}>
          {skill.name} dynamisk status
        </label>
        <select
          id={statusId}
          name={statusId}
          aria-label={`${skill.name} dynamisk status`}
          className="input-base input-compact text-xs w-14"
          value={skill.status || ""}
          onChange={(e) => setSkillStatus(skill.name, (e.target.value || null) as SkillStatus)}
        >
          <option value="">—</option>
          <option value="T">T</option>
          <option value="I">I</option>
          <option value="B">B</option>
        </select>
      </td>
      <td>
        <MinusButton onClick={() => removeDynamicSkill(skill.name)} />
      </td>
    </tr>
  )
}

function DesensitizationSection() {
  const state = eon5State.value
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium fg-eon-red">Avtrubbning</h4>
      <div className="flex gap-6">
        {DESENSITIZATION_CATEGORIES.map((cat) => {
          const val = state.desensitization[cat]
          return (
            <div key={cat} className="flex items-center gap-2">
              <label className="text-sm">{cat}:</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-6 h-6 border rounded text-xs hover:bg-gray-100"
                  onClick={() => setDesensitization(cat, val - 1)}
                  disabled={val <= 0}
                >
                  -
                </button>
                <span className="w-6 text-center font-bold">{val}</span>
                <button
                  type="button"
                  className="w-6 h-6 border rounded text-xs hover:bg-gray-100"
                  onClick={() => setDesensitization(cat, val + 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LanguagesSection() {
  const state = eon5State.value
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"tal" | "skrift">("tal")

  const handleAddLanguage = () => {
    if (newName.trim()) {
      addLanguage({ name: newName.trim(), type: newType })
      setNewName("")
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium fg-eon-red">Språk</h4>
      {state.languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {state.languages.map((lang, i) => (
            <span
              key={i}
              className="text-sm px-2 py-1 bg-gray-100 rounded border flex items-center gap-1"
            >
              {lang.name} ({lang.type})
              <MinusButton onClick={() => removeLanguage(i)} />
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="language-name">
          Språknamn
        </label>
        <input
          id="language-name"
          name="language-name"
          type="text"
          className="input-base flex-1"
          placeholder="Språknamn"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddLanguage()
          }}
        />
        <label className="sr-only" htmlFor="language-type">
          Språktyp
        </label>
        <select
          id="language-type"
          name="language-type"
          className="input-base text-sm"
          value={newType}
          onChange={(e) => setNewType(e.target.value as "tal" | "skrift")}
        >
          <option value="tal">Talspråk</option>
          <option value="skrift">Skriftspråk</option>
        </select>
        <PlusButton onClick={handleAddLanguage} />
      </div>
    </div>
  )
}

function MysteriesSection() {
  const state = eon5State.value
  const [newName, setNewName] = useState("")

  const handleAddMystery = () => {
    if (newName.trim()) {
      addMystery({ name: newName.trim() })
      setNewName("")
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium fg-eon-red">Mysterier</h4>
      {state.mysteries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {state.mysteries.map((m, i) => (
            <span
              key={i}
              className="text-sm px-2 py-1 bg-gray-100 rounded border flex items-center gap-1"
            >
              {m.name}
              <MinusButton onClick={() => removeMystery(i)} />
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="mystery-name">
          Mysterienamn
        </label>
        <input
          id="mystery-name"
          name="mystery-name"
          type="text"
          className="input-base flex-1"
          placeholder="Mysterienamn"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddMystery()
          }}
        />
        <PlusButton onClick={handleAddMystery} />
      </div>
    </div>
  )
}