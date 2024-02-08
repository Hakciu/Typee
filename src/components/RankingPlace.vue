<script setup>
  import { RouterLink } from 'vue-router'
  import { ref, onMounted } from 'vue'

  import goldMedalSvg from '@/assets/medals/gold_medal.svg'
  import silverMedalSvg from '@/assets/medals/silver_medal.svg'
  import bronzeMedalSvg from '@/assets/medals/bronze_medal.svg'

  const props = defineProps(['place', 'username', 'score'])

  const formatScore = ref(formatScoreValue(props.score))

  const isMobile = ref(false)

  onMounted(() => {
    isMobile.value =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
  })

  function formatUsername(username) {
    if (isMobile.value && username.length > 10) {
      return `${username.substring(0, 8)}...`
    } else {
      return username
    }
  }

  function formatScoreValue(score) {
    const roundedScore = Number(score).toFixed(2)
    if (roundedScore.includes('.')) {
      return roundedScore
    } else {
      return `${roundedScore}.00`
    }
  }

  // Funkcja zwracająca odpowiednią ikonę medalu na podstawie miejsca
  function getMedalIcon(place) {
    if (place === 1) {
      return goldMedalSvg
    } else if (place === 2) {
      return silverMedalSvg
    } else if (place === 3) {
      return bronzeMedalSvg
    } else {
      // Jeśli miejsce jest większe niż 3, nie wyświetlamy żadnej ikony medalu
      return null
    }
  }

  // Funkcja zwracająca odpowiednią alternatywną tekstową opis ikony medalu na podstawie miejsca
  function getMedalAlt(place) {
    if (place === 1) {
      return 'Gold Medal'
    } else if (place === 2) {
      return 'Silver Medal'
    } else if (place === 3) {
      return 'Bronze Medal'
    } else {
      // Jeśli miejsce jest większe niż 3, nie wyświetlamy alternatywnego tekstu
      return ''
    }
  }
</script>

<template>
  <RouterLink :to="`/profile/${username}`">
    <div
      :class="[
        'element',
        {
          shine: place <= 3, // Dodaj klasę shine dla miejsc 1, 2 i 3
          'shine-anim': place <= 3, // Dodaj klasę shine-anim dla miejsc 1, 2 i 3
          'place-1': place === 1,
          'place-2': place === 2,
          'place-3': place === 3,
        },
      ]"
    >
      <div class="place">
        <h3>{{ place }}</h3>
      </div>

      <div class="username">
        <h3>{{ formatUsername(username) }}</h3>
        <img
          class="medal-icon"
          :src="getMedalIcon(place)"
          height="50"
          :alt="getMedalAlt(place)"
          v-if="place <= 3"
        />
      </div>

      <div class="score">
        <h3>{{ formatScore }}</h3>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
  .element {
    background-color: #272b35;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 5rem;
    border-radius: 5rem;
    gap: 1rem;
    width: 50rem;
    font-size: 1.4em;
  }

  .place,
  .username,
  .score {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .shine {
    position: relative;
    overflow: hidden;
  }
  .shine::before {
    content: '';
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(217, 217, 217, 0.3),
      transparent
    );
  }
  .shine-anim::before {
    animation: shine 4s ease-in-out infinite;
  }

  @keyframes shine {
    0% {
      left: -100%;
      transition-property: left;
    }
    15%,
    100% {
      left: 100%;
      transition-property: left;
    }
  }

  .element.place-1 {
    border: 5px solid #ffd700;
  }

  /* Obramowanie dla miejsca 2 */
  .element.place-2 {
    border: 5px solid #c0c0c0; /* Dowolny kolor dla miejsca 2 */
  }

  /* Obramowanie dla miejsca 3 */
  .element.place-3 {
    border: 5px solid #6d6240; /* Dowolny kolor dla miejsca 3 (brązowy) */
  }

  @media screen and (max-width: 768px) {
    .element {
      width: 100%;
      padding: 1.2rem 2rem;
      font-size: 1rem;
    }

    a {
      display: flex;
      justify-content: center;
    }

    .username {
      gap: 0.2rem;
    }
  }
</style>
