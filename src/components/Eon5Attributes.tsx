import { useEon5Dispatch, useEon5State } from "../eon5-context"
import {
  ATTRIBUTES,
  DISTRIBUTION_MODELS,
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
} from "../eon5-utils"

export function Eon5Attributes() {
  const state = useEon5State()
  const dispatch = useEon5Dispatch()

  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)

  return (
    <div className="space-y-4">
      <h3>Steg 1: Attribut</h3>

      {/* Extra attribute points modifier */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          Extra attributpoäng (händelsetabell):
        </label>
        <input
          type="number"
          className="w-16 text-center"
          value={state.extraAttributePoints}
          onChange={(e) =>
            dispatch({
              type: "SET_EXTRA_ATTRIBUTE_POINTS",
              value: parseInt(e.target.value) || 0,
            })
          }
        />
        <span className="text-sm text-gray-500">
          Total: {totalPoints} poäng
        </span>
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
  const state = useEon5State()
  const dispatch = useEon5Dispatch()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Fördelningsmodell:</label>
      <div className="flex gap-4">
        {(Object.keys(DISTRIBUTION_MODELS) as DistributionModel[]).map(
          (model) => (
            <label key={model} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="distributionModel"
                checked={state.distributionModel === model}
                onChange={() =>
                  dispatch({ type: "SET_DISTRIBUTION_MODEL", model })
                }
                className="h-4 w-4"
              />
              <span>
                {model} [{DISTRIBUTION_MODELS[model].join(", ")}]
              </span>
            </label>
          ),
        )}
      </div>
    </div>
  )
}

function AttributeTable() {
  const state = useEon5State()
  const dispatch = useEon5Dispatch()

  const chunks =
    state.distributionModel !== null
      ? getChunks(state.distributionModel)
      : []

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
  const availableChunkIndices = chunks
    .map((_, i) => i)
    .filter((i) => !usedIndices.has(i))

  return (
    <table className="table-condensed w-full">
      <thead>
        <tr>
          <th className="text-left">Attribut</th>
          <th className="text-center">Grundvärde</th>
          <th className="text-center">Modifierare</th>
          <th className="text-center">Pre-spend</th>
          <th className="text-center">Klumpsumma</th>
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
          const isInvalid =
            attr.assignedChunk !== null && finalVal < MIN_FINAL_ATTRIBUTE_VALUE
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
            <tr
              key={attrName}
              className={isInvalid ? "bg-red-50" : ""}
            >
              <td className="font-medium">{attrName}</td>
              <td className="text-center">
                <input
                  type="number"
                  className="w-14 text-center"
                  value={attr.base || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_ATTRIBUTE_BASE",
                      attribute: attrName,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </td>
              <td className="text-center">
                <input
                  type="number"
                  className="w-14 text-center"
                  value={attr.modifiers || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_ATTRIBUTE_MODIFIERS",
                      attribute: attrName,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </td>
              <td className="text-center">{preSpend}</td>
              <td className="text-center">
                {state.distributionModel !== null ? (
                  <select
                    className="w-20 text-center border rounded px-1 h-8"
                    value={
                      assignedChunkIndex !== null
                        ? String(assignedChunkIndex)
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "") {
                        // Unassign
                        if (assignedChunkIndex !== null) {
                          dispatch({
                            type: "UNASSIGN_CHUNK",
                            chunkIndex: assignedChunkIndex,
                          })
                        }
                      } else {
                        dispatch({
                          type: "ASSIGN_CHUNK",
                          attribute: attrName,
                          chunkIndex: parseInt(val),
                        })
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
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td
                className={`text-center font-bold ${
                  isInvalid
                    ? "text-red-600"
                    : isReference
                      ? "text-blue-600"
                      : ""
                }`}
              >
                {attr.assignedChunk !== null ? finalVal : preSpend || "—"}
                {isInvalid && (
                  <span className="text-xs ml-1" title="Under minimum 4">
                    !
                  </span>
                )}
              </td>
              <td className="text-center">
                {isVisdom ? (
                  <span className="text-gray-500 text-sm italic">
                    se Visdom-panel
                  </span>
                ) : attr.assignedChunk !== null ? (
                  <span className="fn-dice">
                    {attributeToDice(finalVal)}
                  </span>
                ) : preSpend > 0 ? (
                  <span className="fn-dice text-gray-400">
                    {attributeToDice(preSpend)}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function DerivedValues() {
  const state = useEon5State()
  const dispatch = useEon5Dispatch()
  const kbAttr = state.attributes["Kroppsbyggnad"]
  const kbFinal = getFinalAttributeValue(kbAttr)
  const hasKb = kbAttr.assignedChunk !== null

  const grundrustning = hasKb
    ? getGrundrustningFromTable(kbFinal) + state.grundrustningMod
    : null
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
              onChange={(e) =>
                dispatch({
                  type: "SET_GRUNDRUSTNING_MOD",
                  value: parseInt(e.target.value) || 0,
                })
              }
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
              onChange={(e) =>
                dispatch({
                  type: "SET_GRUNDSKADA_MOD",
                  value: parseInt(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  )
}
