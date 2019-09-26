export function checkForLeftRecursion(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    const visited = new Set()
    hasRecursion('left', nonTerminal, nonTerminal, visited, '')
  })
}

export function checkForRightRecursion(grammar) {
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
        if (!firstElement.isNonTerminal()) {
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
        if (!lastElement.isNonTerminal()) {
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
