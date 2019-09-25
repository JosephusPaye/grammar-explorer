let currentId = 0

function nextId() {
  return currentId++
}

export class NonTerminal {
  constructor(value = '') {
    this.id = nextId()
    this.value = value
    this.leftRecursion = {
      exists: false,
      path: 'None',
    }
    this.rightRecursion = {
      exists: false,
      path: 'None',
    }
    this.commonPrefixes = {
      exist: false,
      prefixes: [],
      warnings: [],
    }
    this.productions = []
    this.firstSet = []
    this.firstSetWarnings = []
  }
}

export class Production {
  constructor(source = '') {
    this.id = nextId()
    this.source = source
    this.options = []
  }
}

export class ProductionOption {
  constructor() {
    this.id = nextId()
    this.elements = []
  }
}

export class Terminal {
  constructor(value = '') {
    this.id = nextId()
    this.value = value
  }
}

export class Epsilon {
  constructor() {
    this.id = nextId()
    this.value = 'ε'
  }
}

export function parse(text, label) {
  if (text.trim().length == 0) {
    return {}
  }

  const grammar = {}

  const rules = text.trim().split('\n').map(rule => rule.trim())

  rules.forEach(rule => {
    const [nonTerminal, production] = rule.split('::=').map(part => part.trim())

    const options = production.split('|')
      .map(option => option.trim())
      .map(parseOption)

    appendProduction(grammar, nonTerminal, production, options)
  })

  Object.values(grammar).forEach(nonTerminal => {
    nonTerminal.productions.forEach(production => {
      production.options.forEach(option => {
        option.elements.forEach((element, i) => {
          if (element instanceof NonTerminal) {
            option.elements[i] = grammar[element.value]
          }
        })
      })
    })
  })

  checkForLeftRecursion(grammar)
  checkForRightRecursion(grammar)

  console.groupCollapsed(label + ' FIRST set warnings')
  addFirsts(grammar)
  console.groupEnd(label + ' FIRST set warnings')

  console.groupCollapsed(label + ' common prefix check warnings')
  checkForCommonPrefix(grammar)
  console.groupEnd(label + ' common prefix check warnings')

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

function checkForLeftRecursion(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    const visited = new Set()
    hasRecursion('left', nonTerminal, nonTerminal, visited, '')
  })
}

function checkForRightRecursion(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    const visited = new Set()
    hasRecursion('right', nonTerminal, nonTerminal, visited, '')
  })
}

function hasRecursion(direction, targetNonTerminal, currentNonTerminal, visited, path) {
  const newPath = path.length > 0
    ? `${path} → ${currentNonTerminal.value}`
    : currentNonTerminal.value

  const nextNonTerminals = []

  let foundRecursion = currentNonTerminal.productions.some(production => {
    return production.options.some(option => {
      // Return and move to next option if this production option has no elements
      if (option.elements.length === 0) {
        return false
      }

      if (direction === 'left') {
        const firstElement = option.elements[0]

        // Return early if the first element of this option is not a non-terminal
        if (!(firstElement instanceof NonTerminal)) {
          return false
        }

        if (firstElement === targetNonTerminal) {
            targetNonTerminal.leftRecursion.exists = true
            targetNonTerminal.leftRecursion.path = `${newPath} → ${targetNonTerminal.value}`
          return true
        } else {
          nextNonTerminals.push(firstElement)
          return false
        }
      } else {
        const lastElement = option.elements[option.elements.length - 1]

        // Return early if the last element of this option is not a non-terminal
        if (!(lastElement instanceof NonTerminal)) {
          return false
        }

        if (lastElement === targetNonTerminal) {
            targetNonTerminal.rightRecursion.exists = true
            targetNonTerminal.rightRecursion.path = `${newPath} → ${targetNonTerminal.value}`
          return true
        } else {
          nextNonTerminals.push(lastElement)
          return false
        }
      }
    })
  })

  if (foundRecursion) {
    return true
  }

  visited.add(currentNonTerminal)

  return nextNonTerminals
    .filter(nonTerminal => !visited.has(nonTerminal))
    .some(nonTerminal => {
      return hasRecursion(direction, targetNonTerminal, nonTerminal, visited, newPath)
    })
}

