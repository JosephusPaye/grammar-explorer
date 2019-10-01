<template>
  <div class="tab h-full relative bg-white" v-show="isSelected">
    <slot></slot>
  </div>
</template>

<script>
let currentId = 0

function nextId() {
  return currentId++
}

export default {
  name: 'UiTab',

  inject: ['tabContext'],

  props: {
    label: String,
    id: {
      type: String,
      default() {
        return `tab-${nextId()}`
      }
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    isSelected() {
      return this.tabContext.selectedTabId === this.id
    },
  },

  created() {
    this.$parent.addTab({
      id: this.id,
      label: this.label,
      selected: this.selected,
    })
  },

  watch: {
    label(newLabel) {
      this.$parent.changeLabel(this.id, newLabel)
    },
  },
}
</script>
