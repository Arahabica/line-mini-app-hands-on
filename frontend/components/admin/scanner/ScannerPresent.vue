<template>
  <div ref="scanner" class="admin">
    <div class="left-btns" v-show="!fullscreen">
      <v-btn icon @click="back">
        <v-icon>{{mdiChevronLeft}}</v-icon>
      </v-btn>
    </div>
    <div class="right-btns" v-show="!fullscreen">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="requestCamera" v-on="on" v-bind="attrs">
            <v-icon>{{ camera ? mdiVideo : mdiVideoOff }}</v-icon>
          </v-btn>
        </template>
        <span>カメラを{{ camera ? 'オフ' : 'オン' }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="requestFullscreen" v-on="on" v-bind="attrs">
            <v-icon>{{mdiFullscreen}}</v-icon>
          </v-btn>
        </template>
        <span>最大化</span>
      </v-tooltip>
    </div>
    <div class="full" v-show="status === SCAN_STATUS.WAIT">
      <div>QRコードをかざして下さい。</div>
    </div>
    <div class="full ok" v-show="status === SCAN_STATUS.OK">
      <div class="content">
        <div class="big">OK</div>
        <div>そのままお通り下さい</div>
      </div>
    </div>
    <div class="full ng" v-show="status === SCAN_STATUS.NG">
      <div class="content">
        <div class="big">WARNING</div>
        <div>少々お待ちください</div>
        <div>係のものが参ります</div>
      </div>
    </div>
  </div>
</template>
<script>
import { SCAN_STATUS } from '~/lib/constants'
import { mdiChevronLeft, mdiVideo, mdiVideoOff, mdiFullscreen } from '@mdi/js'

export default {
  props: {
    status: {
      type: Number,
      required: true
    },
    camera: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      SCAN_STATUS,
      fullscreen: false,
      mdiChevronLeft,
      mdiVideo,
      mdiVideoOff,
      mdiFullscreen
    }
  },
  mounted() {
    document.addEventListener("fullscreenchange", this.fullscreenchange, false)
    document.addEventListener("webkitfullscreenchange", this.fullscreenchange, false)
    document.addEventListener("mozc", this.fullscreenchange, false)
    document.addEventListener("msfullscreenchange", this.fullscreenchange, false)
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.fullscreenchange)
    document.removeEventListener("webkitfullscreenchange", this.fullscreenchange)
    document.removeEventListener("mozfullscreenchange", this.fullscreenchange)
    document.removeEventListener("msfullscreenchange", this.fullscreenchange)
  },
  methods: {
    back() {
      this.$emit('back')
    },
    requestCamera() {
      this.$emit('requestCamera')
    },
    requestFullscreen() {
      const element = this.$refs.scanner
      if (element) {
        // Chrome & Firefox v64以降
        if(element.requestFullscreen) {
          element.requestFullscreen()
          // Firefox v63以前
        } else if(element.mozRequestFullScreen ) {
          element.mozRequestFullScreen()
          // Safari & Edge & Chrome v68以前
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen()
          // IE11
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
    },
    fullscreenchange() {
      console.log('fullscreenchange')
      this.fullscreen = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozkitFullscreenElement ||
        document.mskitFullscreenElement
      )
    }
  }
}
</script>
<style scoped lang="sass">
.admin
  width: 100%
  height: 100vh
  position: relative
  background-color: #ffffff
  .left-btns
    position: absolute
    top: 0
    left: 0
  .right-btns
    position: absolute
    top: 0
    right: 0
  .full
    width: 100%
    height: 100vh
    font-size: 24px
    display: flex
    justify-content: center
    align-items: center
    .big
      font-size: 48px
  .ok
    background-color: #33ff33
    color: #ffffff
  .ng
    background-color: #ff3333
    color: #ffffff
  .content
    text-align: center
</style>
