import { EnhancedSet } from '../enhanced-set'
import { Epsilon, Terminal } from '../models'

const epsilon = new Epsilon()
const endOfInput = new Terminal('$')

export function addFirsts(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    nonTerminal.firstSet = firstOfElement(nonTerminal)

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
  if (element.isEpsilon()) {
    return new EnhancedSet([element])
  }

  // FIRST of a terminal is just { terminal }
  if (element.isTerminal()) {
    return new EnhancedSet([element])
  }

  // Add a warning and abort if the non terminal is left recursive
  if (element.leftRecursion.exists) {
    const warning = `Could not calculate FIRST of ${element.value} as it's left recursive`
    element.firstSetWarnings = [warning]
    return new EnhancedSet()
  }

  const firstSet = new EnhancedSet()

  // Looking at each production...
  element.allProductions().forEach(production => {
    // If the production has only one element which is epsilon, add epsilon to the first set
    if (production.elements.length === 1 && production.elements[0] && production.elements[0].isEpsilon()) {
      firstSet.add(production.elements[0])
    }
    // Otherwise, compute the first of the list of production elements and add everything
    // in that to the first set constructed for the non terminal so far
    else {
      firstSet.addAll(firstOfList(production.elements))
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
  if (!firstOfStartingElement.has(epsilon)) {
    return firstOfStartingElement
  }

  // Otherwise we calculate FIRST(Y1..Yk)
  let firstSet = new EnhancedSet()

  // Add everything in FIRST(Y1) except epsilon
  firstSet.addAll(firstOfStartingElement.except(epsilon))

  // Add everything in FIRST(Y2..Yk)
  firstSet.addAll(elements.slice(1))

  // If the individual first FIRST(Y1), FIRST(Y2), ..., FIRST(Yk) all contain epsilon
  // then add epsilon to FIRST(Y1Y2..Yk) as well
  if (!firstSet.has(epsilon) && elements.map(firstOfElement).every(set => set.has(epsilon))) {
    firstSet.add(epsilon)
  }

  return firstSet
}

export function addFollows(grammar) {
  const grammarProductions = Object.values(grammar)
    .map(nonTerminal => {
      return nonTerminal.allProductions()
        .map(production => {
          return {
            nonTerminal,
            elements: production.elements
          }
        })
    })
    .flat()

  Object.values(grammar).forEach(nonTerminal => {
    // FOLLOW of the start symbol includes $
    if (nonTerminal.isStartSymbol) {
      nonTerminal.followSet.add(endOfInput)
    }

    addFollow(nonTerminal, grammarProductions, 1)
  })

  Object.values(grammar).forEach(nonTerminal => {
    addFollow(nonTerminal, grammarProductions, 2)
  })
}

function addFollow(nonTerminal, grammarProductions, pass) {
  // For the first pass, we're adding FIRST sets
  if (pass === 1) {
    grammarProductions.forEach(production => {
      const location = locateElement(production.elements, nonTerminal)

      if (!location.found) {
        return
      }

      if (location.hasElementsAfter) {
        nonTerminal.followSet.addAll(
          firstOfListFromComputed(production.elements.slice(location.index + 1))
            .except(epsilon)
        )
      }
    })
  } else if (pass === 2) {
    grammarProductions.forEach(production => {
      const location = locateElement(production.elements, nonTerminal)

      if (!location.found) {
        return
      }

      if (!location.hasElementsAfter || producesEpsilon(production.elements.slice(location.index + 1))) {
        nonTerminal.followSet.addAll(production.nonTerminal.followSet)
      }
    })
  }
}

function firstOfElementFromComputed(element) {
  if (Array.isArray(element)) {
    return firstOfListFromComputed(element)
  }

  // FIRST of epsilon is just { epsilon }
  if (element.isEpsilon()) {
    return new EnhancedSet([element])
  }

  // FIRST of a terminal is just { terminal }
  if (element.isTerminal()) {
    return new EnhancedSet([element])
  }

  // We have a non-terminal, simply return its FIRST set
  return element.firstSet
}

function firstOfListFromComputed(elements) {
  const firstSet = new EnhancedSet()

  let allElementsHaveEpsilon = elements.length > 0

  for (let i = 0; i < elements.length; i++) {
    const first = firstOfElementFromComputed(elements[i])

    firstSet.addAll(first.except(epsilon))

    if (!first.has(epsilon)) {
      allElementsHaveEpsilon = false
      break
    }
  }

  if (allElementsHaveEpsilon) {
    firstSet.add(epsilon)
  }

  return firstSet
}

function locateElement(list, targetElement) {
  const result = {
    index: list.findIndex(element => element.equals(targetElement)),
    element: undefined,
    found: false,
    hasElementsBefore: false,
    hasElementsAfter: false,
  }

  if (result.index === -1) {
    return result
  }

  result.found = true
  result.element = list[result.index]
  result.hasElementsBefore = result.index > 0
  result.hasElementsAfter = result.index < (list.length - 1)

  return result
}

function producesEpsilon(elements) {
  return firstOfListFromComputed(elements).has(epsilon)
}
