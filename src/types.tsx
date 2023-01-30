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
  attributes?: { [k: string]: any }
}

export type Effect = {
  bonus?: string
  name?: string
  type: EffectType
}

export type Effects = {
  Tabellslag: { bonus: string; name: string }[]
}

export enum EffectType {
  SKILLPOINTS = "Färdighetsenheter",
  TABELLSLAG = "Tabellslag",
  ATTRIBUTE = "Attribut",
  ANNAT = "Annat",
}
