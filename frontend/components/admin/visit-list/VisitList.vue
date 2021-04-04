<template>
  <VisitListPresent
    :visits="visits"
    :loading="loading"
  />
</template>
<script>
import VisitListPresent from '~/components/admin/visit-list/VisitListPresent'

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
    fetchVisits() {
      console.log('fetchVisits')
    }
  }
}
</script>
