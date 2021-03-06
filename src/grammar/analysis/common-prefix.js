import { Epsilon } from '../models';

const epsilon = new Epsilon();

export function checkForCommonPrefix(grammar) {
  Object.values(grammar).forEach((nonTerminal) => {
    let productions = nonTerminal.allProductions();

    let hasCommonPrefixes = false;
    const commonPrefixes = {};

    let allWarnings = [];
    const reportedWarnings = new Set();

    productions.forEach((productionA) => {
      return productions.forEach((productionB) => {
        if (productionA === productionB) {
          return;
        }

        const [prefix, warnings] = getCommonPrefix(
          productionA,
          productionB,
          reportedWarnings
        );

        allWarnings = allWarnings.concat(warnings);

        if (prefix) {
          hasCommonPrefixes = true;
          createOrAppendPrefix(commonPrefixes, prefix);
        }
      });
    });

    if (hasCommonPrefixes) {
      nonTerminal.commonPrefixes = {
        exist: true,
        warnings: allWarnings,
        prefixes: Object.values(commonPrefixes).map((prefix) => {
          return {
            common: prefix.common,
            sources: prefix.sources,
          };
        }),
      };
    } else {
      nonTerminal.commonPrefixes.exist = false;
      nonTerminal.commonPrefixes.warnings = allWarnings;
    }

    if (allWarnings.length > 0) {
      const groupLabel = `For ${nonTerminal.value} non-terminal`;
      console.groupCollapsed(groupLabel);
      allWarnings.forEach((warning) => console.log(warning));
      console.groupEnd(groupLabel);
    }
  });
}

function getCommonPrefix(productionA, productionB, reportedWarnings) {
  if (productionA === undefined || productionB === undefined) {
    return [null, []];
  }

  const aSource = productionA.elements.map((e) => e.value).join(' ');
  const bSource = productionB.elements.map((e) => e.value).join(' ');
  let common = '';

  const warnings = [];

  for (let i = 0; i < productionA.elements.length; i++) {
    if (i >= productionB.elements.length) {
      break;
    }

    const elementA = productionA.elements[i];
    const elementB = productionB.elements[i];

    if (elementA.value === elementB.value) {
      common += elementA.value + ' ';
    } else {
      maybeAddWarning(elementA, elementB, reportedWarnings, warnings);
      break;
    }
  }

  if (!common) {
    return [null, warnings];
  }

  const sources = [aSource, bSource];

  return [{ common, sources }, warnings];
}

function maybeAddWarning(elementA, elementB, reportedWarnings, warnings) {
  if (!elementA.isNonTerminal() && !elementB.isNonTerminal()) {
    return;
  }

  if (
    reportedWarnings.has(`${elementA.value}:${elementB.value}`) ||
    reportedWarnings.has(`${elementB.value}:${elementA.value}`)
  ) {
    return;
  }

  if (elementA.isEpsilon() || elementB.isEpsilon()) {
    return;
  }

  if (elementA.isNonTerminal() && elementB.isNonTerminal()) {
    // There's no warning if no item in elementA's first set is in elementB's first set.
    // This check excludes Epsilon, since if the only thing common in the elements'
    // first set is Epsilon, then they don't really have a common prefix.
    if (
      elementA.firstSet
        .except(epsilon)
        .isDisjoint(elementB.firstSet.except(epsilon))
    ) {
      return;
    }

    warnings.push(
      `${elementA.value} and ${elementB.value}: non-terminals don't match, might need expansion to check prefix`
    );
  } else if (elementA.isNonTerminal()) {
    // There's no warning if elementA (the non-terminal) doesn't have
    // elementB (the terminal) in its first set
    if (!elementA.firstSet.has(elementB)) {
      return;
    }

    warnings.push(
      `${elementA.value} and ${elementB.value}: non-terminal and terminal don't match, might need expansion to check prefix`
    );
  } else {
    // There's no warning if elementB (the non-terminal) doesn't have
    // elementA (the terminal) in its first set
    if (!elementB.firstSet.has(elementA)) {
      return;
    }

    warnings.push(
      `${elementB.value} and ${elementA.value}: non-terminal and terminal don't match, might need expansion to check prefix`
    );
  }

  reportedWarnings.add(`${elementA.value}:${elementB.value}`);
}

function createOrAppendPrefix(allPrefixes, newPrefix) {
  const prefixList = allPrefixes[newPrefix.common] || {
    common: newPrefix.common,
    sources: [],
  };

  newPrefix.sources
    .filter((newSource) => prefixList.sources.includes(newSource) === false)
    .forEach((newSource) => {
      prefixList.sources.push(newSource);
    });

  allPrefixes[newPrefix.common] = prefixList;
}