function checkForCommonPrefix(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    let allOptions = []

    nonTerminal.productions.forEach(production => {
      allOptions = allOptions.concat(production.options)
    })

    let hasCommonPrefixes = false
    const commonPrefixes = {}

    let allWarnings = []
    const reportedWarnings = new Set()

    allOptions.forEach(optionA => {
      return allOptions.forEach(optionB => {
        if (optionA === optionB) {
          return
        }

        const [prefix, warnings] = getCommonPrefix(optionA, optionB, reportedWarnings)

        allWarnings = allWarnings.concat(warnings)

        if (prefix) {
          hasCommonPrefixes = true
          createOrAppendPrefix(commonPrefixes, prefix)
        }
      })
    })

    if (hasCommonPrefixes) {
      nonTerminal.commonPrefixes = {
        exist: true,
        warnings: allWarnings,
        prefixes: Object.values(commonPrefixes)
          .map(prefix => {
            return {
              common: prefix.common,
              sources: prefix.sources,
            }
          })
      }
    } else {
      nonTerminal.commonPrefixes.exist = false
      nonTerminal.commonPrefixes.warnings = allWarnings
    }

    if (allWarnings.length > 0) {
      const groupLabel = `For ${nonTerminal.value} non-terminal`
      console.groupCollapsed(groupLabel)
      allWarnings.forEach(warning => console.log(warning))
      console.groupEnd(groupLabel)
    }
  })
}

function getCommonPrefix(optionA, optionB, reportedWarnings) {
  if (optionA === undefined || optionB === undefined) {
    return [null, []]
  }

  const aSource = optionA.elements.map(e => e.value).join(' ')
  const bSource = optionB.elements.map(e => e.value).join(' ')
  let common = ''

  const warnings = []

  for (let i = 0; i < optionA.elements.length; i++) {
    if (i >= optionB.elements.length) {
      break
    }

    const elementA = optionA.elements[i]
    const elementB = optionB.elements[i]

    if (elementA.value === elementB.value) {
      common += elementA.value + ' '
    } else {
      maybeAddWarning(elementA, elementB, reportedWarnings, warnings)
      break
    }
  }

  if (!common) {
    return [null, warnings]
  }

  const sources = [aSource, bSource]

  return [{ common, sources }, warnings]
}

function maybeAddWarning(elementA, elementB, reportedWarnings, warnings) {
  if (!(elementA instanceof NonTerminal) && !(elementB instanceof NonTerminal)) {
    return
  }

  if (reportedWarnings.has(`${elementA.value}:${elementB.value}`) || reportedWarnings.has(`${elementB.value}:${elementA.value}`)) {
    return
  }

  if (elementA instanceof Epsilon || elementB instanceof Epsilon) {
    return
  }

  if (elementA instanceof NonTerminal && elementB instanceof NonTerminal) {
    warnings.push(
      `${elementA.value} and ${elementB.value}: non-terminals don't match, might need expansion to check prefix`
    )
  } else if (elementA instanceof NonTerminal) {
    warnings.push(
      `${elementA.value} and ${elementB.value}: non-terminal and terminal don't match, might need expansion to check prefix`
    )
  } else {
    warnings.push(
      `${elementB.value} and ${elementA.value}: non-terminal and terminal don't match, might need expansion to check prefix`
    )
  }

  reportedWarnings.add(`${elementA.value}:${elementB.value}`)
}

function createOrAppendPrefix(allPrefixes, newPrefix) {
  const prefixList = allPrefixes[newPrefix.common] || {
    common: newPrefix.common,
    sources: []
  }

  newPrefix.sources
    .filter(newSource => prefixList.sources.includes(newSource) === false)
    .forEach(newSource => {
      prefixList.sources.push(newSource)
    })

  allPrefixes[newPrefix.common] = prefixList
}

