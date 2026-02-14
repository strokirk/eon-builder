import { eon5State } from "../eon5-store"
import {
  ATTRIBUTES,
  DESENSITIZATION_CATEGORIES,
  DESENSITIZATION_THRESHOLDS,
  SKILL_STATUS_INFO,
} from "../eon5-data"
import type { Eon5Skill } from "../eon5-types"
import {
  attributeToDice,
  getFinalAttributeValue,
  getGrundrustningFromTable,
  getGrundskada,
  getWisdomEntry,
  skillValueToDice,
  validateAttributes,
  validateSkills,
} from "../eon5-utils"

export function Eon5Summary() {
  const state = eon5State.value

  const attrErrors = validateAttributes(state)
  const skillErrors = validateSkills(state)
  const allErrors = [...attrErrors, ...skillErrors]
  const errors = allErrors.filter((e) => e.severity === "error")
  const warnings = allErrors.filter((e) => e.severity === "warning")

  const kbAttr = state.attributes["Kroppsbyggnad"]
  const kbFinal = getFinalAttributeValue(kbAttr)
  const hasKb = kbAttr.assignedChunk !== null
  const wisdomAttr = state.attributes["Visdom"]
  const wisdomFinal = getFinalAttributeValue(wisdomAttr)
  const hasWisdom = wisdomAttr.assignedChunk !== null
  const wisdomEntry = hasWisdom ? getWisdomEntry(wisdomFinal) : null

  const allSkills = [...state.skills, ...state.dynamicSkills]
  const skillGroups = groupSkills(allSkills)

  return (
    <div className="space-y-4">
      <h3>Steg 5: Sammanfattning</h3>

      {/* Validation */}
      {errors.length > 0 && (
        <div className="p-3 border border-red-300 rounded bg-red-50 space-y-1">
          <h4 className="text-sm font-medium text-red-800">Regelbrott:</h4>
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-700">
              {e.field}: {e.message}
            </p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="p-3 border border-amber-300 rounded bg-amber-50 space-y-1">
          <h4 className="text-sm font-medium text-amber-800">Varningar:</h4>
          {warnings.map((e, i) => (
            <p key={i} className="text-sm text-amber-700">
              {e.field}: {e.message}
            </p>
          ))}
        </div>
      )}

      {/* Attributes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium fg-eon-red">Attribut</h4>
        <table className="table-condensed text-sm">
          <thead>
            <tr>
              <th className="text-left">Attribut</th>
              <th className="text-center">Värde</th>
              <th className="text-center">Tärningar</th>
            </tr>
          </thead>
          <tbody>
            {ATTRIBUTES.map((attrName) => {
              const attr = state.attributes[attrName]
              const finalVal = getFinalAttributeValue(attr)
              const isVisdom = attrName === "Visdom"
              return (
                <tr key={attrName}>
                  <td className="font-medium">{attrName}</td>
                  <td className="text-center">{finalVal}</td>
                  <td className="text-center fn-dice">
                    {isVisdom ? "—" : attributeToDice(finalVal)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Derived values */}
      <div className="space-y-1 text-sm">
        <h4 className="font-medium fg-eon-red">Härledda värden</h4>
        <p>
          <strong>Grundrustning:</strong>{" "}
          {hasKb ? getGrundrustningFromTable(kbFinal) + state.grundrustningMod : "—"}
        </p>
        <p>
          <strong>Grundskada:</strong> {hasKb ? getGrundskada(kbFinal) : "—"}
          {state.grundskadaMod !== 0 && (
            <span>
              {" "}
              ({state.grundskadaMod > 0 ? "+" : ""}
              {state.grundskadaMod} mod)
            </span>
          )}
        </p>
      </div>

      {/* Visdom info */}
      {wisdomEntry && (
        <div className="space-y-1 text-sm">
          <h4 className="font-medium fg-eon-red">Visdom ({wisdomFinal})</h4>
          <p>
            Ny kunskap-kostnad: <strong>{wisdomEntry.newKnowledgeCost}</strong> erfarenhetspoäng
          </p>
          {state.incompetentSkills.length > 0 && (
            <p>
              Inkompetenta:{" "}
              <span className="text-red-600">{state.incompetentSkills.join(", ")}</span>
            </p>
          )}
          {state.baseValueSkills.length > 0 && (
            <p>
              Grundvärde 1:{" "}
              <span className="text-green-700">{state.baseValueSkills.join(", ")}</span>
            </p>
          )}
        </div>
      )}

      {/* Skills by group */}
      {Object.entries(skillGroups).map(([groupName, skills]) => {
        const activeSkills = skills.filter(
          (s) => s.baseValue + s.spentUnits > 0 || s.status !== null,
        )
        if (activeSkills.length === 0) return null

        return (
          <div key={groupName} className="space-y-1">
            <h4 className="text-sm font-medium fg-eon-red">{groupName}</h4>
            <table className="table-condensed text-sm w-full">
              <thead>
                <tr>
                  <th className="text-left">Färdighet</th>
                  <th className="text-center">Värde</th>
                  <th className="text-center">Tärningar</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeSkills.map((skill) => {
                  const totalValue = skill.baseValue + skill.spentUnits
                  return (
                    <tr key={skill.name}>
                      <td>
                        {skill.name}
                        {skill.dynamicType && (
                          <span className="text-xs text-gray-500 ml-1">({skill.dynamicType})</span>
                        )}
                      </td>
                      <td className="text-center">{totalValue}</td>
                      <td className="text-center fn-dice">{skillValueToDice(totalValue)}</td>
                      <td className="text-center">
                        {skill.status && (
                          <span
                            className={`text-xs px-1 rounded ${
                              skill.status === "T"
                                ? "bg-blue-100 text-blue-800"
                                : skill.status === "I"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {SKILL_STATUS_INFO[skill.status].name}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      {/* Desensitization */}
      {Object.values(state.desensitization).some((v) => v > 0) && (
        <div className="space-y-1 text-sm">
          <h4 className="font-medium fg-eon-red">Avtrubbning</h4>
          {DESENSITIZATION_CATEGORIES.map((cat) => {
            const value = state.desensitization[cat]
            if (value === 0) return null
            return (
              <p key={cat}>
                <strong>{cat}:</strong> {value} kryss
                {DESENSITIZATION_THRESHOLDS.filter((t) => value >= t).length > 0 && (
                  <span className="text-gray-500 ml-1">
                    (tröskel {DESENSITIZATION_THRESHOLDS.filter((t) => value >= t).join(", ")})
                  </span>
                )}
              </p>
            )
          })}
        </div>
      )}

      {/* Languages */}
      {state.languages.length > 0 && (
        <div className="space-y-1 text-sm">
          <h4 className="font-medium fg-eon-red">Språk</h4>
          {state.languages.map((lang, i) => (
            <p key={i}>
              {lang.name} ({lang.type === "tal" ? "Talspråk" : "Skriftspråk"})
            </p>
          ))}
        </div>
      )}

      {/* Mysteries */}
      {state.mysteries.length > 0 && (
        <div className="space-y-1 text-sm">
          <h4 className="font-medium fg-eon-red">Mysterier</h4>
          {state.mysteries.map((m, i) => (
            <p key={i}>{m.name}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function groupSkills(skills: Eon5Skill[]): Record<string, Eon5Skill[]> {
  const groups: Record<string, Eon5Skill[]> = {}
  for (const skill of skills) {
    const group = skill.group
    if (!groups[group]) groups[group] = []
    groups[group].push(skill)
  }
  return groups
}