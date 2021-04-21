<template>
  <div>
    <ScannerPresent
      :status="status"
      :camera="camera"
      @back="back"
      @requestCamera="requestCamera"
    />
    <CameraWatcher v-if="camera" @change="scanQR" />
    <KeyboardWatcher @change="scanQR" />
  </div>
</template>
<script>
import ScannerPresent from '~/components/admin/scanner/ScannerPresent'
import CameraWatcher from '~/components/admin/scanner/CameraWatcher'
import KeyboardWatcher from '~/components/admin/scanner/KeyboardWatcher'
import { SCAN_STATUS } from '~/lib/constants'
import { Howl } from 'howler'
import axiosBase from "axios"

const axios = axiosBase.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
})


const DISPLAY_TIME = 1500

const OK_SOUND = new Howl({ src: '/audio/se_maoudamashii_onepoint15.mp3' })
const NG_SOUND = new Howl({ src: '/audio/se_maoudamashii_onepoint07.mp3' })

export default {
  components: { ScannerPresent, CameraWatcher, KeyboardWatcher },
  data() {
    return {
      visitId: null,
      status: SCAN_STATUS.WAIT,
      camera: false
    }
  },
  methods: {
    async back() {
      this.$router.push('/admin')
    },
    requestCamera() {
      this.camera = !this.camera
    },
    async scanQR(qrCode) {
      console.log(qrCode)
      const status = await this.checkQR(qrCode)
      await this.setStatus(status)
    },
    async setStatus(status) {
      this.status = status
      if (status === SCAN_STATUS.OK) {
        OK_SOUND.play()
        setTimeout(() => {
          this.status = SCAN_STATUS.WAIT
        }, DISPLAY_TIME)
      } else {
        NG_SOUND.play()
      }
    },
    async checkQR(qrCode) {
      try {
        await axios.post('/qrCode', {qrCode})
        return SCAN_STATUS.OK
      } catch (e) {
        console.error(e)
        return SCAN_STATUS.NG
      }
    }
  }
}
</script>
