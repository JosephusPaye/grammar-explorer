<template>
  <div class="tabs leading-none flex flex-col h-full">
    <div class="tabs-list bg-gray-800 flex">
      <button
        class="tab-button bg-gray-700 border-r border-gray-600 px-2 text-white outline-none"

        :class="[{ selected: tab.id === selectedTabId }, compact ? 'text-sm py-2' : 'py-2']"
        :key="tab.id"

        v-for="tab in tabs"
        @click="select(tab)"
      >{{ tab.label }}</button>
    </div>
    <div class="leading-normal h-full" :class="[ compact ? '' : 'p-2' ]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UiTabs',

  props: {
    compact: Boolean,
  },

  data() {
    return {
      selectedTabId: '',
      tabs: [],
    }
  },

  provide() {
    const tabContext = {}

    Object.defineProperty(tabContext, 'selectedTabId', {
      enumerable: true,
      get: () => this.selectedTabId,
    })

    return { tabContext }
  },

  methods: {
    addTab(tab) {
      if (this.tabs.some(t => t.id === tab.id)) {
        return
      }

      this.tabs.push(tab)

      if (tab.selected) {
        this.selectedTabId = tab.id
      }
    },

    changeLabel(id, newLabel) {
      const index = this.tabs.findIndex(t => t.id === id)

      if (index !== -1) {
        const newTab = Object.assign({}, this.tabs[index], { label: newLabel })
        this.tabs.splice(index, 1, newTab)
      }
    },

    isSelected(tabId) {
      return tabId === this.selectedTabId
    },

    select(tab) {
      this.selectedTabId = tab.id
    },

    selectId(tabId) {
      this.selectedTabId = tabId
    },
  },
}
</script>

<style lang="scss">
.tab-button {
  outline: none!important;

  &.selected {
    @apply text-gray-900 bg-white;
  }

  &:last-child {
    border-right: none!important;
  }
}
</style>
