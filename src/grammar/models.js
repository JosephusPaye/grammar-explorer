let currentId = 0

function nextId() {
  return currentId++
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

export class Element {
  constructor() {
    this.id = nextId()
  }

  equals(otherElement) {
    if (this instanceof Epsilon) {
      return otherElement instanceof Epsilon
    }

    return this.value === otherElement.value
  }

  isTerminal() {
    return this instanceof Terminal
  }

  isNonTerminal() {
    return this instanceof NonTerminal
  }

  isEpsilon() {
    return this instanceof Epsilon
  }
}

export class NonTerminal extends Element {
  constructor(value = '') {
    super()

    this.value = value
    this.productions = []
    this.isStartSymbol = false

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

    this.firstSet = []
    this.firstSetWarnings = []

    this.followSet = []
    this.followSetWarnings = []
  }

  allProductions() {
    let productions = []

    this.productions.forEach(production => {
      productions = productions.concat(production.options)
    })

    return productions
  }
}

export class Terminal extends Element {
  constructor(value = '') {
    super()
    this.value = value
  }
}

export class Epsilon extends Element {
  constructor() {
    super()
    this.value = 'ε'
  }
}
