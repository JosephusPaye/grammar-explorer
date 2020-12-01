<template>
  <div class="non-terminal flex flex-col font-mono text-sm">
    <div
      class="flex border-gray-700 border mb-1"
      :key="production.id"
      v-for="production in nonTerminal.productions"
    >
      <div
        class="bg-gray-700 text-white px-1 flex items-center justify-center"
        v-if="showLabel"
      >
        {{ nonTerminal.value }}
      </div>
      <div class="flex flex-col p-2">
        <ui-production :production="production"></ui-production>
      </div>
    </div>
  </div>
</template>

<script>
import { NonTerminal } from '../grammar/models';
import UiProduction from './UiProduction.vue';

export default {
  name: 'UiNonTerminal',

  components: {
    UiProduction,
  },

  props: {
    showLabel: Boolean,
    nonTerminal: NonTerminal,
  },
};
</script>
