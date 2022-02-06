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
  tribe?: { effects: Effects; value: string }
}

export type Effect = {
  type: string
  bonus?: string
  name?: string
}

export type Effects = {
  Tabellslag: { bonus: string; name: string }[]
}
