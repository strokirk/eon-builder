export type Die = { dice: number; mod: number }

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

export function dieFormat(dice?: Die) {
  if (!dice) return undefined
  return (
    dice.dice + "T6" + (dice.mod ? (dice.mod >= 0 ? "+" : "") + dice.mod : "")
  )
}

export function joinArray(
  array: any[],
  separator = ", ",
  lastSeparator = " & ",
) {
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
