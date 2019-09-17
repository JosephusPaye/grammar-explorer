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
      path: 'Not implemented',
    }
    this.commonPrefixes = {
      exist: false,
      prefixes: [],
      warnings: [],
    }
    this.productions = []
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

  console.groupCollapsed(label + ' common prefix check warnings')
  checkForCommonPrefix(grammar)
  console.groupEnd(label)

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
    hasLeftRecursion(nonTerminal, nonTerminal, visited, "")
  })
}

function hasLeftRecursion(targetNonTerminal, currentNonTerminal, visited, path) {
  const newPath = path.length > 0
    ? `${path} → ${currentNonTerminal.value}`
    : currentNonTerminal.value

  const leftNonTerminals = []

  let foundLeftRecursion = currentNonTerminal.productions.some(production => {
    return production.options.some(option => {
      // Return and move to next option if this production option has
      // no elements or the first element is not a non-terminal
      if (option.elements.length === 0 || !(option.elements[0] instanceof NonTerminal)) {
        return false
      }

      const leftNonTerminal = option.elements[0]

      if (leftNonTerminal === targetNonTerminal) {
        targetNonTerminal.leftRecursion.exists = true
        targetNonTerminal.leftRecursion.path = `${newPath} → ${targetNonTerminal.value}`
        return true
      } else {
        leftNonTerminals.push(leftNonTerminal)
        return false
      }
    })
  })

  if (foundLeftRecursion) {
    return true
  }

  visited.add(currentNonTerminal)

  return leftNonTerminals
    .filter(nonTerminal => !visited.has(nonTerminal))
    .some(nonTerminal => {
      return hasLeftRecursion(targetNonTerminal, nonTerminal, visited, newPath)
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
      `Found two corresponding non-terminals that don't match, might need expansion to check prefix: ${elementA.value} and ${elementB.value}`
    )
  } else if (elementA instanceof NonTerminal) {
    warnings.push(
      `Found a non-terminal that don't match corresponding terminal, might need expansion to check prefix: ${elementA.value} (non-terminal) and ${elementB.value} (terminal)`
    )
  } else {
    warnings.push(
      `Found a non-terminal that don't match corresponding terminal, might need expansion to check prefix: ${elementB.value} (non-terminal) and ${elementA.value} (terminal)`
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
