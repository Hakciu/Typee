<script setup>
  import { ref, onBeforeMount, computed, watch } from 'vue'
  import LeftPart from '@/components/Profile/LeftPart.vue'
  import Chart from '@/components/Profile/Chart.vue'
  import TopPart from '@/components/Profile/TopPart.vue'

  import { useUserDetailsStore } from '../stores/userDetails'
  import { useUserStore } from '@/stores/users'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const path = computed(() => route.path)
  const getUsernameFromRoute = () => {
    const segments = path.value.split('/')
    return segments.pop()
  }

  const username = getUsernameFromRoute()
  const currentUsername = ref()

  const userProfile = ref(null)
  const isMyProfile = ref(null)
  const loading = ref(true)

  const chartLabels = ref([])
  const chartData = ref([])
  let rawData = []
  let formattedData = []

  const userDetailsStore = useUserDetailsStore()
  const userStore = useUserStore()

  onBeforeMount(async () => {
    userProfile.value = await userDetailsStore.fetchUserDetails(username)
    rawData = userProfile.value.userScores.map((entry) => ({
      created_at: entry.created_at,
      overall: entry.overall,
    }))
    formattedData = rawData.map((entry) => ({
      label: formatDate(entry.created_at),
      data: entry.overall,
    }))
    chartLabels.value = formattedData.map((entry) => entry.label)
    chartData.value = formattedData.map((entry) => entry.data)
    loading.value = false
    currentUsername.value = getUsernameFromRoute()
    if (userStore.user != null) {
      isMyProfile.value = userStore.user.username == currentUsername.value
    } else {
      isMyProfile.value = false
    }
  })

  watch(
    () => route.path,
    async (newPath) => {
      const newUsername = getUsernameFromRoute(newPath)
      if (newUsername !== username.value) {
        loading.value = true
        userProfile.value = await userDetailsStore.fetchUserDetails(newUsername)
        rawData = userProfile.value.userScores.map((entry) => ({
          created_at: entry.created_at,
          overall: entry.overall,
        }))
        formattedData = rawData.map((entry) => ({
          label: formatDate(entry.created_at),
          data: entry.overall,
        }))
        chartLabels.value = formattedData.map((entry) => entry.label)
        chartData.value = formattedData.map((entry) => entry.data)
        loading.value = false
      }
      currentUsername.value = getUsernameFromRoute()
      isMyProfile.value = userStore.user.username == currentUsername.value
      // console.log(userProfile.value.userScores)
    }
  )

  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${day}.${month}`
  }
</script>

<template>
  <main>
    <div class="parent">
      <div class="leftPart">
        <LeftPart
          :userProfile="userProfile"
          :loading="loading"
          :isMyProfile="isMyProfile"
        />
      </div>
      <div class="topPart">
        <TopPart :userProfile="userProfile" :loading="loading" />
      </div>
      <div class="chart">
        <Chart :labels="chartLabels" :data="chartData" :loading="loading" />
      </div>
    </div>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }

  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 5rem;
    grid-row-gap: 5rem;
    height: 80vh;
    width: 100%;
  }

  .leftPart {
    grid-area: 1 / 1 / 6 / 2;
  }
  .topPart {
    grid-area: 1 / 2 / 2 / 6;
  }
  .chart {
    grid-area: 2 / 2 / 6 / 6;
  }

  @media screen and (max-width: 768px) {
    /* .parent {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(5, 1fr);
      grid-column-gap: 5rem;
      grid-row-gap: 5rem;
      padding: 0 2rem;
    }

    .leftPart {
      grid-area: 1 / 1 / 2 / 6;
    }
    .topPart {
      grid-area: 2 / 1 / 3 / 6;
    }
    .chart {
      grid-area: 3 / 1 / 6 / 6;
    } */

    .parent {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      padding-top: 280%;
    }
  }
</style>
