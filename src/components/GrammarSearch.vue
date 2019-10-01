<template>
  <div class="grammar-search flex flex-col relative">
    <input
      class="flex-shrink-0 w-full border-2 border-gray-400 px-4 py-2 block mb-2 hover:border-gray-500 focus:border-blue-500 focus:outline-none"
      type="text"
      placeholder="Filter lines (separate multiple terms with a comma)..."
      title="Alt + S"
      ref="input"
      v-model="filter"
    >

    <div v-if="filteredLines.length > 0" class="flex-grow overflow-y-auto">
      <div
        class="font-mono bg-gray-400 px-1 leading-relaxed"
        style="margin-bottom: 2px"
        v-for="line in filteredLines"
        v-html="line.highlighted"
      ></div>
    </div>

    <div v-else>
      No matching lines
    </div>
  </div>
</template>

<script>
function escapeTags(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function findMatch(string, target) {
  const index = string.toLowerCase().indexOf(target)

  if (index !== -1) {
    return {
      index,
      value: string.substr(index, target.length),
    }
  }

  return null
}

function escapeForRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceAll(string, target, replacement) {
  return string.replace(new RegExp(escapeForRegex(target), 'g'), replacement)
}

export default {
  name: 'GrammarBrowser',

  props: {
    grammar: String,
  },

  data() {
    return {
      filter: '',
    }
  },

  computed: {
    lines() {
      return this.grammar.split('\n').map(line => line.trim())
    },

    filteredLines() {
      return this.lines.map(this.findMatches).filter(line => line.matches)
    }
  },

  methods: {
    findMatches(line) {
      const result = {
        highlighted: line,
        highlights: [],
        matches: false,
      }

      if (this.filter.trim()) {
        const lineLowerCase = line.toLowerCase()
        const targets = this.filter
          .trim()
          .toLowerCase()
          .split(',')
          .map(target => target.trim())
          .filter(target => target.length > 0)

        targets.forEach((target, i) => {
          const match = findMatch(lineLowerCase, target)

          if (match) {
            result.matches = true

            const placeholder = `{{MATCH_${i}}}`
            result.highlighted = replaceAll(result.highlighted, match.value, placeholder)

            result.highlights.push({
              placeholder,
              replacement: `<mark class="is-${i}">${match.value}</mark>`,
            })
          }
        })

        result.highlighted = escapeTags(result.highlighted)

        result.highlights.forEach(({ placeholder, replacement }) => {
          result.highlighted = replaceAll(result.highlighted, placeholder, replacement)
        })
      } else {
        result.highlighted = escapeTags(result.highlighted)
        result.matches = true
      }

      return result
    },

    focus() {
      this.$refs.input && this.$refs.input.focus()
    },
  },
}
</script>
