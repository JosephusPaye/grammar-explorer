<template>
  <div class="absolute left-0 z-50" v-show="open">
    <input
      type="text"
      placeholder="Filter..."
      class="leading-loose bg-gray-800 px-2 text-white border-b border-gray-700"
      ref="inputEl"

      @click.stop
      @keydown.enter="selectFirst"

      v-model="filter"
    >
    <div class="overflow-y-auto" :style="{ 'max-height': `calc(100vh - ${screenOffset}px)` }">
      <div
        class="leading-relaxed px-2 cursor-pointer hover:bg-gray-800"
        :class="{
          'is-selected bg-blue-500 text-white': option.value === selected.value,
        }"

        v-for="option in filteredOptions"

        @click="select(option)"
      >{{ option.value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UiDropdownMenu',

  props: {
    options: Array,
    selected: Object,
    open: Boolean,
    screenOffset: {
      type: Number,
      default: 96,
    },
  },

  data() {
    return {
      filter: '',
    }
  },

  computed: {
    filteredOptions() {
      return this.options.filter(option => {
        return option.value.toLowerCase().includes(this.filter.toLowerCase())
      })
    },
  },

  watch: {
    open(opened) {
      if (opened) {
        this.$nextTick(() => {
          const selected = this.$el.querySelector('.is-selected')
          selected && selected.scrollIntoView(false)

          this.$refs.inputEl.focus()
        })
      } else {
        this.filter = ''
      }
    },
  },

  methods: {
    selectFirst() {
      const first = this.filteredOptions[0]

      if (first) {
        this.select(first)
        this.$emit('update:open', false)
      }
    },

    select(option) {
      if (option) {
        this.$emit('update:selected', option)
      }
    },
  },
}
</script>
