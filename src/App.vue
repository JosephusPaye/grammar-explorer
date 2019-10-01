<template>
  <div id="app" class="app" :class="['layout-' + layout]">
    <div class="w-full relative min-h-0 overflow-hidden">
      <ui-tabs class="h-full w-full" ref="tabs">
        <ui-tab id="input" label="Input" selected>
          <grammar-input
            class="w-full h-full max-h-full"
            :invalid="grammarInvalid"
            @reset="resetGrammar"
            v-model="grammarText"
          ></grammar-input>
        </ui-tab>

        <ui-tab id="explore" label="Explore">
          <div class="w-full h-full overflow-auto">
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

    <div class="separator">
      <button
        class="text-gray-600"
        :disabled="layout === 'left-maximised'"
        @click="updateLayout('expand-left')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevrons-down"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
      </button>

      <button
        class="text-gray-600"
        :disabled="layout === 'right-maximised'"
        @click="updateLayout('expand-right')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevrons-up"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
      </button>
    </div>

    <div class="w-full min-h-0 overflow-hidden">
      <grammar-analysis
        class="max-h-full overflow-y-auto"
        :grammar="grammar"
      ></grammar-analysis>
    </div>
  </div>
</template>

<script>
import debounce from 'debounce'
import { parse, CD19 } from './grammar'
import { addShortcut } from './shortcuts'
import GrammarInput from './components/GrammarInput.vue'
import GrammarAnalysis from './components/GrammarAnalysis.vue'
import GrammarExplorer from './components/GrammarExplorer.vue'
import UiTabs from './components/UiTabs.vue'
import UiTab from './components/UiTab.vue'

const localStorageLayoutKey = 'grammar-explorer:layout'

function getDefaultLayout() {
  const previousLayout = localStorage.getItem(localStorageLayoutKey)
  return previousLayout ? previousLayout : 'default'
}

const persistLayout = debounce(layout => {
  if (layout) {
    localStorage.setItem(localStorageLayoutKey, layout)
  }
}, 200)

const localStorageInputKey = 'grammar-explorer:input'

function getDefaultInput() {
  const previousInput = localStorage.getItem(localStorageInputKey)
  return previousInput ? previousInput : CD19
}

const persistInput = debounce(input => {
  if (input) {
    localStorage.setItem(localStorageInputKey, input)
  }
}, 200)

const parseGrammar = debounce((input, label, callback) => {
  try {
    const grammar = parse(input, label)
    callback({ valid: true, grammar })
  } catch (err) {
    callback({ valid: false, err })
  }
}, 200)

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
      layout: getDefaultLayout(),
      cleanupShortcuts: null,
    }
  },

  watch: {
    grammarText(input) {
      this.parseGrammar()
      persistInput(input)
    },

    layout(layout) {
      persistLayout(layout)
    },
  },

  mounted() {
    this.parseGrammar()
    this.registerShortcuts()
  },

  beforeDestroy() {
    this.cleanupShortcuts && this.cleanupShortcuts()
  },

  methods: {
    parseGrammar() {
      parseGrammar(this.grammarText, 'input grammar', this.onGrammarParse)
    },

    onGrammarParse({ grammar, valid, err }) {
      if (valid) {
        this.grammar = grammar
        this.grammarInvalid = false
      } else {
        // console.error(err)
        this.grammarInvalid = true
      }
    },

    resetGrammar() {
      this.grammarText = CD19
    },

    updateLayout(action) {
      switch (this.layout) {
        case 'default':
          this.layout = action === 'expand-left' ? 'left-maximised' : 'right-maximised'
          break
        case 'left-maximised':
          this.layout = action === 'expand-left' ? this.layout : 'default'
          break
        case 'right-maximised':
          this.layout = action === 'expand-left' ? 'default' : this.layout
          break
      }
    },

    registerShortcuts() {
      this.cleanupShortcuts = addShortcut(
        'altKey',
        ['KeyI', 'KeyX', 'ArrowUp', 'ArrowDown'],
        (e) => {
          if (e.code === 'KeyI') {
            this.switchToTab('input')
          } else if (e.code === 'KeyX') {
            this.switchToTab('explore')
          } else if (e.code === 'ArrowUp') {
            this.updateLayout('expand-right')
          } else if (e.code === 'ArrowDown') {
            this.updateLayout('expand-left')
          }
        }
      )
    },

    switchToTab(tabId) {
      if (this.$refs.tabs) {
        this.$refs.tabs.selectId(tabId)
      }
    },
  },
}
</script>

<style src="./assets/tailwind.css"></style>
<style lang="scss">
.app {
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 28px 1fr;

  @screen lg {
    grid-template-columns: 1fr 28px 1fr;
    grid-template-rows: 1fr;
  }

  &.layout-left-maximised {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 28px 0;

    @screen lg {
      grid-template-columns: 1fr 28px 0;
      grid-template-rows: 1fr;
    }
  }

  &.layout-right-maximised {
    grid-template-columns: 1fr;
    grid-template-rows: 0 28px 1fr;

    @screen lg {
      grid-template-columns: 0 28px 1fr;
      grid-template-rows: 1fr;
    }
  }
}

.separator {
  @apply flex-shrink-0 flex items-center justify-center bg-gray-100 border-gray-300 border-t border-b;

  button {
    &[disabled] {
      opacity: 0.4;
    }

    &:not(:first-child) {
      @apply ml-1;
    }
  }

  @screen lg {
    @apply border-l border-r flex-col;

    button {
      transform: rotate(-90deg);

      &:not(:first-child) {
        @apply ml-0 mt-1;
      }
    }
  }
}
</style>
