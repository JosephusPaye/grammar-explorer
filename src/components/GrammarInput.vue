<template>
  <div class="grammar-input flex">
    <textarea
      class="w-full bg-gray-400 border-2 border-gray-400 p-2 font-mono outline-none p-3"
      placeholder="Enter grammar with each rule on a newline line in the form: <non-terminal> ::= expansion a | expansion b"
      rows="12"

      :class="{'border-red-500': invalid }"
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
