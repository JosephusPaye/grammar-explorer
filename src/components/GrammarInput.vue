<template>
  <div class="grammar-input flex">
    <textarea
      class="w-full bg-gray-400 p-2 font-mono outline-none p-3"
      placeholder="Enter grammar"
      rows="12"

      :class="{'border-2 border-red-500': invalid }"
      :value="value"

      @input="$emit('input', $event.target.value)"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'GrammarInput',

  props: {
    value: String,
    invalid: Boolean,
  },
}
</script>
