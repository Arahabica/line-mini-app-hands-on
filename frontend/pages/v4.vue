<template>
  <section class="app-wrapper">
    <v-progress-circular
      v-if="!isLoggedIn"
      indeterminate
      color="primary"
      :size="120"
    ></v-progress-circular>
    <div v-if="isLoggedIn" class="member-card-app">
      <div class="header">
        <v-icon color="#ffffff" large>{{mdiFruitPineapple}}</v-icon>
        <h2>ALOHA MEMBERS CARD</h2>
      </div>
      <v-card class="member-card">
        <h4 :style="{marginTop: '12px'}">{{profile.displayName}}様</h4>
        <div class="qr-code-app" v-if="token">
          <div class="qr-code-wrapper">
            <vue-qrcode :value="token" :options="qrOption" tag="img" class="qr-code"/>
            <div class="app-icon-wrapper">
              <div class="white-circle">
                <v-avatar v-if="profile.pictureUrl" :size="54" class="avatar">
                  <v-img :src="profile.pictureUrl" :alt="profile.displayName"/>
                </v-avatar>
              </div>
            </div>
          </div>
        </div>
        <div class="limit-app-wrapper">
          <div v-if="timeLimit > 0" class="limit-app">
            <v-progress-circular
              class="limit-circle"
              color="#2ecc71"
              :size="120"
              :rotate="-90"
              :width="8"
              :value="progress"
            ></v-progress-circular>
            <div class="limit-number-wrapper">
              <div class="limit-number">{{timeLimitStr}}</div>
            </div>
          </div>
          <div v-if="timeLimit <= 0" class="limit-app">
            <v-btn
              fab
              dark
              large
              :width="120"
              :height="120"
              color="primary"
              @click="reload"
            >
              <span class="circle-btn-text">再読み込み</span>
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </section>
</template>

<script>
import liff from "@line/liff"
import axiosBase from "axios"
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { mdiFruitPineapple } from '@mdi/js'

const LIFF_ID = process.env.LIFF_ID
const MAX_TIME_LIMIT = 20

const axios = axiosBase.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
});

export default {
  components: {VueQrcode},
  data() {
    return {
      isLoggedIn: false,
      profile: null,
      timeLimit: MAX_TIME_LIMIT,
      token: null,
      intervalId: null,
      mdiFruitPineapple
    }
  },
  computed: {
    progress() {
      return this.timeLimit / MAX_TIME_LIMIT * 100
    },
    timeLimitStr() {
      return Math.floor(this.timeLimit)
    },
    qrOption() {
      return {
        errorCorrectionLevel: "H",
        maskPattern: 0,
        margin: 2,
        scale: 2,
        width: 240,
        color: {
          dark: this.timeLimit > 0 ? '#222222' : '#dadada',
          light: "#ffffff"
        }
      }

    }
  },
  async mounted() {
    // 1. LIFFの初期化
    await liff.init({liffId: LIFF_ID})
      .catch((err) => {
        console.error(err)
        window.alert('LIFFの初期化失敗。\n' + err)
      })
    // 2. LINEに未認証の場合、ログイン画面にリダイレクト
    if (!liff.isLoggedIn()) {
      await liff.login()
      return
    }
    this.accessToken = liff.getAccessToken()
    this.profile = await liff.getProfile()
    this.isLoggedIn = true
    this.token = await this.fetchToken()
    this.intervalId = setInterval(() => {
      if (this.timeLimit > 0) {
        this.timeLimit -= 1
      }
    }, 1000)
  },
  unmounted() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  },
  methods: {
    async fetchToken() {
      const { accessToken } = this
      const res = await axios.post('/token', { accessToken })
      return res.data.data.token
    },
    async reload() {
      this.timeLimit = MAX_TIME_LIMIT
      this.token = await this.fetchToken()
    }
  }
}
</script>

<style scoped lang="scss">
.app-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #3ee577;
}

.header {
  margin: 8px 0 0 0;
  h2 {
    margin: 8px 0 0 0;
    font-size: 18px;
    color: #ffffff;
  }
}

.member-card-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .member-card {
    margin: 20px 20px 0 20px;
    padding: 12px 0 12px 0;
  }
}

.qr-code-app {
  display: flex;
  justify-content: center;
  .qr-code-wrapper {
    position: relative;
    .qr-code {
      max-width: 240px;
      width: 100%;
    }
    .app-icon-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .white-circle {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background-color: #ffffff;
        .avatar {
          margin: 3px;
        }
      }
      .app-icon {
        max-width: 54px
      }
    }
  }
}

.limit-app-wrapper {
  display: flex;
  justify-content: center;
  .limit-app {
    position: relative;
    width: 160px;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    .limit-circle {
      transform: scale(-1, 1);
    }
    .limit-number-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .limit-number {
        font-size: 28px;
        color: #2ecc71;
      }
    }
    .circle-btn-text {
      font-weight: bold;
    }
  }
}
</style>

