<template>
  <div class="non-terminal-analysis">
    <div class="font-mono px-2 py-1 bg-blue-600 text-white flex items-center">
      <div class="pr-2">{{ nonTerminal.value }}</div>
      <div
        class="text-sm font-medium w-5 h-5 rounded-full text-white bg-blue-800 flex text-center items-center justify-center leading-none cursor-default"
        v-if="nonTerminal.isNullable"
        title="Nullable"
      >
        <span>Ɛ</span>
      </div>
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
          <ui-set
            :set="tab.set"
            :warnings="tab.warnings"
            v-else-if="tab.type === 'set'"
          ></ui-set>
        </div>
      </ui-tab>
    </ui-tabs>
  </div>
</template>

<script>
import UiPrefix from './UiPrefix.vue';
import UiSet from './UiSet.vue';
import UiTabs from './UiTabs.vue';
import UiTab from './UiTab.vue';

export default {
  name: 'NonTerminalAnalysis',

  components: {
    UiPrefix,
    UiSet,
    UiTabs,
    UiTab,
  },

  props: {
    nonTerminal: Object,
  },
};
</script>

<style lang="scss">
.non-terminal-analysis {
  display: grid;
  grid-column: 1;
  grid-row: 2;

  .tab-content {
    display: grid;
  }
}
</style>
