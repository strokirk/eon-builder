import { ATTRIBUTES, DISTRIBUTION_MODELS, type DistributionModel } from "../eon5-data"
import * as attrState from "../eon5-attributes-signals"

export function Eon5AttributesSignals() {
  return (
    <div className="space-y-4">
      <h3>Steg 1: Attribut</h3>

      {/* Extra attribute points modifier */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Extra attributpoäng (händelsetabell):</label>
        <input
          type="number"
          className="w-16 text-center"
          value={attrState.extraAttributePoints.value}
          onChange={(e) =>
            attrState.setExtraAttributePoints(parseInt(e.target.value) || 0)
          }
        />
        <span className="text-sm text-gray-500">
          Total: {attrState.totalPoints.value} poäng
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
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Fördelningsmodell:</label>
      <div className="flex gap-4">
        {(Object.keys(DISTRIBUTION_MODELS) as DistributionModel[]).map((model) => (
          <label key={model} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="distributionModel"
              checked={attrState.distributionModel.value === model}
              onChange={() => attrState.setDistributionModel(model)}
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
  const isFree = attrState.isFreePoints.value
  const chunkList = attrState.chunks.value
  const available = attrState.availableChunkIndices.value
  const remaining = attrState.remainingPoints.value
  const total = attrState.totalPoints.value

  return (
    <>
      {isFree && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm font-medium">
            Återstående poäng: {remaining} / {total}
          </span>
        </div>
      )}
      <table className="table-condensed w-full">
        <thead>
          <tr>
            <th className="text-left">Attribut</th>
            <th className="text-center">Grundvärde</th>
            <th className="text-center">Modifierare</th>
            <th className="text-center">Pre-spend</th>
            <th className="text-center">{isFree ? "Poäng" : "Klumpsumma"}</th>
            <th className="text-center">Slutvärde</th>
            <th className="text-center">Tärningar</th>
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map((attrName) => {
            const attr = attrState.attributes.value[attrName]
            const preSpend = attrState.getAttributePreSpend(attrName)
            const finalVal = attrState.getAttributeFinalValue(attrName)
            const isVisdom = attrName === "Visdom"
            const isInvalid = attrState.isAttributeInvalid(attrName)
            const isReference = attrState.isAttributeReference(attrName)
            const assignedChunkIndex = attrState.getAssignedChunkIndex(attrName)

            return (
              <tr key={attrName} className={isInvalid ? "bg-red-50" : ""}>
                <td className="font-medium">{attrName}</td>
                <td className="text-center">
                  <input
                    type="number"
                    className="w-14 text-center"
                    value={attr.base || ""}
                    onChange={(e) =>
                      attrState.setAttributeBase(attrName, parseInt(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    className="w-14 text-center"
                    value={attr.modifiers || ""}
                    onChange={(e) =>
                      attrState.setAttributeModifiers(attrName, parseInt(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="text-center">{preSpend}</td>
                <td className="text-center">
                  {attrState.distributionModel.value !== null ? (
                    isFree ? (
                      <input
                        type="number"
                        className="w-16 text-center"
                        min="0"
                        value={attr.assignedChunk ?? ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          attrState.setAttributeChunk(attrName, val)
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
                              attrState.unassignChunk(assignedChunkIndex)
                            }
                          } else {
                            attrState.assignChunk(attrName, parseInt(val))
                          }
                        }}
                      >
                        <option value="">—</option>
                        {/* Show currently assigned chunk */}
                        {assignedChunkIndex !== null && (
                          <option value={String(assignedChunkIndex)}>
                            {chunkList[assignedChunkIndex]}
                          </option>
                        )}
                        {/* Show available chunks */}
                        {available.map((idx) => (
                          <option key={idx} value={String(idx)}>
                            {chunkList[idx]}
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
                  {isFree || attr.assignedChunk !== null ? finalVal : preSpend || "—"}
                  {isInvalid && (
                    <span className="text-xs ml-1" title="Under minimum 4">
                      !
                    </span>
                  )}
                </td>
                <td className="text-center">
                  {isVisdom ? (
                    <span className="text-gray-500 text-sm italic">se Visdom-panel</span>
                  ) : isFree || attr.assignedChunk !== null ? (
                    <span className="fn-dice">{attrState.getAttributeDice(attrName)}</span>
                  ) : preSpend > 0 ? (
                    <span className="fn-dice text-gray-400">
                      {attrState.getAttributeDice(attrName)}
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
    </>
  )
}

function DerivedValues() {
  const kbFinal = attrState.kroppsbyggnadFinal.value
  const hasKb = attrState.hasKroppsbyggnad.value
  const gr = attrState.grundrustning.value
  const gs = attrState.grundskada.value

  return (
    <div className="space-y-2 p-3 border rounded bg-gray-50">
      <h4 className="text-sm font-medium">
        Härledda värden (Kroppsbyggnad {hasKb ? kbFinal : "—"})
      </h4>
      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm">Grundrustning:</span>
          <span className="font-bold">{gr ?? "—"}</span>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            mod:
            <input
              type="number"
              className="w-12 text-center text-xs"
              value={attrState.grundrustningMod.value || ""}
              onChange={(e) =>
                attrState.setGrundrustningMod(parseInt(e.target.value) || 0)
              }
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Grundskada:</span>
          <span className="font-bold fn-dice">{gs ?? "—"}</span>
          {attrState.grundskadaMod.value !== 0 && (
            <span className="text-sm">
              {attrState.grundskadaMod.value > 0 ? "+" : ""}
              {attrState.grundskadaMod.value}
            </span>
          )}
          <label className="text-xs text-gray-500 flex items-center gap-1">
            mod:
            <input
              type="number"
              className="w-12 text-center text-xs"
              value={attrState.grundskadaMod.value || ""}
              onChange={(e) =>
                attrState.setGrundskadaMod(parseInt(e.target.value) || 0)
              }
            />
          </label>
        </div>
      </div>
    </div>
  )
}
