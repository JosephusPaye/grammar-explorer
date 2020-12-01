<template>
  <div id="app" class="app" :class="['layout-' + layout]">
    <div class="w-full relative min-h-0 overflow-hidden">
      <ui-tabs class="h-full w-full" ref="tabs">
        <ui-tab id="input" label="Input" title="Alt + I" selected>
          <grammar-input
            class="w-full h-full max-h-full"
            ref="grammarInput"
            :invalid="grammarInvalid"
            @reset="resetGrammar"
            v-model="grammarText"
          ></grammar-input>
        </ui-tab>

        <ui-tab id="search" label="Search" title="Alt + S">
          <grammar-search
            class="w-full h-full max-h-full"
            ref="grammarSearch"
            :grammar="grammarText"
          ></grammar-search>
        </ui-tab>

        <ui-tab id="explore" label="Explore" title="Alt + X">
          <div class="w-full h-full overflow-auto">
            <grammar-explorer
              ref="grammarExplorer"
              :grammar="grammar"
              v-if="grammar"
            ></grammar-explorer>
          </div>
        </ui-tab>
      </ui-tabs>

      <a
        class="absolute top-0 right-0 bg-red-200 mt-1 mr-2 text-sm leading-none py-1 px-2"
        href="mailto:c3211849@uon.edu.au"
        title="Email me at c3211849@uon.edu.au"
        >🐞 Found an issue?</a
      >
    </div>

    <div class="separator">
      <button
        class="text-gray-600"
        title="Alt + Down"
        :disabled="layout === 'left-maximised'"
        @click="updateLayout('expand-left')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevrons-down"
        >
          <polyline points="7 13 12 18 17 13"></polyline>
          <polyline points="7 6 12 11 17 6"></polyline>
        </svg>
      </button>

      <button
        class="text-gray-600"
        title="Alt + Up"
        :disabled="layout === 'right-maximised'"
        @click="updateLayout('expand-right')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevrons-up"
        >
          <polyline points="17 11 12 6 7 11"></polyline>
          <polyline points="17 18 12 13 7 18"></polyline>
        </svg>
      </button>
    </div>

    <div class="w-full min-h-0 overflow-hidden">
      <grammar-analysis
        class="max-h-full overflow-y-auto"
        ref="grammarAnalysis"
        :grammar="grammar"
      ></grammar-analysis>
    </div>
  </div>
</template>

<script>
import debounce from 'debounce';
import { parse, CD19, CD19NodeRules } from './grammar';
import { addShortcut } from './shortcuts';
import GrammarInput from './components/GrammarInput.vue';
import GrammarAnalysis from './components/GrammarAnalysis.vue';
import GrammarExplorer from './components/GrammarExplorer.vue';
import GrammarSearch from './components/GrammarSearch.vue';
import UiTabs from './components/UiTabs.vue';
import UiTab from './components/UiTab.vue';

const localStorageLayoutKey = 'grammar-explorer:layout';

function getDefaultLayout() {
  const previousLayout = localStorage.getItem(localStorageLayoutKey);
  return previousLayout ? previousLayout : 'default';
}

const persistLayout = debounce((layout) => {
  if (layout) {
    localStorage.setItem(localStorageLayoutKey, layout);
  }
}, 200);

const localStorageInputKey = 'grammar-explorer:input';

function getDefaultInput() {
  const previousInput = localStorage.getItem(localStorageInputKey);
  return previousInput ? previousInput : CD19;
}

const persistInput = debounce((input) => {
  if (input) {
    localStorage.setItem(localStorageInputKey, input);
  }
}, 200);

const parseGrammar = debounce((input, label, callback) => {
  try {
    const grammar = parse(input, label);
    callback({ valid: true, grammar });
  } catch (err) {
    callback({ valid: false, err });
  }
}, 200);

