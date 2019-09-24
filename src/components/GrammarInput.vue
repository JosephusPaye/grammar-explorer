<template>
  <div class="grammar-input flex relative">
    <textarea
      class="w-full bg-gray-400 border-2 border-gray-400 p-2 font-mono outline-none p-3 whitespace-no-wrap"
      placeholder="Enter grammar with each rule on a newline line in the form: <non-terminal> ::= expansion a | expansion b"
      rows="12"

      :class="{'border-red-500': invalid }"
      :value="value"

      @input="$emit('input', $event.target.value)"
      spellcheck="false"
    ></textarea>

    <button
      class="absolute top-0 right-0 mt-1 mr-6 text-sm leading-none py-1 px-2 bg-blue-200 border border-blue-300 opacity-50 hover:opacity-100 focus:opacity-100"
      @click="$emit('reset')"
    >Load CD19</button>
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
