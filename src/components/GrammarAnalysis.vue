<template>
  <div class="grammar-analysis border border-gray-300 p-4">
    <template v-if="hasGrammar">
      <input
        class="w-full border-2 border-gray-400 rounded px-4 py-2 block mb-2 focus:border-blue-500 focus:outline-none"
        type="text"
        placeholder="Filter non terminals..."
        v-model="filter"
      >

      <div class="mb-6">
        <label class="mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterLeftRecursion"> Left Recursion
        </label>
        <label class="mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterRightRecursion"> Right Recursion
        </label>
        <label class="mr-4 cursor-pointer">
          <input type="checkbox" v-model="filterCommonPrefix"> Common Prefix
        </label>
      </div>

      <div class="p-8 text-gray-600 text-lg text-center border" v-if="nonTerminals.length === 0">
        No matching non terminals
      </div>

      <div
        class="mb-4 flex"
        :key="nonTerminal.value + nonTerminal.id"
        v-for="nonTerminal in nonTerminals"
      >
        <div class="w-40 font-mono p-2 bg-blue-600 text-white flex-shrink-0">
          {{ nonTerminal.value }}
        </div>
        <ui-tabs class="w-full border border-gray-800" compact>
          <ui-tab
            :key="nonTerminal.value + index"
            :selected="index === 0"
            :label="tab.label"

            v-for="(tab, index) in nonTerminal.tabs"
          >
            <div class="py-2 px-2 overflow-x-auto font-mono" style="width: calc((100vw / 2) - 202px)">
              <div v-if="tab.type === 'text'">{{ tab.content }}</div>
              <ui-prefix
                :prefixes="tab.commonPrefixes"

                v-else-if="tab.type === 'prefixes'"
              ></ui-prefix>
            </div>
          </ui-tab>
        </ui-tabs>
      </div>
    </template>

    <div class="p-8 text-gray-600 text-lg text-center" v-else>
      Enter a valid grammar to begin
    </div>
  </div>
</template>

<script>
import UiPrefix from './UiPrefix.vue'
import UiTabs from './UiTabs.vue'
import UiTab from './UiTab.vue'

let currentId = 0
function nextId() {
  return currentId++
}

export default {
  name: 'GrammarAnalysis',

  components: {
    UiPrefix,
    UiTabs,
    UiTab
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
