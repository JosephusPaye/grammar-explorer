<template>
  <div class="non-terminal-analysis">
    <div class="font-mono px-2 py-1 lg:p-2 bg-blue-600 text-white">
      {{ nonTerminal.value }}
    </div>
    <ui-tabs class="w-full border border-gray-800 min-w-0" compact>
      <ui-tab
        :key="nonTerminal.value + index"
        :selected="index === 0"
        :label="tab.label"

        v-for="(tab, index) in nonTerminal.tabs"
      >
        <div class="p-2 overflow-x-auto font-mono tab-content">
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

<script>
import UiPrefix from './UiPrefix.vue'
import UiTabs from './UiTabs.vue'
import UiTab from './UiTab.vue'

export default {
  name: 'NonTerminalAnalysis',

  components: {
    UiPrefix,
    UiTabs,
    UiTab,
  },

  props: {
    nonTerminal: Object,
  },
}
</script>

<style lang="scss">
.non-terminal-analysis {
  display: grid;
  grid-column: 1;
  grid-row: 2;

  @screen lg {
    grid-template-columns: 8rem 1fr;
    grid-template-rows: 1fr;
  }

  .tab-content {
    display: grid;
  }
}
</style>
