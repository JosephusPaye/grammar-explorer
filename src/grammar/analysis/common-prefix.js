export function checkForCommonPrefix(grammar) {
  Object.values(grammar).forEach(nonTerminal => {
    let productions = nonTerminal.allProductions()

    let hasCommonPrefixes = false
    const commonPrefixes = {}

    let allWarnings = []
    const reportedWarnings = new Set()

    productions.forEach(productionA => {
      return productions.forEach(productionB => {
        if (productionA === productionB) {
          return
        }

        const [prefix, warnings] = getCommonPrefix(productionA, productionB, reportedWarnings)

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

function getCommonPrefix(productionA, productionB, reportedWarnings) {
  if (productionA === undefined || productionB === undefined) {
    return [null, []]
  }

  const aSource = productionA.elements.map(e => e.value).join(' ')
  const bSource = productionB.elements.map(e => e.value).join(' ')
  let common = ''

  const warnings = []

  for (let i = 0; i < productionA.elements.length; i++) {
    if (i >= productionB.elements.length) {
      break
    }

    const elementA = productionA.elements[i]
    const elementB = productionB.elements[i]

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
  if (!(elementA.isNonTerminal()) && !(elementB.isNonTerminal())) {
    return
  }

  if (reportedWarnings.has(`${elementA.value}:${elementB.value}`) || reportedWarnings.has(`${elementB.value}:${elementA.value}`)) {
    return
  }

  if (elementA.isEpsilon() || elementB.isEpsilon()) {
    return
  }

  if (elementA.isNonTerminal() && elementB.isNonTerminal()) {
    warnings.push(
      `${elementA.value} and ${elementB.value}: non-terminals don't match, might need expansion to check prefix`
    )
  } else if (elementA.isNonTerminal()) {
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
