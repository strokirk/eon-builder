export type Char = {
  Attribut?: { name: string; value: number }[]
  Avtrubbning?: {
    Utsatthet: number
    Våld: number
    Övernaturligt: number
  }
  Bakgrund?: {
    effects: Effect[]
    name?: string
    number?: string
  }
  Färdigheter?: { name: string; value: number }[]
  [k: string]: any
  archetype?: { effects: Effect[]; value: string }
  environment?: { effects: Effect[]; value: string }
  events?: any[]
  notes?: { title: string; contents: string }[]
  tribe?: { effects: Effect[]; value: string }
}

export type Effect = {
  bonus?: string
  name?: string
  type: string
}

export const ATTRIBUTE = "Attribut"

export const SKILLPOINTS = "Färdighetsenheter"

export const TABELLSLAG = "Tabellslag"

export type Effects = {
  Tabellslag: { bonus: string; name: string }[]
}
