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
        <label class="mr-4 cursor-pointer"><input type="checkbox" v-model="filterLeftRecursion"> Left Recursion</label>
        <label class="mr-4 cursor-pointer"><input type="checkbox" v-model="filterRightRecursion"> Right Recursion</label>
        <label class="mr-4 cursor-pointer"><input type="checkbox" v-model="filterCommonPrefix"> Common Prefix</label>
      </div>

      <div class="p-8 text-gray-600 text-lg text-center border" v-if="nonTerminals.length === 0">
        No matching non terminals
      </div>

      <div
        class="mb-4 flex"
        :key="nonTerminal.value + nonTerminal.id"
        v-for="nonTerminal in nonTerminals"
      >
        <div class="w-40 font-mono p-2 bg-blue-600 text-white">
          {{ nonTerminal.value }}
        </div>
        <ui-tabs class="w-full border border-gray-800" compact>
          <ui-tab
            :selected="index === 0"
            :label="tab.label"
            v-for="(tab, index) in nonTerminal.tabs"
          >
            <div class="py-2 px-2 font-mono" v-html="tab.content"></div>
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
import { escapeTags } from '../grammar'
import UiTabs from './UiTabs.vue'
import UiTab from './UiTab.vue'

export default {
  name: 'GrammarAnalysis',

  components: {
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
                label: nonTerminal.isLeftRecursive
                  ? 'Left Recursion ✅'
                  : 'Left Recursion ❌',
                content: nonTerminal.isLeftRecursive
                  ? escapeTags(nonTerminal.leftRecursionPath)
                  : 'None',
              },
              {
                label: 'Right Recursion',
                content: 'Not implemented'
              },
              {
                label: nonTerminal.hasCommonPrefix
                  ? 'Common Prefix ✅'
                  : 'Common Prefix ❌',
                content: nonTerminal.hasCommonPrefix
                  ? nonTerminal.commonPrefix.html.join('<br>')
                  : 'None',
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

      if (this.filterLeftRecursion && !nonTerminal.isLeftRecursive) {
        return false
      }

      if (this.filterRightRecursion && !nonTerminal.isRightRecursive) {
        return false
      }

      if (this.filterCommonPrefix && !nonTerminal.hasCommonPrefix) {
        return false
      }

      return true
    }
  }
}
</script>
