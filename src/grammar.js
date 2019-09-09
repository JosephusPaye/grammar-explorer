let currentId = 0;

function nextId() {
  return currentId++;
}

export class NonTerminal {
  constructor(value = '') {
    this.id = nextId()
    this.value = value
    this.isLeftRecursive = false
    this.hasCommonPrefix = false
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

export function parse(text) {
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
  });

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
  checkForCommonPrefix(grammar)

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

  const elementArr = source.split('');
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
  let nonTerminal = current;

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
        targetNonTerminal.isLeftRecursive = true
        targetNonTerminal.leftRecursionPath = `${newPath} → ${targetNonTerminal.value}`
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
    nonTerminal.productions.some(productionA => {
      return nonTerminal.productions.some(productionB => {
        if (productionA === productionB) {
          return
        }

        const prefix = getCommonPrefix(productionA, productionB)

        if (prefix) {
          nonTerminal.hasCommonPrefix = true
          nonTerminal.commonPrefix = prefix
          return true
        }
      })
    })
  })
}

function getCommonPrefix(productionA, productionB) {
  const firstOptionA = productionA.options[0]
  const firstOptionB = productionB.options[0]

  if (firstOptionA === undefined || firstOptionB === undefined) {
    return ''
  }

  const aSource = firstOptionA.elements.map(e => e.value).join(' ')
  const bSource = firstOptionB.elements.map(e => e.value).join(' ')
  let common = ''

  for (let i = 0; i < firstOptionA.elements.length; i++) {
    if (i >= firstOptionB.elements.length) {
      break;
    }

    const elementA = firstOptionA.elements[i]
    const elementB = firstOptionB.elements[i]

    if (elementA.value === elementB.value) {
      common += elementA.value + ' '
    } else {
      break
    }
  }

  if (!common) {
    return null
  }

  const all = [aSource, bSource]

  return {
    all,
    common,
    html: all.map(source => {
      return source.replace(common.trim(), `<mark>${escapeTags(common.trim())}</mark>`)
    })
  }
}

export function escapeTags(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
<intlit> ::= \\d
<reallit> ::= \\d.\\d
<string> ::= ".*"
`.trim()


function test() {
  const g = `
<a> ::= <b> <a> | a | ε
<b> ::= <c> | b | ε
<c> ::= c | ε | <d>
<d> ::= d | <a> d | <b> d | <e> | ε
<e> ::= a <e> | e | ε
`.trim();

  const grammar = parse(g);

  console.log('example grammar:');
  console.log(g);
  console.log(grammar);
}

test();
