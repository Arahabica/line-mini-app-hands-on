<template>
  <section class="app-wrapper">
    <v-progress-circular
      v-if="!isLoggedIn"
      indeterminate
      color="primary"
      :size="120"
    ></v-progress-circular>
    <div v-if="isLoggedIn">
      <v-avatar v-if="profile.pictureUrl" :size="120">
        <v-img :src="profile.pictureUrl" :alt="profile.displayName"/>
      </v-avatar>
      <h3 :style="{marginTop: '24px', color: '#ffffff'}">ようこそ、{{profile.displayName}}さん</h3>
    </div>
  </section>
</template>

<script>
import liff from "@line/liff"
import axiosBase from "axios"
import { mdiFruitPineapple } from '@mdi/js'

const LIFF_ID = process.env.LIFF_ID
const axios = axiosBase.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
});

export default {
  data() {
    return {
      isLoggedIn: false,
      profile: null,
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
    const res = await axios.put('/user', { accessToken })
  },
}
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #3ee577;
}
</style>

