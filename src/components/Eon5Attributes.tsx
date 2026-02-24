import classNames from "classnames"

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
  type AttributeName,
  type DistributionModel,
} from "../eon5-data"
import {
  attributeToDice,
  getFinalAttributeValue,
  getGrundrustningFromTable,
  getGrundskadaWithMod,
  getPreSpend,
  getTotalAttributePoints,
  getChunks,
  validateAttributes,
} from "../eon5-utils"
import { NumberInput } from "./ui/NumberInput"

function idFor(seed: string) {
  return seed
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "")
}

export function Eon5Attributes() {
  const state = eon5State.value

  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)
  const extraPointsId = "extra-attribute-points"

  return (
    <div className="space-y-4">
      <div className="field">
        <label className="field-label" htmlFor={extraPointsId}>
          Extra attributpoäng (händelsetabell)
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <NumberInput
            id={extraPointsId}
            name={extraPointsId}
            className="w-16"
            value={state.extraAttributePoints}
            onChange={setExtraAttributePoints}
          />
          <span className="field-hint">Total: {totalPoints} poäng</span>
        </div>
      </div>

      <ModelSelector />
      <AttributeTable />
      <DerivedValues />
    </div>
  )
}

function ModelSelector() {
  const state = eon5State.value

  return (
    <fieldset className="field">
      <legend className="field-label">Fördelningsmodell</legend>
      <div className="flex gap-4 flex-wrap">
        {(Object.keys(DISTRIBUTION_MODELS) as DistributionModel[]).map((model) => {
          const values = DISTRIBUTION_MODELS[model]
          return (
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="distributionModel"
                checked={state.distributionModel === model}
                onChange={() => setDistributionModel(model)}
                className="h-4 w-4"
              />
              {model}
              {values.length > 0 && ` [${values.join(", ")}]`}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function AttributeTable() {
  const state = eon5State.value
  const attributeViolations = validateAttributes(state)

  const isFreePoints = state.distributionModel === "Fria poäng"

  const totalPoints = getTotalAttributePoints(state.extraAttributePoints)
  const usedPoints = isFreePoints
    ? ATTRIBUTES.reduce((sum, attr) => sum + (state.attributes[attr].assignedChunk ?? 0), 0)
    : 0
  const remainingPoints = totalPoints - usedPoints

  return (
    <>
      {isFreePoints && (
        <div className="status-banner status-banner--info">
          <span className="font-medium">
            Återstående poäng: {remainingPoints} / {totalPoints}
          </span>
        </div>
      )}
      {state.distributionModel !== null && attributeViolations.length > 0 && (
        <div className="status-banner status-banner--warn space-y-1" role="status">
          <h4 className="text-sm font-medium">Regelvarningar:</h4>
          {attributeViolations.map((violation, i) => (
            <p key={`${violation.field}:${violation.message}:${i}`} className="text-sm">
              {violation.field}: {violation.message}
            </p>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <table className="table-eon table-eon--dense table-sticky-first">
          <thead>
            <tr>
              <th className="text-left">Attribut</th>
              <th className="text-center">Grundvärde</th>
              <th className="text-center">Modifierare</th>
              <th className="text-center">Bas+Mod</th>
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
              const attrId = idFor(attrName)

              const baseId = `attr-base-${attrId}`
              const modId = `attr-mod-${attrId}`
              const chunkId = `attr-chunk-${attrId}`

              const isFinal = isFreePoints || attr.assignedChunk !== null

              return (
                <tr key={attrName} className={classNames({ "bg-red-50": isInvalid })}>
                  <td className="font-medium">{attrName}</td>
                  <td className="text-center">
                    <NumberInput
                      id={baseId}
                      name={baseId}
                      className="w-14"
                      value={attr.base || undefined}
                      min={0}
                      srOnlyLabel={`${attrName} grundvärde`}
                      onChange={(e) => setAttributeBase(attrName, e)}
                    />
                  </td>
                  <td className="text-center">
                    <NumberInput
                      id={modId}
                      name={modId}
                      className="w-14"
                      value={attr.modifiers || undefined}
                      srOnlyLabel={`${attrName} modifierare`}
                      onChange={(e) => setAttributeModifiers(attrName, e)}
                    />
                  </td>
                  <td className="text-center">{preSpend}</td>
                  <td className="text-center">
                    {state.distributionModel !== null ? (
                      isFreePoints ? (
                        <NumberInput
                          id={chunkId}
                          name={chunkId}
                          className="w-16"
                          min={0}
                          srOnlyLabel={`${attrName} poäng`}
                          value={attr.assignedChunk ?? undefined}
                          onChange={(e) => setAttributeChunk(attrName, e)}
                        />
                      ) : (
                        <ChunkSelect attrName={attrName} chunkId={chunkId} />
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="text-center font-bold">
                    {isFinal ? finalVal : preSpend || "—"}
                    {isInvalid && (
                      <span
                        className="text-xs ml-1 text-red-600"
                        title={exceedsFreePointCap ? "Över max 10 fria poäng" : "Under minimum 4"}
                      >
                        !
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {isVisdom ? (
                      <span className="text-gray-500 text-sm italic">se Visdom-panel</span>
                    ) : isFinal ? (
                      <span>{attributeToDice(finalVal)}</span>
                    ) : preSpend > 0 ? (
                      <span className="text-gray-400">{attributeToDice(preSpend)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ChunkSelect(props: { attrName: AttributeName; chunkId: string }) {
  const { attrName, chunkId } = props
  const state = eon5State.value
  const chunks = state.distributionModel !== null ? getChunks(state.distributionModel) : []

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
  const availableChunkIndices = chunks.map((_, i) => i).filter((i) => !usedIndices.has(i))
  let assignedChunkIndex: number | null = null
  for (const [idx, name] of chunkAssignments) {
    if (name === attrName) {
      assignedChunkIndex = idx
      break
    }
  }
  return (
    <>
      <label className="sr-only" htmlFor={chunkId}>{`${attrName} klumpsumma`}</label>
      <select
        id={chunkId}
        name={chunkId}
        className="input-base input-compact w-20 text-center"
        value={assignedChunkIndex !== null ? String(assignedChunkIndex) : ""}
        onChange={(e) => {
          const val = e.target.value
          if (val === "") {
            unassignChunk(assignedChunkIndex)
          } else {
            assignChunk(attrName, parseInt(val))
          }
        }}
      >
        <option value="">—</option>
        {assignedChunkIndex !== null && (
          <option value={String(assignedChunkIndex)}>{chunks[assignedChunkIndex]}</option>
        )}
        {availableChunkIndices.map((idx) => (
          <option key={idx} value={String(idx)}>
            {chunks[idx]}
          </option>
        ))}
      </select>
    </>
  )
}

function DerivedValues() {
  const state = eon5State.value
  const kbAttr = state.attributes["Kroppsbyggnad"]
  const kbFinal = getFinalAttributeValue(kbAttr)
  const grundrustning = getGrundrustningFromTable(kbFinal) + state.grundrustningMod
  const grundskada = getGrundskadaWithMod(kbFinal, state.grundskadaMod)

  return (
    <div className="panel space-y-2 bg-gray-50">
      <h4 className="text-sm font-medium">Härledda värden (Kroppsbyggnad {kbFinal})</h4>
      <div className="flex gap-8 flex-wrap">
        <DerivedValueInput
          label="Grundrustning"
          id="grundrustning-mod"
          value={grundrustning}
          modValue={state.grundrustningMod}
          onChange={setGrundrustningMod}
        />
        <DerivedValueInput
          label="Grundskada"
          id="grundskada-mod"
          value={grundskada}
          modValue={state.grundskadaMod || undefined}
          onChange={setGrundskadaMod}
        />
      </div>
    </div>
  )
}
function DerivedValueInput(props: {
  label: string
  id: string
  value: string | number
  modValue?: number
  onChange: (newValue: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">{props.label}:</span>
        <span className="font-bold">{props.value}</span>
      </div>
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 flex items-center gap-1" htmlFor={props.id}>
          mod:
        </label>
        <NumberInput
          id={props.id}
          name={props.id}
          className="w-12 text-xs"
          value={props?.modValue || undefined}
          onChange={props.onChange}
        />
      </div>
    </div>
  )
}