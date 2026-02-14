import {
  assignChunk,
  eon5State,
  setAttributeBase,
  setAttributeChunk,
  setAttributeModifiers,
  setDistributionModel,
  setExtraAttributePoints,
  setGrundrustningMod,
  setGrundskadaMod,
  unassignChunk,
} from "../eon5-store"
import {
  ATTRIBUTES,
  DISTRIBUTION_MODELS,
  MAX_CHUNK_VALUE,
  MIN_FINAL_ATTRIBUTE_VALUE,
  REFERENCE_VALUE,
  type AttributeName,
  type DistributionModel,
} from "../eon5-data"
import {
  attributeToDice,
  getFinalAttributeValue,
  getGrundrustningFromTable,
  getGrundskada,
  getPreSpend,
  getTotalAttributePoints,
  getChunks,
  validateAttributes,
} from "../eon5-utils"

export function Eon5Attributes() {
  const state = eon5State.value

  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)

  return (
    <div className="space-y-4">
      <h3>Steg 1: Attribut</h3>

      {/* Extra attribute points modifier */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Extra attributpoäng (händelsetabell):</label>
        <input
          type="number"
          className="w-16 text-center"
          value={state.extraAttributePoints}
          onChange={(e) => setExtraAttributePoints(parseInt(e.target.value) || 0)}
        />
        <span className="text-sm text-gray-500">Total: {totalPoints} poäng</span>
      </div>

      {/* Distribution model selector */}
      <ModelSelector />

      {/* Attribute table */}
      <AttributeTable />

      {/* Derived values from Kroppsbyggnad */}
      <DerivedValues />
    </div>
  )
}

