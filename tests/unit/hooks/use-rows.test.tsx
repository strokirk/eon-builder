import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useRows } from "../../../src/hooks/use-rows"

describe("useRows", () => {
  it("creates a default row when no initial values are provided", () => {
    const { result } = renderHook(() => useRows<{ title?: string }>())

    expect(result.current.rows).toHaveLength(1)
    expect(result.current.getValues()).toEqual([{}])
  })

  it("supports update, add and remove operations", () => {
    const { result } = renderHook(() => useRows([{ title: "first" }]))
    const firstId = result.current.rows[0].id

    act(() => {
      result.current.updateRow(firstId, { title: "updated" })
    })

    expect(result.current.getValues()).toEqual([{ title: "updated" }])

    act(() => {
      result.current.addRow()
    })

    expect(result.current.rows).toHaveLength(2)

    act(() => {
      result.current.removeRow(firstId)
    })

    expect(result.current.rows).toHaveLength(1)
  })
})
