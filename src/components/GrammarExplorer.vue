<template>
  <div class="grammar-explorer">
    <template v-if="selected">
      <button
        class="relative table bg-gray-700 text-white px-1 font-mono text-sm cursor-pointer focus:outline-none"
        @click="dropdownOpen = !dropdownOpen"
      >
        <div class="flex pr-1">
          <span class="mr-1">{{ selected.value }}</span>
          <span v-if="dropdownOpen">▲</span>
          <span v-else>▼</span>
        </div>

        <ui-dropdown-menu
          class="bg-gray-700 text-left"

          :open.sync="dropdownOpen"
          :options="nonTerminals"
          :selected.sync="selected"
        ></ui-dropdown-menu>
      </button>

      <ui-non-terminal :non-terminal="selected"></ui-non-terminal>
    </template>

    <div class="p-8 text-gray-600 text-lg text-center" v-else>
      Input a valid grammar to explore
    </div>
  </div>
</template>

<script>
import UiNonTerminal from './UiNonTerminal.vue'
import UiDropdownMenu from './UiDropdownMenu.vue'

export default {
  name: 'GrammarExplorer',

  components: {
    UiNonTerminal,
    UiDropdownMenu,
  },

  props: {
    grammar: Object,
  },

  data() {
    return {
      dropdownOpen: false,
      selected: Object.values(this.grammar)[0],
    }
  },

  computed: {
    nonTerminals() {
      return Object.values(this.grammar)
    },
  },

  watch: {
    grammar() {
      this.selected = Object.values(this.grammar)[0]
    },
  },
}
</script>

<style>
.p-2 {
  padding: 0.4rem!important;
}
</style>
