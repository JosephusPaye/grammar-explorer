<template>
  <div class="set">
    <template v-for="value in dedupedValues">
      <div class="font-mono">{{ value }}</div>
    </template>

    <div v-if="warnings.length > 0" class="bg-gray-200 text-sm p-2 whitespace-no-wrap table w-full">
      <div v-for="warning in warnings">⚠️ {{ warning }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UiSet',

  props: {
    set: Array,
    warnings: Array,
  },

  computed: {
    dedupedValues() {
      const deduped = new Set()
      this.set.forEach(member => deduped.add(member.value))
      return deduped
    },
  },
}
</script>
