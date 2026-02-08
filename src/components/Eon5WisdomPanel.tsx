import { useEon5Dispatch, useEon5State } from "../eon5-context"
import { KNOWLEDGE_SKILLS, TOTAL_KNOWLEDGE_SKILLS } from "../eon5-data"
import { getFinalAttributeValue, getWisdomEntry } from "../eon5-utils"

export function Eon5WisdomPanel() {
  const state = useEon5State()
  const dispatch = useEon5Dispatch()
  const wisdomAttr = state.attributes["Visdom"]
  const wisdomFinal = getFinalAttributeValue(wisdomAttr)
  const hasWisdom = wisdomAttr.assignedChunk !== null
  const entry = getWisdomEntry(wisdomFinal)

  if (!hasWisdom && wisdomAttr.base === 0) {
    return (
      <div className="p-3 border rounded bg-gray-50 text-gray-500">
        <h4 className="text-sm font-medium">Visdom-panel</h4>
        <p className="text-sm">Tilldela Visdom-attributet först.</p>
      </div>
    )
  }

  const displayValue = hasWisdom ? wisdomFinal : wisdomAttr.base + wisdomAttr.modifiers

  return (
    <div className="space-y-3 p-3 border rounded bg-gray-50">
      <h4 className="text-sm font-medium">Visdom-panel (Visdom: {displayValue})</h4>

      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <div>
          Inkompetenta kunskapsfärdigheter:{" "}
          <strong>
            {entry.incompetentCount === TOTAL_KNOWLEDGE_SKILLS
              ? "Samtliga"
              : entry.incompetentCount === 0
                ? "Inga"
                : entry.incompetentCount}
          </strong>
        </div>
        <div>
          Kunskapsfärdigheter med Grundvärde 1:{" "}
          <strong>
            {entry.baseValueCount === TOTAL_KNOWLEDGE_SKILLS
              ? "Samtliga"
              : entry.baseValueCount === 0
                ? "Inga"
                : entry.baseValueCount}
          </strong>
        </div>
        <div>
          Extra kunskapsenheter: <strong>{entry.extraUnits}</strong>
        </div>
        <div>
          Expertisbonus: <strong>{entry.expertiseBonus}</strong>
        </div>
        <div>
          Ny kunskap-kostnad (erfarenhet): <strong>{entry.newKnowledgeCost}</strong>
        </div>
      </div>

      {/* Incompetent skill selection */}
      {entry.incompetentCount > 0 && entry.incompetentCount < TOTAL_KNOWLEDGE_SKILLS && (
        <IncompetentSelector
          required={entry.incompetentCount}
          selected={state.incompetentSkills}
          dispatch={dispatch}
        />
      )}

      {/* If all are incompetent, auto-apply */}
      {entry.incompetentCount === TOTAL_KNOWLEDGE_SKILLS && (
        <p className="text-sm text-red-600">Samtliga kunskapsfärdigheter är Inkompetenta.</p>
      )}

      {/* Base value 1 skill selection */}
      {entry.baseValueCount > 0 && entry.baseValueCount < TOTAL_KNOWLEDGE_SKILLS && (
        <BaseValueSelector
          required={entry.baseValueCount}
          selected={state.baseValueSkills}
          dispatch={dispatch}
        />
      )}

      {/* If all get base value 1 */}
      {entry.baseValueCount === TOTAL_KNOWLEDGE_SKILLS && (
        <p className="text-sm text-green-700">Samtliga kunskapsfärdigheter har Grundvärde 1.</p>
      )}
    </div>
  )
}

function IncompetentSelector({
  required,
  selected,
  dispatch,
}: {
  required: number
  selected: string[]
  dispatch: ReturnType<typeof useEon5Dispatch>
}) {
  const remaining = required - selected.length

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        Markera {required} Inkompetenta kunskapsfärdigheter
        {remaining > 0 && <span className="text-red-600 ml-1">({remaining} kvar)</span>}
        {remaining === 0 && <span className="text-green-600 ml-1">(klart)</span>}
      </p>
      <div className="flex flex-wrap gap-1">
        {KNOWLEDGE_SKILLS.map((skill) => {
          const isSelected = selected.includes(skill)
          const canSelect = isSelected || remaining > 0
          return (
            <button
              key={skill}
              type="button"
              className={`text-xs px-2 py-1 rounded border ${
                isSelected
                  ? "bg-red-100 border-red-400 text-red-800"
                  : canSelect
                    ? "bg-white border-gray-300 hover:bg-gray-100"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!canSelect}
              onClick={() =>
                dispatch({
                  type: "TOGGLE_INCOMPETENT_SKILL",
                  skillName: skill,
                })
              }
            >
              {skill}
              {isSelected && " (I)"}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BaseValueSelector({
  required,
  selected,
  dispatch,
}: {
  required: number
  selected: string[]
  dispatch: ReturnType<typeof useEon5Dispatch>
}) {
  const remaining = required - selected.length

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        Markera {required} kunskapsfärdigheter med Grundvärde 1
        {remaining > 0 && <span className="text-amber-600 ml-1">({remaining} kvar)</span>}
        {remaining === 0 && <span className="text-green-600 ml-1">(klart)</span>}
      </p>
      <div className="flex flex-wrap gap-1">
        {KNOWLEDGE_SKILLS.map((skill) => {
          const isSelected = selected.includes(skill)
          const canSelect = isSelected || remaining > 0
          return (
            <button
              key={skill}
              type="button"
              className={`text-xs px-2 py-1 rounded border ${
                isSelected
                  ? "bg-green-100 border-green-400 text-green-800"
                  : canSelect
                    ? "bg-white border-gray-300 hover:bg-gray-100"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!canSelect}
              onClick={() =>
                dispatch({
                  type: "TOGGLE_BASE_VALUE_SKILL",
                  skillName: skill,
                })
              }
            >
              {skill}
              {isSelected && " (1)"}
            </button>
          )
        })}
      </div>
    </div>
  )
}