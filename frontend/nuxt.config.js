import path from "path"
import fs from "fs"
import colors from 'vuetify/es5/util/colors'
import {
  mdiMenuDown,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiChevronLeft,
  mdiChevronRight
} from '@mdi/js'

const SRC_DIR = '.'

const title = 'LINEで会員証'

let serverConfig = {}
let isAnalyze = false
const script = []
if (process.env.NODE_ENV === "development") {
  isAnalyze = true
  serverConfig = {
    port: 8080,
    host: "localhost"
  }
}
script.push({ src: '/vconsole.min.js' })
// script.push({ src: 'https://static.line-scdn.net/liff/edge/versions/2.20.3/sdk.js' })
module.exports = {
  ssr: false,
  srcDir: SRC_DIR,
  components: true,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    LIFF_ID: process.env.LIFF_ID
  },
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      prefix: 'og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#'
    },
    title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    script,
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { rel: 'manifest', href: '/manifest.json' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: {color: '#546E7A'},

  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    defaultAssets: {
      icons: false,
      font: false
    },
    customVariables: ['~/assets/sass/variables.sass'],
    icons: {
      iconfont: 'mdiSvg',
      values: {
        dropdown: mdiMenuDown,
        checkboxOn: mdiCheckboxMarked,
        checkboxOff: mdiCheckboxBlankOutline,
        prev: mdiChevronLeft,
        next: mdiChevronRight,
      }
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: colors.green.accent4,
          accent: colors.red.lighten4,
          secondary: colors.blueGrey.lighten1,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent4,
          warningBack: colors.amber.lighten5,
          errorBack: colors.red.lighten5
        }
      }
    },
    treeShake: true
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    analyze: isAnalyze,
    extractCSS:true,
    optimization :{
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '.',
        name: 'vendor',
        maxSize :128000
      }
    },
    extend(config, {isDev, isClient}) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (isDev) {
        config.devtool = isClient ? 'eval-source-map' : 'inline-source-map'
      }
    }
  },
  server: serverConfig,
  telemetry: true
}

