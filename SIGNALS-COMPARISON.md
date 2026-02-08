# Signals vs Context/Reducer Comparison

This document compares the **Signals prototype** (Eon5AttributesSignals) with the **original Context/Reducer** approach (Eon5Attributes).

## Side-by-Side Code Comparison

### Setting a simple value

**Context/Reducer:**
```typescript
const dispatch = useEon5Dispatch()

<input
  value={state.extraAttributePoints}
  onChange={(e) =>
    dispatch({
      type: "SET_EXTRA_ATTRIBUTE_POINTS",
      value: parseInt(e.target.value) || 0,
    })
  }
/>
```

**Signals:**
```typescript
<input
  value={attrState.extraAttributePoints.value}
  onChange={(e) =>
    attrState.setExtraAttributePoints(parseInt(e.target.value) || 0)
  }
/>
```

### Derived/Computed Values

**Context/Reducer:**
```typescript
// Computed on every render
const totalPoints = getTotalAttributePoints(state.extraAttributePoints)
const isFreePoints = state.distributionModel === "Fria poäng"
```

**Signals:**
```typescript
// Computed only when dependencies change
const totalPoints = computed(() => getTotalAttributePoints(extraAttributePoints.value))
const isFreePoints = computed(() => distributionModel.value === "Fria poäng")

// Use in component:
const total = attrState.totalPoints.value  // Auto-updates
const isFree = attrState.isFreePoints.value  // Auto-updates
```

### Complex State Updates

**Context/Reducer (in reducer file):**
```typescript
case "ASSIGN_CHUNK": {
  if (!state.distributionModel) return state
  const chunks = getChunks(state.distributionModel)
  const chunkValue = chunks[action.chunkIndex]
  if (chunkValue === undefined) return state

  return produce(state, (draft) => {
    const usedIndices = getUsedChunkIndices(state)
    const prevAttr = usedIndices.get(action.chunkIndex)
    if (prevAttr) {
      draft.attributes[prevAttr].assignedChunk = null
    }
    draft.attributes[action.attribute].assignedChunk = chunkValue
  })
}
```

**Signals:**
```typescript
export function assignChunk(attrName: AttributeName, chunkIndex: number) {
  const chunkList = chunks.value
  const chunkValue = chunkList[chunkIndex]
  if (chunkValue === undefined) return

  batch(() => {
    const assignments = chunkAssignments.value
    const prevAttr = assignments.get(chunkIndex)

    const newAttrs = { ...attributes.value }
    if (prevAttr) {
      newAttrs[prevAttr] = { ...newAttrs[prevAttr], assignedChunk: null }
    }
    newAttrs[attrName] = { ...newAttrs[attrName], assignedChunk: chunkValue }
    attributes.value = newAttrs
  })
}
```

## Lines of Code Comparison

### State Definition

**Context/Reducer:**
- `eon5-types.ts`: Type definitions (~50 lines for attributes)
- `eon5-reducer.ts`: Action handlers (~80 lines for attributes)
- `eon5-context.tsx`: Context setup (~20 lines)
- **Total: ~150 lines**

**Signals:**
- `eon5-attributes-signals.ts`: Everything in one place (~250 lines)
- Includes signals, computed values, and action functions
- **Total: ~250 lines**

*Note: Signals file is longer BUT includes all computed values that were scattered across components in the old approach.*

### Component Code

**Context/Reducer (Eon5Attributes.tsx):**
- 343 lines total
- Needs `useEon5State()` and `useEon5Dispatch()` in every component
- Many local computations repeated on every render

**Signals (Eon5AttributesSignals.tsx):**
- 204 lines total (40% smaller!)
- Direct signal access: `attrState.someSignal.value`
- Computed values cached automatically

## Key Benefits Observed

### 1. **Less Boilerplate**
- ❌ No action type definitions
- ❌ No dispatch objects with type/payload
- ❌ No Context providers needed
- ✅ Direct function calls

### 2. **Better Performance**
- Only components using changed signals re-render
- Computed values memoized automatically
- No Context re-render cascade

### 3. **Easier to Understand**
- State and logic in one file
- No jumping between types → reducer → component
- Direct cause and effect

### 4. **Computed Values Done Right**
```typescript
// Computed once, cached, auto-updates
export const remainingPoints = computed(() => {
  if (!isFreePoints.value) return 0
  const total = totalPoints.value
  const used = ATTRIBUTES.reduce(
    (sum, attr) => sum + (attributes.value[attr].assignedChunk ?? 0),
    0,
  )
  return total - used
})
```

### 5. **batch() for Multiple Updates**
```typescript
batch(() => {
  distributionModel.value = model
  attributes.value = newAttrs
  // Only one render cycle!
})
```

## Trade-offs

### What You Lose
- **Action history**: No built-in action log for debugging
- **Redux DevTools**: Can't use Redux DevTools out of the box
- **Immutability guarantees**: Easier to accidentally mutate (but signals handle it)

### What You Gain
- **Simplicity**: Way less code to achieve the same result
- **Performance**: Fine-grained reactivity
- **DX**: Less mental overhead, faster development
- **Automatic dependency tracking**: No more missing `useEffect` deps

## Migration Strategy

1. ✅ **Done**: Attributes section prototyped with signals
2. **Next**: Add skills section to signals
3. **Then**: Migrate remaining sections
4. **Finally**: Remove old Context/Reducer code

## Running the Prototype

Both versions are visible in the app:
- **"1. Attribut (Original - Context/Reducer)"** - The original implementation
- **"1b. Attribut (Signals Prototype) 🚀"** - The new signals version

They operate independently, so you can:
- Compare code side-by-side
- Test both UIs
- Verify signals behavior matches original
- Check performance differences (open React DevTools)

## Verdict

For this codebase, **signals are a clear win**:
- 40% less component code
- Better performance
- Simpler mental model
- Easier to maintain

The trade-off of losing action history is acceptable for a character creation tool (not a complex app requiring time-travel debugging).
