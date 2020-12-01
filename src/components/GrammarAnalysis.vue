<template>
  <div class="grammar-analysis flex flex-col py-2 px-3">
    <template v-if="hasGrammar">
      <div class="flex-shrink-0 mb-3">
        <input
          class="w-full border-2 border-gray-400 px-4 py-2 block mb-2 hover:border-gray-500 focus:border-blue-500 focus:outline-none"
          type="text"
          placeholder="Filter non terminals (separate multiple terms with a comma)..."
          ref="input"
          title="Alt + /"
          v-model="filter"
        />

        <div>
          <label class="inline-flex items-center mr-4 cursor-pointer">
            <input type="checkbox" v-model="filterNullable" class="mr-1" />
            Nullable ({{ nullableCount }})
          </label>
          <label class="inline-flex items-center mr-4 cursor-pointer">
            <input type="checkbox" v-model="filterLeftRecursion" class="mr-1" />
            Left Recursion ({{ leftRecursiveCount }})
          </label>
          <label class="inline-flex items-center mr-4 cursor-pointer">
            <input
              type="checkbox"
              v-model="filterRightRecursion"
              class="mr-1"
            />
            Right Recursion ({{ rightRecursiveCount }})
          </label>
          <label class="inline-flex items-center mr-4 cursor-pointer">
            <input type="checkbox" v-model="filterCommonPrefix" class="mr-1" />
            Common Prefix ({{ commonPrefixCount }})
          </label>
          <label class="inline-flex items-center mr-4 cursor-pointer">
            <input
              type="checkbox"
              v-model="filterFirstSetWarnings"
              class="mr-1"
            />
            FIRST set warnings ({{ firstSetWarningsCount }})
          </label>
        </div>
      </div>

      <div
        class="flex-grow overflow-y-auto pr-1"
        v-if="nonTerminals.length > 0"
      >
        <non-terminal-analysis
          class="mb-4"
          :non-terminal="nonTerminal"
          :key="nonTerminal.value + nonTerminal.id"
          v-for="nonTerminal in nonTerminals"
        ></non-terminal-analysis>
      </div>

      <div class="p-8 text-gray-600 text-lg text-center border" v-else>
        No matching non terminals
      </div>
    </template>

    <div class="p-8 text-gray-600 text-lg text-center" v-else>
      Enter a valid grammar to begin
    </div>
  </div>
</template>

<script>
import NonTerminalAnalysis from './NonTerminalAnalysis.vue';

let currentId = 0;
function nextId() {
  return currentId++;
}

export default {
  name: 'GrammarAnalysis',

  components: {
    NonTerminalAnalysis,
  },

  props: {
    grammar: Object,
  },

  data() {
    return {
      filter: '',
      filterNullable: false,
      filterLeftRecursion: false,
      filterRightRecursion: false,
      filterCommonPrefix: false,
      filterFirstSetWarnings: false,
    };
  },

  computed: {
    hasGrammar() {
      return (
        this.grammar !== undefined && Object.values(this.grammar).length > 0
      );
    },

    nonTerminals() {
      if (!this.grammar) {
        return [];
      }

      return Object.values(this.grammar)
        .filter(this.matchesFilter)
        .map((nonTerminal) => {
          return {
            value: nonTerminal.value,
            isNullable: nonTerminal.isNullable,
            isLeftRecursive: nonTerminal.leftRecursion.exists,
            isRightRecursive: nonTerminal.rightRecursion.exists,
            hasCommonPrefix:
              nonTerminal.commonPrefixes.exist ||
              nonTerminal.commonPrefixes.warnings.length > 0,
            hasFirstSetWarnings: nonTerminal.firstSetWarnings.length > 0,
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
                label: nonTerminal.rightRecursion.exists
                  ? 'Right Recursion ✅'
                  : 'Right Recursion ❌',
                type: 'text',
                content: nonTerminal.rightRecursion.path,
              },
              {
                id: nextId(),
                label: nonTerminal.commonPrefixes.exist
                  ? 'Common Prefix ✅'
                  : nonTerminal.commonPrefixes.warnings.length > 0
                  ? 'Common Prefix ⚠️'
                  : 'Common Prefix ❌',
                type: 'prefixes',
                commonPrefixes: nonTerminal.commonPrefixes,
              },
              {
                id: nextId(),
                label:
                  nonTerminal.firstSet.length > 0 ? 'FIRST ✅' : 'FIRST ⚠️',
                type: 'set',
                set: nonTerminal.firstSet.toArray(),
                warnings: nonTerminal.firstSetWarnings,
              },
              {
                id: nextId(),
                label:
                  nonTerminal.followSet.length > 0 ? 'FOLLOW ✅' : 'FOLLOW ⚠️',
                type: 'set',
                set: nonTerminal.followSet.toArray(),
                warnings: nonTerminal.followSetWarnings,
              },
            ],
          };
        });
    },

    nullableCount() {
      return this.nonTerminals.filter((nonTerminal) => {
        return nonTerminal.isNullable;
      }).length;
    },

    leftRecursiveCount() {
      return this.nonTerminals.filter((nonTerminal) => {
        return nonTerminal.isLeftRecursive;
      }).length;
    },

    rightRecursiveCount() {
      return this.nonTerminals.filter((nonTerminal) => {
        return nonTerminal.isRightRecursive;
      }).length;
    },

    commonPrefixCount() {
      return this.nonTerminals.filter((nonTerminal) => {
        return nonTerminal.hasCommonPrefix;
      }).length;
    },

    firstSetWarningsCount() {
      return this.nonTerminals.filter((nonTerminal) => {
        return nonTerminal.hasFirstSetWarnings;
      }).length;
    },
  },

  methods: {
    matchesFilter(nonTerminal) {
      if (this.filter.trim()) {
        const value = nonTerminal.value.toLowerCase();
        const targets = this.filter
          .trim()
          .toLowerCase()
          .split(',')
          .map((target) => target.trim())
          .filter((target) => target.length > 0);

        if (!targets.some((target) => value.includes(target))) {
          return false;
        }
      }

      if (this.filterNullable && !nonTerminal.isNullable) {
        return false;
      }

      if (this.filterLeftRecursion && !nonTerminal.leftRecursion.exists) {
        return false;
      }

      if (this.filterRightRecursion && !nonTerminal.rightRecursion.exists) {
        return false;
      }

      if (
        this.filterCommonPrefix &&
        !nonTerminal.commonPrefixes.exist &&
        nonTerminal.commonPrefixes.warnings.length === 0
      ) {
        return false;
      }

      if (
        this.filterFirstSetWarnings &&
        nonTerminal.firstSetWarnings.length === 0
      ) {
        return false;
      }

      return true;
    },

    focus() {
      this.$refs.input && this.$refs.input.focus();
    },
  },
};
</script>
