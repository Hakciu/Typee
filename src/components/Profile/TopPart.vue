<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { NSpin } from 'naive-ui'

  const props = defineProps({
    userProfile: Object,
    loading: Boolean,
  })

  let localUser = ref(null)

  onMounted(() => {
    localUser.value = props.userProfile
  })

  watch(
    () => props.userProfile,
    (newUser) => {
      localUser.value = newUser
    }
  )
</script>

<template>
  <div class="details">
    <div class="highscore">
      <h3>Highscore</h3>
      <div v-if="loading" class="size">
        <n-spin size="small" />
      </div>
      <div v-else class="size">
        <h3>{{ localUser.userData[0].highscore }}</h3>
      </div>
    </div>

    <div class="accuracy">
      <h3>Average accuracy</h3>
      <div v-if="loading" class="size">
        <n-spin size="small" />
      </div>
      <div v-else class="size">
        <h3>{{ localUser.userData[0].avg_acc }}%</h3>
      </div>
    </div>

    <div class="wpm">
      <h3>Average WPM</h3>
      <div v-if="loading" class="size">
        <n-spin size="small" />
      </div>
      <div v-else class="size">
        <h3>{{ localUser.userData[0].avg_wpm }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .details {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    gap: 1rem;
    background-color: #262a35;
    border-radius: 2rem;
    padding: 3rem;
    height: 100%;
    width: 100%;
    text-align: center;
  }

  .highscore,
  .accuracy,
  .wpm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
  }

  .size {
    height: 40px;
  }

  @media screen and (max-width: 768px) {
    .details {
      font-size: 1rem;
      padding: 2rem 1rem 2rem 1rem;
    }

    .highscore,
    .accuracy,
    .wpm {
      gap: 0.5rem;
      font-size: 1rem;
    }
  }
</style>
