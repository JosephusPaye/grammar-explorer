<template>
  <div class="grammar-explorer">
    <ui-non-terminal
      show-label

      :non-terminal="start"

      v-if="start"
    ></ui-non-terminal>
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
</style>
