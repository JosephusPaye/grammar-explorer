export class EnhancedSet {
  constructor(iterable = []) {
    this.set = new Set(iterable)
  }

  get size() {
    return this.set.size
  }

  get length() {
    return this.set.size
  }

  add(...values) {
    values.forEach(value => {
      this.set.add(value)
    })

    return this
  }

  addAll(values) {
    values.forEach(value => {
      this.set.add(value)
    })

    return this
  }

  has(target) {
    if (this.set.has(target)) {
      return true
    }

    return this.some(member => member.equals(target))
  }

  delete(value) {
    return this.set.delete(value)
  }

  entries() {
    return this.set.entries()
  }

  keys() {
    return this.set.keys()
  }

  values() {
    return this.set.values()
  }

  forEach(callback, thisArg) {
    return this.set.forEach(callback, thisArg)
  }

  some(callback, thisArg) {
    return this.toArray().some(callback, thisArg)
  }

  every(callback, thisArg) {
    return this.toArray().every(callback, thisArg)
  }

  map(callback, thisArg) {
    return new EnhancedSet(
      this.toArray().map(callback, thisArg)
    )
  }

  filter(callback, thisArg) {
    return new EnhancedSet(
      this.toArray().filter(callback, thisArg)
    )
  }

  except(excluded) {
    return new EnhancedSet(
      this.toArray().filter(member => !member.equals(excluded))
    )
  }

  toArray() {
    return Array.from(this.set)
  }

  equals(otherSet) {
    const setA = this.toArray().map(element => element.value).sort()
    const setB = otherSet.toArray().map(element => element.value).sort()

    if (setA.length !== setB.length) {
      return false
    }

    for (let i = 0; i < setA.length; i++) {
      if (setA[i] !== setB[i]) {
        return false
      }
    }

    return true
  }

  someEquals(otherSet) {
    return this.toArray().some(element => {
      return otherSet.toArray().some(otherElement => {
        return element.equals(otherElement)
      })
    })
  }

  isDisjoint(otherSet) {
    return !this.someEquals(otherSet)
  }
}
