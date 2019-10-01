import { CD19, CircularLeftRecursion, FirstAndFollow } from './grammar/samples'
import { parse as parseGrammar } from './grammar/parser'
import { analyse } from './grammar/analyser'

export { CD19 }

export function parse(text, label) {
  const grammar = parseGrammar(text, label)

  analyse(grammar,label)

  return grammar
}

function logDetails() {
  const shortcuts = `
Alt + Down:   Expand Input/Search/Explore panel
Alt + Up:     Expand analysis panel
Alt + I:      Select Input tab
Alt + S:      Select Search tab
Alt + X:      Select Explore tab
Alt + N:      Select Explore tab and open non-terminal selector
Alt + /:      Reveal analysis panel and focus non-terminal filter
  `.trim()

  console.log('Keyboard shortcuts:')
  console.log(shortcuts)

  console.groupCollapsed('example grammar')

  console.log('example grammar source:')
  console.log(FirstAndFollow)

  const grammar = parse(FirstAndFollow, 'example grammar')

  console.log('example grammar parsed:')
  console.log(grammar)

  console.groupEnd('example grammar')
}

logDetails()
