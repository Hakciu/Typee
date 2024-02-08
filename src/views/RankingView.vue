<script setup>
  import { ref, onBeforeMount } from 'vue'
  import { useRankingStore } from '../stores/game'
  import RankingPlace from '@/components/RankingPlace.vue'

  const rankingStore = useRankingStore()
  const scores = ref(null)

  onBeforeMount(async () => {
    const allScores = await rankingStore.fetchRanking()
    scores.value = allScores
  })
</script>

<template>
  <main>
    <h2>Ranking</h2>
    <div class="ranking">
      <RankingPlace
        v-for="(score, index) in scores"
        :key="score.username"
        :place="index + 1"
        :username="score.username"
        :score="score.overall"
      />
    </div>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 5rem;
  }

  h2 {
    font-size: 3rem;
    margin-bottom: 3rem;
    color: #98c379;
  }

  .ranking {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 10rem;
  }

  @media screen and (max-width: 768px) {
    h2 {
      font-size: 2rem;
    }
  }
</style>
