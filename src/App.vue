<template>
  <div id="app" class="flex flex-col h-screen">
    <ui-tabs class="h-screen">
      <ui-tab label="Input & Analyse" selected>
        <div class="absolute top-0 left-0 right-0 left-0 grid">
          <grammar-input
            class="max-h-full"
            :invalid="grammarInvalid"
            v-model="grammarText"
          ></grammar-input>

          <grammar-analysis
            class="max-h-full overflow-y-auto"
            :grammar="grammar"
          ></grammar-analysis>
        </div>
      </ui-tab>

      <ui-tab label="Explore">
        <div class="explorer-wrapper">
          <grammar-explorer :grammar="grammar" v-if="grammar"></grammar-explorer>
        </div>
      </ui-tab>
    </ui-tabs>
  </div>
</template>

<script>
import { parse, CD19 } from './grammar'
import GrammarInput from './components/GrammarInput.vue'
import GrammarAnalysis from './components/GrammarAnalysis.vue'
import GrammarExplorer from './components/GrammarExplorer.vue'
import UiTabs from './components/UiTabs.vue'
import UiTab from './components/UiTab.vue'

export default {
  name: 'app',

  components: {
    GrammarInput,
    GrammarAnalysis,
    GrammarExplorer,
    UiTabs,
    UiTab,
  },

  data() {
    return {
      grammarText: CD19,
      grammarInvalid: false,
      grammar: undefined,
    }
  },

  watch: {
    grammarText() {
      this.parseGrammar()
    }
  },

  mounted() {
    this.parseGrammar()
  },

  methods: {
    parseGrammar() {
      try {
        const grammar = parse(this.grammarText)
        this.grammar = grammar
        this.grammarInvalid = false
      } catch (err) {
        console.error(err)
        this.grammarInvalid = true
      }
    },
  },
}
</script>

<style src="./assets/tailwind.css"></style>
<style>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  height: calc(100vh - 44px);
}

.explorer-wrapper {
  @apply absolute top-0 left-0 right-0 left-0 overflow-auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  width: 100vw;
  margin-left: -8px;
  margin-top: -8px;
  padding: 8px;
  height: calc(100vh - 31px);
}
</style>
