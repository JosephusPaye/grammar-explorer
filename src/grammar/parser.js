import { Production, ProductionOption, NonTerminal, Terminal, Epsilon } from './models'

export function parse(text, label) {
  if (text.trim().length == 0) {
    return {}
  }

  const grammar = {}

  const rules = text.trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  rules.forEach(rule => {
    const [nonTerminal, production] = rule.split('::=').map(part => part.trim())

    const options = production.split('|')
      .map(option => option.trim())
      .map(parseOption)

    appendProduction(grammar, nonTerminal, production, options)
  })

  Object.values(grammar).forEach((nonTerminal, i) => {
    nonTerminal.isStartSymbol = i === 0

    nonTerminal.allProductions().forEach(production => {
      production.elements.forEach((element, i) => {
        if (element.isNonTerminal()) {
          production.elements[i] = grammar[element.value]
        }
      })
    })
  })

  return grammar
}

function appendProduction(grammar, nonTerminalLabel, productionSource, productionOptions) {
  const nonTerminal = grammar[nonTerminalLabel] !== undefined
    ? grammar[nonTerminalLabel]
    : new NonTerminal(nonTerminalLabel)

  const production = new Production(productionSource)
  production.options = productionOptions

  nonTerminal.productions.push(production)

  grammar[nonTerminalLabel] = nonTerminal
}

function parseOption(source) {
  const option = new ProductionOption()

  source.split(' ')
    .map(element => element.trim())
    .map(parseElement)
    .forEach(elements => {
      option.elements = option.elements.concat(elements)
    })

  return option
}

function parseElement(source) {
  if (source == 'ε' || source == '\\e') {
    return [new Epsilon()]
  }

  if (source.length <= 2) {
    return [new Terminal(source)]
  }

  const elementArr = source.split('')
  const elements = []

  while (elementArr.length > 0) {
    const current = elementArr.shift()

    if (current == '<') {
      elements.push(extractNonTerminalFromElement(current, elementArr))
    } else {
      elements.push(extractTerminalFromElement(current, elementArr))
    }
  }

  return elements
}

function extractTerminalFromElement(current, elementArr) {
  let terminal = current

  while (elementArr.length > 0) {
    if (elementArr[0] == ' ') {
      return new Terminal(terminal)
    } else if (elementArr[0] == '<') {
      return new Terminal(terminal)
    }

    terminal += elementArr.shift()
  }

  return new Terminal(terminal)
}

function extractNonTerminalFromElement(current, elementArr) {
  let nonTerminal = current

  while (elementArr.length > 0) {
    if (elementArr[0] == '>') {
      nonTerminal += elementArr.shift()
      return new NonTerminal(nonTerminal)
    }

    nonTerminal += elementArr.shift()
  }

  throw new Error('GrammarParseError: incomplete non terminal: ' + nonTerminal)
}
