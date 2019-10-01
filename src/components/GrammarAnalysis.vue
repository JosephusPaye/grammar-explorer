<template>
  <div class="grammar-analysis p-4">
    <template v-if="hasGrammar">
      <input
        class="w-full border-2 border-gray-400 px-4 py-2 block mb-2 hover:border-gray-500 focus:border-blue-500 focus:outline-none"
        type="text"
        placeholder="Filter non terminals..."
        ref="input"
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
        <label class="inline-flex items-center mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterFirstSetWarnings" class="mr-1"> FIRST set warnings
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
import { addShortcut } from '../shortcuts'
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
      filterFirstSetWarnings: false,
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
                label: nonTerminal.rightRecursion.exists
                  ? 'Right Recursion ✅'
                  : 'Right Recursion ❌',
                type: 'text',
                content: nonTerminal.rightRecursion.path,
              },
              {
                id: nextId(),
                label: nonTerminal.commonPrefixes.exist
                  ? 'Common Prefix ✅'
                  : nonTerminal.commonPrefixes.warnings.length > 0
                    ? 'Common Prefix ⚠️'
                    : 'Common Prefix ❌',
                type: 'prefixes',
                commonPrefixes: nonTerminal.commonPrefixes,
              },
              {
                id: nextId(),
                label: nonTerminal.firstSet.length > 0
                  ? 'FIRST ✅'
                  : 'FIRST ⚠️',
                type: 'set',
                set: nonTerminal.firstSet.toArray(),
                warnings: nonTerminal.firstSetWarnings,
              },
              {
                id: nextId(),
                label: nonTerminal.followSet.length > 0
                  ? 'FOLLOW ✅'
                  : 'FOLLOW ⚠️',
                type: 'set',
                set: nonTerminal.followSet.toArray(),
                warnings: nonTerminal.followSetWarnings,
              }
            ]
          }
        })
    }
  },

  mounted() {
    this.cleanupShortcuts = addShortcut(
      'altKey',
      ['Slash'],
      () => {
        this.$refs.input && this.$refs.input.focus()
      }
    )
  },

  beforeDestroy() {
    this.cleanupShortcuts && this.cleanupShortcuts()
  },

  methods: {
    matchesFilter(nonTerminal) {
      if (this.filter && !nonTerminal.value.toLowerCase().includes(this.filter.toLowerCase())) {
        return false
      }

      if (this.filterLeftRecursion && !nonTerminal.leftRecursion.exists) {
        return false
      }

      if (this.filterRightRecursion && !nonTerminal.rightRecursion.exists) {
        return false
      }

      if (this.filterCommonPrefix && !nonTerminal.commonPrefixes.exist && nonTerminal.commonPrefixes.warnings.length === 0) {
        return false
      }

      if (this.filterFirstSetWarnings && nonTerminal.firstSetWarnings.length === 0) {
        return false
      }

      return true
    }
  }
}
</script>
