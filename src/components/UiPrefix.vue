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

    <div v-if="warnings.length > 0" class="bg-gray-200 text-sm mt-2 p-2 whitespace-no-wrap table">
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

  mark {
    position: relative;
    background-color: transparent;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 2px;
      bottom: 2px;
      opacity: 0.5;
      z-index: -1;
    }
  }

  &.group-0 mark::before {
    background-color: #ffe119;
  }

  &.group-1 mark::before {
    background-color: #3cb44b;
  }

  &.group-2 mark::before {
    background-color: #e6194B;
  }

  &.group-3 mark::before {
    background-color: #4363d8;
  }

  &.group-4 mark::before {
    background-color: #f58231;
  }

  &.group-5 mark::before {
    background-color: #911eb4;
  }

  &.group-6 mark::before {
    background-color: #42d4f4;
  }

  &.group-7 mark::before {
    background-color: #f032e6;
  }

  &.group-8 mark::before {
    background-color: #bfef45;
  }

  &.group-9 mark::before {
    background-color: #fabebe;
  }

  &.group-10 mark::before {
    background-color: #469990;
  }

  &.group-11 mark::before {
    background-color: #e6beff;
  }

  &.group-12 mark::before {
    background-color: #9A6324;
  }

  &.group-13 mark::before {
    background-color: #fffac8;
  }

  &.group-14 mark::before {
    background-color: #800000;
  }

  &.group-15 mark::before {
    background-color: #aaffc3;
  }

  &.group-16 mark::before {
    background-color: #808000;
  }

  &.group-17 mark::before {
    background-color: #ffd8b1;
  }

  &.group-18 mark::before {
    background-color: #000075;
  }

  &.group-19 mark::before {
    background-color: #a9a9a9;
  }
}
</style>
