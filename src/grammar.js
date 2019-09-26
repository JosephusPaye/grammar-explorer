import { CD19, CircularLeftRecursion, FirstAndFollow } from './grammar/samples'
import { parse as parseGrammar } from './grammar/parser'
import { analyse } from './grammar/analyser'

export { CD19 }

export function parse(text, label) {
  const grammar = parseGrammar(text, label)

  analyse(grammar,label)

  return grammar
}

function test() {
  console.log('example grammar source:')
  console.log(FirstAndFollow)

  const grammar = parse(FirstAndFollow, 'example grammar')

  console.log('example grammar parsed:')
  console.log(grammar)
}

test()
