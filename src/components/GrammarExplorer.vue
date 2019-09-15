<template>
  <div class="grammar-explorer">
    <template v-if="start">
      <div class="bg-gray-700 text-white px-1 font-mono text-sm cursor-default grammar-explorer-label">
        {{ start.value }}
      </div>

      <ui-non-terminal :non-terminal="start"></ui-non-terminal>
    </template>

    <div class="p-8 text-gray-600 text-lg text-center" v-else>
      Input a valid grammar to explore
    </div>
  </div>
</template>

<script>
import UiNonTerminal from './UiNonTerminal.vue'

export default {
  name: 'GrammarExplorer',

  components: {
    UiNonTerminal,
  },

  props: {
    grammar: Object,
  },

  computed: {
    nonTerminals() {
      return Object.values(this.grammar)
    },

    start() {
      return this.nonTerminals[0]
    },
  },
}
</script>

<style>
.p-2 {
  padding: 0.4rem!important;
}

.grammar-explorer-label {
  width: fit-content;
}
</style>
