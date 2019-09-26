import { checkForLeftRecursion, checkForRightRecursion } from './analysis/recursion'
import { checkForCommonPrefix } from './analysis/common-prefix'
import { addFirsts } from './analysis/first-and-follow'

export function analyse(grammar, label) {
  checkForLeftRecursion(grammar)
  checkForRightRecursion(grammar)

  console.groupCollapsed(label + ' common prefix check warnings')
  checkForCommonPrefix(grammar)
  console.groupEnd(label + ' common prefix check warnings')

  console.groupCollapsed(label + ' FIRST set warnings')
  addFirsts(grammar)
  console.groupEnd(label + ' FIRST set warnings')
}
