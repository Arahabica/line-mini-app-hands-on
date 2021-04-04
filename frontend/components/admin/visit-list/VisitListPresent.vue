<template>
  <v-container>
    <div class="visit-list-header">
      <div class="title">
        <h1>来店一覧</h1>
      </div>
    </div>
    <div v-if="loading" class="progress">
      <v-progress-circular indeterminate :size="120" color="primary" />
    </div>
    <v-data-table
      v-if="!loading"
      class="elevation-1"
      :headers="headers"
      :items="visits"
      :page.sync="page"
      :items-per-page="itemsPerPage"
      hide-default-footer
      @page-count="pageCount = $event"
    >
      <template v-slot:no-data>
        <div>来店はありません</div>
      </template>
      <template v-slot:item.visitedAt="{item}">
        <span>{{dateFormat(item.visitedAt)}}</span>
      </template>
      <template v-slot:item.displayName="{item}">
        <div class="user-record">
          <v-avatar v-if="item.pictureUrl" :size="28">
            <v-img :src="item.pictureUrl" />
          </v-avatar>
          <span class="ml-2">{{item.displayName}}</span>
        </div>
      </template>
    </v-data-table>
    <div>
      <v-pagination v-show="pageCount > 1" v-model="page" :length="pageCount" />
    </div>
  </v-container>
</template>
<script>
import dayjs from 'dayjs'

const headers = [
  {
    text: '来店日時',
    value: 'visitedAt',
    width: '30%'
  },
  {
    text: '名前',
    value: 'displayName',
    width: '70%'
  }
]
const itemsPerPage = 50

export default {
  props: {
    visits: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      headers,
      page: 1,
      pageCount: 0,
      itemsPerPage,
    }
  },
  methods: {
    dateFormat(date) {
      return dayjs(date).format('YYYY/MM/DD HH:mm:ss')
    }
  }
}
</script>
<style scoped lang="sass">
h1
  color: #999999
  margin: 8px 0 24px 0
.no-visits
  color: #999999
  font-size: 24px
  padding: 48px 0 0 0
.user-record
  display: flex
  align-items: center
</style>
