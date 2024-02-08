<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { NTooltip } from 'naive-ui'
  import { useUserStore } from '@/stores/users'
  const userStore = useUserStore()
  const isLogged = ref(false)
  const user = ref(null)
  const userProfilePath = ref('/profile')

  onMounted(async () => {
    user.value = userStore.user
  })

  watch(
    () => userStore.user,
    (newUser) => {
      user.value = newUser
      isLogged.value = user.value !== null
      if (isLogged.value) {
        userProfilePath.value = `/profile/${user.value.username}`
      }
    }
  )
</script>

<template>
  <nav>
    <div class="left-side">
      <div class="logo">
        <RouterLink to="/" class="text logo-link">Typee</RouterLink>
      </div>

      <div class="ranking">
        <n-tooltip trigger="hover">
          <template #trigger>
            <RouterLink to="/ranking" class="icon"
              ><font-awesome-icon icon="fa-solid fa-ranking-star"
            /></RouterLink>
          </template>
          Ranking
        </n-tooltip>
      </div>

      <div class="info">
        <n-tooltip trigger="hover">
          <template #trigger>
            <RouterLink to="/info" class="icon"
              ><font-awesome-icon icon="fa-solid fa-circle-info"
            /></RouterLink>
            <!-- <RouterLink to="/profile/Haken" class="icon"
              ><font-awesome-icon icon="fa-solid fa-circle-info"
            /></RouterLink> -->
          </template>
          Info
        </n-tooltip>
      </div>
    </div>

    <div class="right-side">
      <div class="login" v-if="!isLogged">
        <n-tooltip trigger="hover">
          <template #trigger>
            <RouterLink to="/login" class="icon"
              ><font-awesome-icon icon="fa-solid fa-user"
            /></RouterLink>
          </template>
          Sign in
        </n-tooltip>
      </div>

      <div class="profile" v-else>
        <n-tooltip trigger="hover">
          <template #trigger>
            <RouterLink :to="userProfilePath" class="icon"
              ><font-awesome-icon icon="fa-solid fa-user"
            /></RouterLink>
          </template>
          My profile
        </n-tooltip>
      </div>
    </div>
  </nav>
</template>

<style scoped>
  nav {
    position: fixed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 80%;
    padding-top: 0.5rem;
    z-index: 1;
    background-color: #2e343e;
  }

  .left-side {
    display: flex;
    align-items: center;
    gap: 5rem;
  }

  .icon {
    font-size: 1.5rem;
  }

  .logo {
    font-family: 'Fasthand', cursive;
    font-size: 2.2rem;
  }

  .ranking:hover,
  .info:hover,
  .profile:hover {
    color: #98c379;
  }

  @media screen and (max-width: 768px) {
    nav {
      width: 100%;
      padding: 0 0.5rem;
    }

    .left-side {
      gap: 2.5rem;
    }
  }
</style>
