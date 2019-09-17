<template>
  <div class="grammar-analysis border border-gray-300 p-4">
    <template v-if="hasGrammar">
      <input
        class="w-full border-2 border-gray-400 px-4 py-2 block mb-2 focus:border-blue-500 focus:outline-none"
        type="text"
        placeholder="Filter non terminals..."
        v-model="filter"
      >

      <div class="mb-6">
        <label class="inline-flex items-center mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterLeftRecursion" class="mr-1"> Left Recursion
        </label>
        <label class="inline-flex items-center mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterRightRecursion" class="mr-1"> Right Recursion
        </label>
        <label class="inline-flex items-center mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterCommonPrefix" class="mr-1"> Common Prefix
        </label>
      </div>

      <div class="p-8 text-gray-600 text-lg text-center border" v-if="nonTerminals.length === 0">
        No matching non terminals
      </div>

      <non-terminal-analysis
        class="mb-4"
        :non-terminal="nonTerminal"
        :key="nonTerminal.value + nonTerminal.id"
        v-for="nonTerminal in nonTerminals"
      ></non-terminal-analysis>
    </template>

    <div class="p-8 text-gray-600 text-lg text-center" v-else>
      Enter a valid grammar to begin
    </div>
  </div>
</template>

<script>
import NonTerminalAnalysis from './NonTerminalAnalysis.vue'

let currentId = 0
function nextId() {
  return currentId++
}

export default {
  name: 'GrammarAnalysis',

  components: {
    NonTerminalAnalysis,
  },

  props: {
    grammar: Object,
  },

  data() {
    return {
      filter: '',
      filterLeftRecursion: false,
      filterRightRecursion: false,
      filterCommonPrefix: false,
    }
  },

  computed: {
    hasGrammar() {
      return this.grammar !== undefined && Object.values(this.grammar).length > 0
    },

    nonTerminals() {
      if (!this.grammar) {
        return []
      }

      return Object.values(this.grammar)
        .filter(this.matchesFilter)
        .map(nonTerminal => {
          return {
            value: nonTerminal.value,
            tabs: [
              {
                id: nextId(),
                label: nonTerminal.leftRecursion.exists
                  ? 'Left Recursion ✅'
                  : 'Left Recursion ❌',
                type: 'text',
                content: nonTerminal.leftRecursion.path,
              },
              {
                id: nextId(),
                label: 'Right Recursion',
                type: 'text',
                content: 'Not implemented'
              },
              {
                id: nextId(),
                label: nonTerminal.commonPrefixes.exist
                  ? 'Common Prefix ✅'
                  : 'Common Prefix ❌',
                type: 'prefixes',
                commonPrefixes: nonTerminal.commonPrefixes,
              }
            ]
          }
        })
    }
  },

  methods: {
    matchesFilter(nonTerminal) {
      if (this.filter && !nonTerminal.value.includes(this.filter)) {
        return false
      }

      if (this.filterLeftRecursion && !nonTerminal.leftRecursion.exists) {
        return false
      }

      if (this.filterRightRecursion && !nonTerminal.rightRecursion.exists) {
        return false
      }

      if (this.filterCommonPrefix && !nonTerminal.commonPrefixes.exist) {
        return false
      }

      return true
    }
  }
}
</script>
