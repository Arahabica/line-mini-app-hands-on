<template>
  <section class="container">
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
import liff  from "@line/liff"
import axiosBase from "axios"

const LIFF_ID = process.env.LIFF_ID
const axios = axiosBase.create({
  baseURL: '/api/v1',
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
      profile: null
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
    this.profile = await liff.getProfile()
    this.isLoggedIn = true
    console.log(accessToken)
    const res = await axios.put('/user', { accessToken })
    console.log(res)
  },
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #3ee577;
  background-image: linear-gradient(315deg, #3ee577 0%, #42fcdb 74%);
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

