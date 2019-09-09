<template>
  <component
    class="element mr-1 bg-blue-200 px-1"

    :class="classes"
    :is="type === 'non-terminal' ? 'button' : 'span'"

    @click="toggleSelect"
  >{{ element.value }}</component>
</template>

<script>
import { NonTerminal, Terminal, Epsilon } from '../grammar'

export default {
  name: 'UiProductionElement',

  props: {
    element: [NonTerminal, Terminal, Epsilon],
    isSelected: Boolean,
  },

  computed: {
    type() {
      if (this.element instanceof NonTerminal) {
        return 'non-terminal'
      }

      if (this.element instanceof Terminal) {
        return 'terminal'
      }

      if (this.element instanceof Epsilon) {
        return 'epsilon'
      }

      console.error(this.element)
      const err = new Error('Invalid element type')
      throw err
    },

    classes() {
      return [
        'element--' + this.type,
        { selected: this.isSelected },
      ]
    },
  },

  methods: {
    toggleSelect(e) {
      if (this.element instanceof NonTerminal) {
        if (this.isSelected) {
          this.$emit('deselect', this.element)
        } else {
          this.$emit('select', e.target.offsetLeft, this.element)
        }
      }
    },
  },
}
</script>

<style lang="scss">
.element {
  outline: none!important;
  white-space: nowrap;

  &:last-child {
    margin-right: 0!important;
  }

  &.element--terminal,
  &.element--epsilon {
    @apply bg-gray-300 cursor-default;
  }

  &.element--non-terminal {
    @apply bg-blue-300 cursor-pointer;

    &:hover {
      @apply bg-blue-400;
    }

    &.selected {
      @apply bg-gray-700 text-white;
    }
  }
}
</style>