function addFirsts(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    nonTerminal.firstSet = Array.from(firstOfElement(nonTerminal))

    if (nonTerminal.firstSetWarnings.length > 0) {
      const label = `FIRST of ${nonTerminal.value}`
      console.groupCollapsed(label)
      nonTerminal.firstSetWarnings.forEach(warning => console.log(warning))
      console.groupEnd(label)
    }
  })
}

/**
 * Compute the FIRST set of the given element.
 * Algorithm adapted from https://www.jambe.co.nz/UNI/FirstAndFollowSets.html
 */
function firstOfElement(element) {
  // Defer to firstOfList if we have a list of elements Y1...Yk
  if (Array.isArray(element)) {
    return firstOfList(element)
  }

  // FIRST of epsilon is just { epsilon }
  if (element instanceof Epsilon) {
    return new Set([element])
  }

  // FIRST of a terminal is just { terminal }
  if (element instanceof Terminal) {
    return new Set([element])
  }

  // Add a warning and abort if the non terminal is left recursive
  if (element.leftRecursion.exists) {
    const warning = `Could not calculate FIRST of ${element.value} as it's left recursive`
    element.firstSetWarnings = [warning]
    return new Set()
  }

  const firstSet = new Set();
  const productions = allProductions(element)

  // Looking at each production...
  productions.forEach(production => {
    // If the production has only one element which is epsilon, add epsilon to the first set
    if (production.elements.length === 1 && production.elements[0] instanceof Epsilon) {
      firstSet.add(production.elements[0])
    }
    // Otherwise, compute the first of the list of production elements and add everything
    // in that to the first set constructed for the non terminal so far
    else {
      firstOfList(production.elements).forEach(member => {
        firstSet.add(member)
      })
    }
  })

  return firstSet
}

/**
 * Compute the FIRST set of a list of elements Y1..Yk
 * Algorithm adapted from https://www.jambe.co.nz/UNI/FirstAndFollowSets.html
 */
function firstOfList(elements) {
  // If there's only one element in the list, defer to firstOfElement
  if (elements.length === 0) {
    return firstOfElement(elements[0])
  }

  // Get FIRST(Y1)
  const firstOfStartingElement = firstOfElement(elements[0])

  // If FIRST(Y1) doesn't include epsilon, then FIRST(Y1..Yk) is just FIRST(Y1)
  if (!hasEpsilon(firstOfStartingElement)) {
    return firstOfStartingElement
  }

  // Otherwise we calculate FIRST(Y1..Yk)
  let firstSet = new Set()

  // Add everything in FIRST(Y1) except epsilon
  firstOfStartingElement.forEach(member => {
    if (! (member instanceof Epsilon)) {
      firstSet.add(member)
    }
  })

  // Add everything in FIRST(Y2..Yk)
  firstOfList(elements.slice(1)).forEach(member => {
    firstSet.add(member)
  })

  // If the individual first FIRST(Y1), FIRST(Y2), ..., FIRST(Yk) all contain epsilon
  // then add epsilon to FIRST(Y1Y2..Yk) as well
  if (!hasEpsilon(firstSet) && elements.map(firstOfElement).every(hasEpsilon)) {
    firstSet.add(new Epsilon())
  }

  return firstSet
}

/**
 * Check if the given set contains Epsilon
 */
function hasEpsilon(set) {
  return Array.from(set).some(member => member instanceof Epsilon)
}

/**
 * Normalize all ProductionOptions for the given non-terminal
 * into a flat list of options (i.e. productions)
 */
function allProductions(nonTerminal) {
  let options = []

  nonTerminal.productions.forEach(production => {
    options = options.concat(production.options)
  })

  return options
}

