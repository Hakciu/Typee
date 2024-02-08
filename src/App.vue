<script setup>
  import { RouterView } from 'vue-router'
  import Navbar from './components/Navbar/Navbar.vue'
  import Footer from './components/Footer/Footer.vue'

  import { onMounted } from 'vue'
  import { useUserStore } from '@/stores/users'

  const userStore = useUserStore()

  onMounted(async () => {
    await userStore.handleAddDiscordUser()
    await userStore.getUser()
  })
</script>

<template>
  <main>
    <Navbar />

    <RouterView />

    <Footer />
  </main>
</template>

<style scoped>
  main {
    margin: 0 10%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media screen and (max-width: 768px) {
    main {
      margin: 0;
    }
  }
</style>
