<template>
  <div class="option table p-2 mr-2 border border-gray-700 bg-gray-100">
    <div class="flex flex-no-wrap relative">
      <ui-production-element
        :element="element"
        :is-selected="element === selectedElement"
        :key="element.id"

        @select="selectElement"
        @deselect="deselectElement"

        v-for="element in option.elements"
      ></ui-production-element>
    </div>

    <ui-non-terminal
      :nonTerminal="selectedElement"
      :style="{ 'margin-left': `${selectedElementOffset}px` }"

      v-if="isSelected && selectedElement !== undefined"
    ></ui-non-terminal>
  </div>
</template>

<script>
import { NonTerminal, ProductionOption } from '../grammar/models'
import UiProductionElement from './UiProductionElement.vue'

export default {
  name: 'UiProductionOption',

  components: {
    UiProductionElement,
    UiNonTerminal: () => import('./UiNonTerminal.vue'),
  },

  props: {
    option: ProductionOption,
    isSelected: Boolean,
    selectedElement: NonTerminal,
    selectedElementOffset: Number,
  },

  methods: {
    selectElement(offset, element) {
      this.$emit('select', offset, element, this.option)
    },

    deselectElement(element) {
      this.$emit('deselect', element, this.option)
    }
  }
}
</script>

<style lang="scss">
.option {
  &:last-child {
    margin-right: 0!important;
  }
}
</style>
