import { EnhancedSet } from './enhanced-set';

let currentId = 0;

function nextId() {
  return currentId++;
}

export class Production {
  constructor(source = '') {
    this.id = nextId();
    this.source = source;
    this.options = [];
  }
}

window.GProduction = Production;

export class ProductionOption {
  constructor() {
    this.id = nextId();
    this.elements = [];
  }
}

window.GProductionOption = ProductionOption;

export class Element {
  constructor() {
    this.id = nextId();
  }

  equals(otherElement) {
    if (this instanceof Epsilon) {
      return otherElement instanceof Epsilon;
    }

    return this.value === otherElement.value;
  }

  isTerminal() {
    return this instanceof Terminal;
  }

  isNonTerminal() {
    return this instanceof NonTerminal;
  }

  isEpsilon() {
    return this instanceof Epsilon;
  }
}

window.GElement = Element;

export class NonTerminal extends Element {
  constructor(value = '') {
    super();

    this.value = value;
    this.productions = [];
    this.isStartSymbol = false;
    this.isNullable = false;

    this.leftRecursion = {
      exists: false,
      path: 'None',
    };

    this.rightRecursion = {
      exists: false,
      path: 'None',
    };

    this.commonPrefixes = {
      exist: false,
      prefixes: [],
      warnings: [],
    };

    this.firstSet = new EnhancedSet();
    this.firstSetWarnings = [];

    this.followSet = new EnhancedSet();
    this.followSetWarnings = [];
  }

  allProductions() {
    let productions = [];

    this.productions.forEach((production) => {
      productions = productions.concat(production.options);
    });

    return productions;
  }
}

window.GNonTerminal = NonTerminal;

export class Terminal extends Element {
  constructor(value = '') {
    super();
    this.value = value;
  }
}

window.GTerminal = Terminal;

export class Epsilon extends Element {
  constructor() {
    super();
    this.value = 'ε';
  }
}

window.GEpsilon = Epsilon;
