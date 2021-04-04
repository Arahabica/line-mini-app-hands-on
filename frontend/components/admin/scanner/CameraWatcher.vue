<template>
  <div class="d-none">
    <video
      ref="video"
      width="320"
      height="480"
      autoplay
    ></video>
    <canvas ref="canvas" width="240" height="320"></canvas>
  </div>
</template>
<script>
import jsQR from 'jsqr'

export default {
  async mounted() {
    await this.videoOn()
  },
  beforeDestroy() {
    this.videoOff()
  },
  methods: {
    parseCameraQR(video, callback) {
      const canvas = window.OffscreenCanvas ? new OffscreenCanvas(240, 320) : this.$refs.canvas
      const render = canvas.getContext("2d")
      let text = ''
      let time = 0
      this.intervalId = setInterval(() => {
        render.drawImage(video, 0, 0, canvas.width, canvas.height)
        const img = render.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(img.data, img.width, img.height)
        if (result) {
          const diffTime = new Date().getTime() - time
          // 8秒間は全く同じリクエストが来ても無視する。
          if (text !== result.data || diffTime > 8000) {
            text = result.data
            time = new Date().getTime()
            callback(result.data)
          }
        }
      }, 100)
    },
    async videoOn() {
      const video = this.$refs.video
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment"
        }
      })
      this.parseCameraQR(video, text => {
        this.$emit('change', text)
      })
    },
    videoOff() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      const video = this.$refs.video
      if (!video) {
        return
      }
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks()
        tracks.forEach(track => {
          track.stop()
        })
      }
      video.srcObject = null
    }
  }
}
</script>
