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
  getGrundskadaWithMod,
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

  const allSkills = [...state.skills, ...state.dynamicSkills]
  const skillGroups = groupSkills(allSkills)

  return (
    <div className="space-y-4">
      {/* Validation */}
      {errors.length > 0 && (
        <div className="status-banner status-banner--error space-y-1">
          <h4 className="text-sm font-medium">Regelbrott:</h4>
          {errors.map((e, i) => (
            <p key={i} className="text-sm">
              {e.field}: {e.message}
            </p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="status-banner status-banner--warn space-y-1">
          <h4 className="text-sm font-medium">Varningar:</h4>
          {warnings.map((e, i) => (
            <p key={i} className="text-sm">
              {e.field}: {e.message}
            </p>
          ))}
        </div>
      )}

      {/* Attributes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium fg-eon-red">Attribut</h4>
        <div className="table-wrap">
          <table className="table-eon table-eon--dense text-sm">
            <thead>
              <tr>
                <th className="text-center w-16">Tärningar</th>
                <th className="text-left">Attribut</th>
              </tr>
            </thead>
            <tbody>
              {ATTRIBUTES.map((attrName) => {
                return (
                  <tr key={attrName}>
                    <td className="text-center">
                      {attrName === "Visdom"
                        ? "—"
                        : attributeToDice(getFinalAttributeValue(state.attributes[attrName]))}
                    </td>
                    <td className="font-medium">{attrName}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Derived values */}
      <div className="space-y-1 text-sm">
        <h4 className="font-medium fg-eon-red">Härledda värden</h4>
        <p>
          <strong>Grundrustning:</strong>{" "}
          {getGrundrustningFromTable(kbFinal) + state.grundrustningMod}
        </p>
        <p>
          <strong>Grundskada:</strong>{" "}
          <span>{getGrundskadaWithMod(kbFinal, state.grundskadaMod)}</span>
        </p>
      </div>

      {/* Skills by group */}
      {Object.entries(skillGroups).map(([groupName, skills]) => {
        const activeSkills = skills.filter(
          (s) => s.baseValue + s.spentUnits > 0 || s.status !== null,
        )
        if (activeSkills.length === 0) return null

        return (
          <div key={groupName} className="space-y-1">
            <h4 className="text-sm font-medium fg-eon-red">{groupName}</h4>
            <div className="table-wrap">
              <table className="table-eon table-eon--dense text-sm">
                <thead>
                  <tr>
                    <th className="text-center w-16">Tärningar</th>
                    <th className="text-left">Färdighet</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSkills.map((skill) => {
                    const totalValue = skill.baseValue + skill.spentUnits
                    return (
                      <tr key={skill.name}>
                        <td className="text-center">{skillValueToDice(totalValue)}</td>
                        <td>
                          {skill.name}
                          {skill.dynamicType && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({skill.dynamicType})
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {skill.status && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                skill.status === "T"
                                  ? "status-banner--info"
                                  : skill.status === "I"
                                    ? "status-banner--error"
                                    : "status-banner--warn"
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