function ModelSelector() {
  const state = eon5State.value

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Fördelningsmodell:</label>
      <div className="flex gap-4">
        {(Object.keys(DISTRIBUTION_MODELS) as DistributionModel[]).map((model) => (
          <label key={model} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="distributionModel"
              checked={state.distributionModel === model}
              onChange={() => setDistributionModel(model)}
              className="h-4 w-4"
            />
            <span>
              {model} [{DISTRIBUTION_MODELS[model].join(", ")}]
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function AttributeTable() {
  const state = eon5State.value
  const attributeViolations = validateAttributes(state)

  const isFreePoints = state.distributionModel === "Fria poäng"
  const chunks = state.distributionModel !== null ? getChunks(state.distributionModel) : []

  // Track which chunk indices are assigned
  const chunkAssignments = new Map<number, AttributeName>()
  const usedIndices = new Set<number>()

  for (const attrName of ATTRIBUTES) {
    const chunk = state.attributes[attrName].assignedChunk
    if (chunk !== null) {
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i] === chunk && !usedIndices.has(i)) {
          chunkAssignments.set(i, attrName)
          usedIndices.add(i)
          break
        }
      }
    }
  }

  // Available (unassigned) chunk indices
  const availableChunkIndices = chunks.map((_, i) => i).filter((i) => !usedIndices.has(i))

  // Calculate remaining points for "Fria poäng" model
  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)
  const usedPoints = isFreePoints
    ? ATTRIBUTES.reduce((sum, attr) => sum + (state.attributes[attr].assignedChunk ?? 0), 0)
    : 0
  const remainingPoints = totalPoints - usedPoints

  return (
    <>
      {isFreePoints && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm font-medium">
            Återstående poäng: {remainingPoints} / {totalPoints}
          </span>
        </div>
      )}
      {state.distributionModel !== null && attributeViolations.length > 0 && (
        <div className="mb-2 p-2 border border-amber-300 rounded bg-amber-50 space-y-1">
          <h4 className="text-sm font-medium text-amber-800">Regelvarningar:</h4>
          {attributeViolations.map((violation, i) => (
            <p key={`${violation.field}:${violation.message}:${i}`} className="text-sm text-amber-700">
              {violation.field}: {violation.message}
            </p>
          ))}
        </div>
      )}
      <table className="table-condensed w-full">
        <thead>
          <tr>
            <th className="text-left">Attribut</th>
            <th className="text-center">Grundvärde</th>
            <th className="text-center">Modifierare</th>
            <th className="text-center">Pre-spend</th>
            <th className="text-center">{isFreePoints ? "Poäng" : "Klumpsumma"}</th>
            <th className="text-center">Slutvärde</th>
            <th className="text-center">Tärningar</th>
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map((attrName) => {
            const attr = state.attributes[attrName]
            const preSpend = getPreSpend(attr)
            const finalVal = getFinalAttributeValue(attr)
            const isVisdom = attrName === "Visdom"
            const exceedsFreePointCap =
              isFreePoints && (attr.assignedChunk ?? 0) > MAX_CHUNK_VALUE
            const isInvalid = finalVal < MIN_FINAL_ATTRIBUTE_VALUE || exceedsFreePointCap
            const isReference = finalVal === REFERENCE_VALUE

            // Find which chunk index this attribute has
            let assignedChunkIndex: number | null = null
            for (const [idx, name] of chunkAssignments) {
              if (name === attrName) {
                assignedChunkIndex = idx
                break
              }
            }

            return (
              <tr key={attrName} className={isInvalid ? "bg-red-50" : ""}>
                <td className="font-medium">{attrName}</td>
                <td className="text-center">
                  <input
                    type="number"
                    className="w-14 text-center"
                    value={attr.base || ""}
                    onChange={(e) => setAttributeBase(attrName, parseInt(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    className="w-14 text-center"
                    value={attr.modifiers || ""}
                    onChange={(e) => setAttributeModifiers(attrName, parseInt(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">{preSpend}</td>
                <td className="text-center">
                  {state.distributionModel !== null ? (
                    isFreePoints ? (
                      <input
                        type="number"
                        className="w-16 text-center"
                        min="0"
                        value={attr.assignedChunk ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setAttributeChunk(attrName, val)
                        }}
                      />
                    ) : (
                      <select
                        className="w-20 text-center border rounded px-1 h-8"
                        value={assignedChunkIndex !== null ? String(assignedChunkIndex) : ""}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "") {
                            // Unassign
                            if (assignedChunkIndex !== null) {
                              unassignChunk(assignedChunkIndex)
                            }
                          } else {
                            assignChunk(attrName, parseInt(val))
                          }
                        }}
                      >
                        <option value="">—</option>
                        {/* Show currently assigned chunk */}
                        {assignedChunkIndex !== null && (
                          <option value={String(assignedChunkIndex)}>
                            {chunks[assignedChunkIndex]}
                          </option>
                        )}
                        {/* Show available chunks */}
                        {availableChunkIndices.map((idx) => (
                          <option key={idx} value={String(idx)}>
                            {chunks[idx]}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td
                  className={`text-center font-bold ${
                    isInvalid ? "text-red-600" : isReference ? "text-blue-600" : ""
                  }`}
                >
                  {isFreePoints || attr.assignedChunk !== null ? finalVal : preSpend || "—"}
                  {isInvalid && (
                    <span
                      className="text-xs ml-1"
                      title={exceedsFreePointCap ? "Över max 10 fria poäng" : "Under minimum 4"}
                    >
                      !
                    </span>
                  )}
                </td>
                <td className="text-center">
                  {isVisdom ? (
                    <span className="text-gray-500 text-sm italic">se Visdom-panel</span>
                  ) : isFreePoints || attr.assignedChunk !== null ? (
                    <span className="fn-dice">{attributeToDice(finalVal)}</span>
                  ) : preSpend > 0 ? (
                    <span className="fn-dice text-gray-400">{attributeToDice(preSpend)}</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

function DerivedValues() {
  const state = eon5State.value
  const kbAttr = state.attributes["Kroppsbyggnad"]
  const kbFinal = getFinalAttributeValue(kbAttr)
  const hasKb = kbAttr.assignedChunk !== null

  const grundrustning = hasKb ? getGrundrustningFromTable(kbFinal) + state.grundrustningMod : null
  const grundskada = hasKb ? getGrundskada(kbFinal) : null

  return (
    <div className="space-y-2 p-3 border rounded bg-gray-50">
      <h4 className="text-sm font-medium">
        Härledda värden (Kroppsbyggnad {hasKb ? kbFinal : "—"})
      </h4>
      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm">Grundrustning:</span>
          <span className="font-bold">{grundrustning ?? "—"}</span>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            mod:
            <input
              type="number"
              className="w-12 text-center text-xs"
              value={state.grundrustningMod || ""}
              onChange={(e) => setGrundrustningMod(parseInt(e.target.value) || 0)}
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Grundskada:</span>
          <span className="font-bold fn-dice">{grundskada ?? "—"}</span>
          {state.grundskadaMod !== 0 && (
            <span className="text-sm">
              {state.grundskadaMod > 0 ? "+" : ""}
              {state.grundskadaMod}
            </span>
          )}
          <label className="text-xs text-gray-500 flex items-center gap-1">
            mod:
            <input
              type="number"
              className="w-12 text-center text-xs"
              value={state.grundskadaMod || ""}
              onChange={(e) => setGrundskadaMod(parseInt(e.target.value) || 0)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