export const CD19 = `
<program> ::= CD19 <id> <consts> <types> <arrays> <funcs> <mainbody>
<consts> ::= constants <initlist> | ε
<initlist> ::= <init> | <init> , <initlist>
<init> ::= <id> = <expr>
<types> ::= types <typelist> | ε
<arrays> ::= arrays <arrdecls> | ε
<funcs> ::= <func> <funcs> | ε
<mainbody> ::= main <slist> begin <stats> end CD19 <id>
<slist> ::= <sdecl> | <sdecl> , <slist>
<typelist> ::= <type> <typelist> | <type>
<type> ::= <structid> is <fields> end
<type> ::= <typeid> is array [ <expr> ] of <structid>
<fields> ::= <sdecl> | <sdecl> , <fields>
<sdecl> ::= <id> : <stype>
<arrdecls> ::= <arrdecl> | <arrdecl> , <arrdecls>
<arrdecl> ::= <id> : <typeid>
<func> ::= function <id> ( <plist> ) : <rtype> <funcbody>
<rtype> ::= <stype> | void
<plist> ::= <params> | ε
<params> ::= <param> , <params> | <param>
<param> ::= <sdecl> | <arrdecl> | const <arrdecl>
<funcbody> ::= <locals> begin <stats> end
<locals> ::= <dlist> | ε
<dlist> ::= <decl> | <decl> , <dlist>
<decl> ::= <sdecl> | <arrdecl>
<stype> ::= integer | real | boolean
<stats> ::= <stat> ; <stats> | <strstat> <stats> | <stat>; | <strstat>
<strstat> ::= <forstat> | <ifstat>
<stat> ::= <repstat> | <asgnstat> | <iostat> | <callstat> | <returnstat>
<forstat> ::= for ( <asgnlist> ; <bool> ) <stats> end
<repstat> ::= repeat ( <asgnlist> ) <stats> until <bool>
<asgnlist> ::= <alist> | ε
<alist> ::= <asgnstat> | <asgnstat> , <alist>
<ifstat> ::= if ( <bool> ) <stats> end
<ifstat> ::= if ( <bool> ) <stats> else <stats> end
<asgnstat> ::= <var> <asgnop> <bool>
<asgnop> ::= = | += | -= | *= | /=
<iostat> ::= input <vlist> | print <prlist> | printline <prlist>
<callstat> ::= <id> ( <elist> ) | <id> ( )
<returnstat> ::= return | return <expr>
<vlist> ::= <var> , <vlist> | <var>
<var> ::= <id> | <id>[<expr>] . <id>
<elist> ::= <bool> , <elist> | <bool>
<bool> ::= <bool> <logop> <rel> | <rel>
<rel> ::= not <expr> <relop> <expr> | <expr> <relop> <expr> | <expr>
<logop> ::= and | or | xor
<relop> ::= == | != | > | <= | < | >=
<expr> ::= <expr> + <fact> | <expr> - <fact> | <fact>
<fact> ::= <fact> * <term> | <fact> / <term> | <fact> % <term> | <term>
<term> ::= <term> ^ <exponent> | <exponent>
<exponent> ::= <var> | <intlit> | <reallit> | <fncall> | true | false
<exponent> ::= ( <bool> )
<fncall> ::= <id> ( <elist> ) | <id> ( )
<prlist> ::= <printitem> , <prlist> | <printitem>
<printitem> ::= <expr> | <string>
<id> ::= id
<structid> ::= id
<typeid> ::= id
<intlit> ::= 42
<reallit> ::= 0.0000001000000100000110
<string> ::= "oh hai mark"
`.trim()

function test() {
  const g = `
<a> ::= <b> <a> | a | ε
<b> ::= <c> | b | ε
<c> ::= c | ε | <d>
<d> ::= d | <a> d | <b> d | <e> | ε
<e> ::= a <e> | e | ε
`.trim()

  console.log('example grammar source:')
  console.log(g)

  const grammar = parse(g, 'example grammar')

  console.log('example grammar parsed:')
  console.log(grammar)
}

test()
