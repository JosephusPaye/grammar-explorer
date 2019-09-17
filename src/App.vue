<template>
  <div id="app" class="flex flex-col h-screen">
    <ui-tabs class="h-screen">
      <ui-tab label="Input & Analyse" selected>
        <div class="absolute top-0 left-0 right-0 left-0 grid">
          <grammar-input
            class="max-h-full"
            :invalid="grammarInvalid"
            @reset="resetGrammar"
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

    <a
      class="absolute top-0 right-0 bg-red-200 mt-1 mr-2 text-sm leading-none py-1 px-2"
      href="mailto:c3211849@uon.edu.au"
      title="Email me at c3211849@uon.edu.au"
    >🐞 Found an issue?</a>
  </div>
</template>

<script>
import debounce from 'debounce'
import { parse, CD19 } from './grammar'
import GrammarInput from './components/GrammarInput.vue'
import GrammarAnalysis from './components/GrammarAnalysis.vue'
import GrammarExplorer from './components/GrammarExplorer.vue'
import UiTabs from './components/UiTabs.vue'
import UiTab from './components/UiTab.vue'

const localStorageKey = 'grammar-explorer:input'

function getDefaultInput() {
  const previousInput = localStorage.getItem(localStorageKey)
  return previousInput ? previousInput : CD19
}

const persistInput = debounce(input => {
  if (input) {
    localStorage.setItem(localStorageKey, input)
  }
}, 300)

const parseGrammar = debounce(parse, 300)

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
      grammarText: getDefaultInput(),
      grammarInvalid: false,
      grammar: undefined,
    }
  },

  watch: {
    grammarText(input) {
      this.parseGrammar()
      persistInput(input)
    }
  },

  mounted() {
    this.parseGrammar()
  },

  methods: {
    parseGrammar() {
      try {
        const grammar = parseGrammar(this.grammarText, 'input grammar')
        this.grammar = grammar
        this.grammarInvalid = false
      } catch (err) {
        // console.error(err)
        this.grammarInvalid = true
      }
    },

    resetGrammar() {
      this.grammarText = CD19
    },
  },
}
</script>

<style src="./assets/tailwind.css"></style>
<style lang="scss">
.grid {
  display: grid;
  height: calc(100vh - 44px);
  grid-column: 1;
  grid-row: 2;

  .grammar-analysis {
    border-top-width: 0;
  }

  @screen lg {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;

    .grammar-analysis {
      border-top-width: 1px;
      border-left-width: 0;
    }
  }
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
