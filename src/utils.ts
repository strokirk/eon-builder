export type Die = { dice: number; mod: number }

export function sumDice(dice: Die[]): Die {
  return dice.reduce(addDice, { dice: 0, mod: 0 })
}

export function addDice(d1: Die, d2: Die) {
  let d = d1.dice + d2.dice
  let m = d1.mod + d2.mod
  while (m >= 4) {
    d += 1
    m -= 4
  }
  while (m <= -3) {
    d -= 1
    m += 3
  }
  return {
    dice: d,
    mod: m,
  }
}

export function dieFormat(die: Die): string | undefined {
  return die.dice + "T6" + (die.mod ? (die.mod >= 0 ? "+" : "") + die.mod : "")
}

export function parseDie(text: string): Die {
  const dice = parseInt(text.split("T")[0]) || 0
  const mod = parseInt(text.split("+")[1]) || 0
  return {
    dice,
    mod,
  }
}

export function joinArray(array: any[], separator = ", ", lastSeparator = " & ") {
  if (array.length < 2) return array
  const joined: any[] = []
  array.forEach((element, i) => {
    joined.push(element)
    if (i < array.length - 2) {
      joined.push(separator)
    } else if (i < array.length - 1) {
      joined.push(lastSeparator)
    }
  })
  return joined
}

export function arrayOf(numSkillPointRows: number) {
  return Array.from({ length: numSkillPointRows })
}

export function getID(): string {
  return Math.random().toString(36).substr(2, 9)
}