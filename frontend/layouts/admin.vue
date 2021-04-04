<template>
  <v-app>
    <v-app-bar color="primary" dense dark app>
      <div>
        <v-icon @click="moveTop">{{mdiFruitPineapple}}</v-icon>
      </div>
      <v-toolbar-title class="ml-2">Awesome Shop</v-toolbar-title>
      <v-spacer/>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon exact to="/admin" v-on="on">
            <v-icon>{{mdiAccountClock}}</v-icon>
          </v-btn>
        </template>
        <span>来店履歴</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon exact to="/admin/scanner" v-on="on">
            <v-icon>{{mdiQrcode}}</v-icon>
          </v-btn>
        </template>
        <span>スキャナ</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <nuxt/>
    </v-main>
  </v-app>
</template>
<script>
import { mdiFruitPineapple, mdiAccountClock,  mdiQrcode } from '@mdi/js'

window.onload = function(){
  // initVConsole();
}
export default {
  data() {
    return {
      mdiFruitPineapple,
      mdiAccountClock,
      mdiQrcode
    }
  },
  methods: {
    moveTop() {
      this.$router.push('/')
    }
  }
}
</script>
