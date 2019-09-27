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
}
