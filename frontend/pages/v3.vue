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
        <h4 class="mt-3">{{profile.displayName}}様</h4>
        <div class="qr-code-app">
          <div class="qr-code-wrapper">
            <vue-qrcode :value="profile.userId" :options="qrOption" tag="img" class="qr-code"/>
            <div class="app-icon-wrapper">
              <div class="white-circle">
                <v-avatar v-if="profile.pictureUrl" :size="54" class="avatar">
                  <v-img :src="profile.pictureUrl" :alt="profile.displayName"/>
                </v-avatar>
              </div>
            </div>
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

const axios = axiosBase.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
})
const qrOption = {
  errorCorrectionLevel: "H",
  maskPattern: 0,
  margin: 2,
  scale: 2,
  width: 240,
  color: {
    dark: '#222222',
    light: "#ffffff"
  }
}
export default {
  components: {VueQrcode},
  data() {
    return {
      isLoggedIn: false,
      profile: null,
      qrOption,
      mdiFruitPineapple
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
    const accessToken = liff.getAccessToken()
    const profile = await liff.getProfile()
    console.log({accessToken, profile})
    this.profile = profile
    this.isLoggedIn = true
    await axios.put('/user', { accessToken })
  },
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
    margin: 12px 20px 0 12px;
    padding: 12px 0 24px;
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
</style>
