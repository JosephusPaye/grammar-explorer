<template>
  <div class="prefix">
    <template v-if="hasGroups">
      <div class="flex">
        <div
          class="prefix-group border-r border-gray-300 pr-4 mr-4"
          :class="['group-' + i]"
          v-for="(group, i) in highlightedGroups"
        >
          <div v-for="source in group.sources" v-html="source" class="whitespace-no-wrap"></div>
        </div>
      </div>
    </template>

    <div v-else>None</div>

    <div v-if="warnings.length > 0" class="bg-gray-200 text-sm mt-2 p-2 whitespace-no-wrap table w-full">
      <div v-for="warning in warnings">⚠️ {{ warning }}</div>
    </div>
  </div>
</template>

<script>
function escapeTags(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default {
  name: 'UiPrefix',

  props: {
    prefixes: Object,
  },

  computed: {
    hasGroups() {
      return this.prefixes.exist
    },

    groups() {
      return this.prefixes.prefixes
    },

    highlightedGroups() {
      return this.groups.map(group => {
        const common = group.common.trim()

        return {
          sources: group.sources.map(source => {
            return escapeTags(source.replace(common, '{{mark}}'))
              .replace('{{mark}}', `<mark>${escapeTags(common)}</mark>`)
          }),
        }
      })
    },

    warnings() {
      return this.prefixes.warnings
    },
  }
}
</script>

<style lang="scss">
.prefix-group {
  &:last-child {
    padding-right: 18px!important;
    border-right: none!important;
  }
}
</style>
