import { Epsilon } from '../models'

const epsilon = new Epsilon()

export function checkForNullable(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    nonTerminal.isNullable = nonTerminal.firstSet.has(epsilon)
  })
}
