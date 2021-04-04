<template>
  <div/>
</template>
<script>
export default {
  data() {
    return { text: '' }
  },
  mounted() {
    window.document.addEventListener('keypress', this.pushKey)
  },
  beforeDestroy() {
    window.document.removeEventListener('keypress', this.pushKey)
  },
  methods: {
    pushKey(event) {
      const ENTER_KEY = 13
      const keycode = event.keyCode
      const key = String.fromCharCode(keycode)
      if (keycode === ENTER_KEY) {
        this.$emit('change', this.text)
        this.text = ''
      } else {
        this.text += key;
      }
    }
  }
}
</script>