export default {
  name: 'app',

  components: {
    GrammarInput,
    GrammarAnalysis,
    GrammarExplorer,
    GrammarSearch,
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
    };
  },

  watch: {
    grammarText(input) {
      this.parseGrammar();
      persistInput(input);
    },

    layout(layout) {
      persistLayout(layout);
    },
  },

  mounted() {
    this.parseGrammar();
    this.registerShortcuts();
  },

  beforeDestroy() {
    this.cleanupShortcuts && this.cleanupShortcuts();
  },

  methods: {
    parseGrammar() {
      parseGrammar(this.grammarText, 'input grammar', this.onGrammarParse);
    },

    onGrammarParse({ grammar, valid, err }) {
      if (valid) {
        this.grammar = grammar;
        this.grammarInvalid = false;
        window.grammar = grammar;
      } else {
        // console.error(err)
        this.grammarInvalid = true;
      }
    },

    resetGrammar(useNodeGrammar = false) {
      this.grammarText = useNodeGrammar ? CD19NodeRules : CD19;
    },

    updateLayout(action) {
      switch (this.layout) {
        case 'default':
          this.layout =
            action === 'expand-left' ? 'left-maximised' : 'right-maximised';
          break;
        case 'left-maximised':
          this.layout = action === 'expand-left' ? this.layout : 'default';
          break;
        case 'right-maximised':
          this.layout = action === 'expand-left' ? 'default' : this.layout;
          break;
      }
    },

    registerShortcuts() {
      this.cleanupShortcuts = addShortcut(
        'altKey',
        ['KeyI', 'KeyS', 'KeyX', 'KeyN', 'ArrowUp', 'ArrowDown', 'Slash'],
        (e) => {
          if (e.code === 'KeyI') {
            this.switchToTab('input');
            this.focus('grammarInput');
          } else if (e.code === 'KeyS') {
            this.switchToTab('search');
            this.focus('grammarSearch');
          } else if (e.code === 'KeyX') {
            this.switchToTab('explore');
          } else if (e.code === 'KeyN') {
            this.switchToTab('explore');
            this.focus('grammarExplorer');
          } else if (e.code === 'Slash') {
            // Reveal the analysis if it's hidden
            this.layout === 'left-maximised' &&
              this.updateLayout('expand-right');
            this.focus('grammarAnalysis');
          } else if (e.code === 'ArrowUp') {
            this.updateLayout('expand-right');
          } else if (e.code === 'ArrowDown') {
            this.updateLayout('expand-left');
          }
        }
      );
    },

    switchToTab(tabId, focusRef) {
      if (this.$refs.tabs) {
        this.$refs.tabs.selectId(tabId);
      }
    },

    focus(ref) {
      this.$nextTick(() => {
        this.$refs[ref] && this.$refs[ref].focus();
      });
    },
  },
};
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

@function highlight-color($color) {
  @if (lightness($color) > 75) {
    @return $color;
  } @else {
    @return lighten($color, 22%);
  }
}

mark {
  .group-0 &,
  &.is-0 {
    background-color: highlight-color(#ffe119);
  }

  .group-1 &,
  &.is-1 {
    background-color: highlight-color(#3cb44b);
  }

  .group-2 &,
  &.is-2 {
    background-color: highlight-color(#e6194b);
  }

  .group-3 &,
  &.is-3 {
    background-color: highlight-color(#4363d8);
  }

  .group-4 &,
  &.is-4 {
    background-color: highlight-color(#f58231);
  }

  .group-5 &,
  &.is-5 {
    background-color: highlight-color(#911eb4);
  }

  .group-6 &,
  &.is-6 {
    background-color: highlight-color(#42d4f4);
  }

  .group-7 &,
  &.is-7 {
    background-color: highlight-color(#f032e6);
  }

  .group-8 &,
  &.is-8 {
    background-color: highlight-color(#bfef45);
  }

  .group-9 &,
  &.is-9 {
    background-color: highlight-color(#fabebe);
  }

  .group-10 &,
  &.is-10 {
    background-color: highlight-color(#469990);
  }

  .group-11 &,
  &.is-11 {
    background-color: highlight-color(#e6beff);
  }

  .group-12 &,
  &.is-12 {
    background-color: highlight-color(#9a6324);
  }

  .group-13 &,
  &.is-13 {
    background-color: highlight-color(#fffac8);
  }

  .group-14 &,
  &.is-14 {
    background-color: highlight-color(#800000);
  }

  .group-15 &,
  &.is-15 {
    background-color: highlight-color(#aaffc3);
  }

  .group-16 &,
  &.is-16 {
    background-color: highlight-color(#808000);
  }

  .group-17 &,
  &.is-17 {
    background-color: highlight-color(#ffd8b1);
  }

  .group-18 &,
  &.is-18 {
    background-color: highlight-color(#000075);
  }

  .group-19 &,
  &.is-19 {
    background-color: highlight-color(#a9a9a9);
  }
}
</style>
