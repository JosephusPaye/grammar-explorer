<template>
  <div class="production flex flex-no-wrap mb-2">
    <ui-production-option
      :option="option"
      :is-selected="selectedOption === option"
      :selected-element="selectedElement"
      :selected-element-offset="selectedElementOffset"
      :key="option.id"
      @select="selectElement"
      @deselect="deselectElement"
      v-for="option in production.options"
    ></ui-production-option>
  </div>
</template>

<script>
import { Production } from '../grammar/models';
import UiProductionOption from './UiProductionOption.vue';

export default {
  name: 'UiProduction',

  components: {
    UiProductionOption,
  },

  props: {
    production: Production,
  },

  data() {
    return {
      selectedOption: undefined,
      selectedElement: undefined,
      selectedElementOffset: 0,
    };
  },

  methods: {
    selectElement(offset, element, option) {
      this.selectedElement = element;
      this.selectedElementOffset = offset;
      this.selectedOption = option;
    },

    deselectElement(element, option) {
      this.selectedOption = undefined;
      this.selectedElement = undefined;
      this.selectedElementOffset = 0;
    },
  },
};
</script>

<style lang="scss">
.production:last-child {
  margin-bottom: 0 !important;
}
</style>
