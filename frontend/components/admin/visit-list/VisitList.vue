<template>
  <VisitListPresent
    :visits="visits"
    :loading="loading"
  />
</template>
<script>
import VisitListPresent from '~/components/admin/visit-list/VisitListPresent'
import axiosBase from "axios"

const axios = axiosBase.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
})

export default {
  components: { VisitListPresent },
  data() {
    return {
      visits: [],
      loading: false
    }
  },
  mounted() {
    this.fetchVisits()
  },
  methods: {
    async fetchVisits() {
      const res = await axios.get('/visit')
      this.visits = res.data.data
    }
  }
}
</script>
