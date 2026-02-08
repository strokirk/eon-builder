# Eon Builder - Project Guide

## Project Overview

Eon Builder is a character creation tool for the **Eon 5 RPG system** (Swedish tabletop RPG). It provides an interactive interface for building characters by managing attributes, skills, languages, mysteries, and other character properties according to Eon 5 rules.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm (use `pnpm` for all package operations)
- **Styling**: Tailwind CSS with Sass
- **State Management**: React Context + useReducer with **immer** for immutable updates
- **Testing**: Jest with React Testing Library
- **Linting**: oxlint (from oxc project)
- **Formatting**: oxfmt (from oxc project)

## Code Organization

### Core State Management Files

- **`src/eon5-types.ts`**: All TypeScript type definitions
  - `Eon5CharState`: Main character state interface
  - `Eon5Action`: Discriminated union of all reducer actions
  - Skill, Attribute, Language, Mystery types

- **`src/eon5-data.ts`**: Static game data and constants
  - `ATTRIBUTES`: List of all character attributes
  - `SKILL_STATUS_INFO`: Skill status types (T=Tränad, I=Inkompetent, B=Begåvad)
  - `MAX_SKILL_VALUE`: Maximum skill value constant
  - Attribute names and other game constants

- **`src/eon5-reducer.ts`**: State reducer using immer's `produce`
  - All state updates go through this reducer
  - Uses immer for clean, mutable-style updates on draft state
  - Handles attribute assignment, skill updates, language/mystery management, etc.

- **`src/eon5-utils.ts`**: Utility functions
  - `getChunks()`: Gets attribute distribution chunks based on model
  - Other helper functions for state calculations

### Components Structure

- **`src/components/Eon5Attributes.tsx`**: Attribute management UI
- **`src/components/Eon5Skills.tsx`**: Skill allocation UI
- **Other components**: Various UI components for character creation steps

### Key State Management Pattern

The app uses React Context with useReducer + immer:

```typescript
// Dispatching actions
dispatch({ type: "SET_ATTRIBUTE_BASE", attribute: "STY", value: 10 })

// In reducer (using immer)
return produce(state, (draft) => {
  draft.attributes[action.attribute].base = action.value
})
```

**Important**: When modifying the reducer, use direct mutations on `draft` objects. Immer handles immutability automatically.

## Character Creation Concepts

### Attributes
- Base attributes like STY (Styrka), TÅL (Tålighet), etc.
- **Distribution Models**: Different ways to allocate starting attribute values
- **Chunks**: Pre-defined value groups that can be assigned to attributes
- **Assigned Chunks**: Tracks which chunk is assigned to which attribute

### Skills
- **Status types**:
  - `null`: Normal skill (max value from constant)
  - `T`: Tränad (trained) - different max value
  - `I`: Inkompetent (incompetent) - cannot use skill
  - `B`: Begåvad (gifted) - special status
- **Base values**: Some skills can have base value of 1
- **Spent units**: Points allocated to improve skills
- **Dynamic skills**: User-added custom skills

## Development Guidelines

### When Modifying State
1. **Always update through the reducer** - never mutate state directly in components
2. **Use immer patterns** - write code that looks like mutation on the `draft` object
3. **Early returns** in reducer cases: use `return` (no value) to keep original state unchanged
4. **Complete replacements**: return the new state directly (e.g., `LOAD_STATE`)

### Scripts
- `pnpm start` - Start dev server
- `pnpm build` - TypeScript compilation + Vite build
- `pnpm run lint:js` - Run oxlint on src/
- `pnpm run format` - Format code with oxfmt
- `pnpm test` - Run Jest tests

## Common Tasks

### Adding a New Action Type
1. Add action type to `Eon5Action` union in `eon5-types.ts`
2. Add case handler in `eon5Reducer` in `eon5-reducer.ts`
3. Use immer's draft pattern for state updates
4. Update components to dispatch the new action

### Adding New Character Properties
1. Add property to `Eon5CharState` in `eon5-types.ts`
2. Add initialization in the initial state
3. Add reducer cases for updating the property
4. Create UI components as needed

## Important Notes

- This is a **Swedish RPG** - many terms are in Swedish
- The codebase uses **pnpm**, not npm or yarn
- State management uses **immer** - leverage it for cleaner reducer code
- Skills have fairly complex logic around status, base values, and unit allocation