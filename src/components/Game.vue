<script setup>
  import { ref, watch, onMounted, reactive, onBeforeMount } from 'vue'
  import { NModal, NCard, NSelect, NSwitch, NNumberAnimation } from 'naive-ui'
  import { shuffle } from '../Utils/utils'
  import { useUserStore } from '@/stores/users'
  import { useRankingStore } from '@/stores/game'
  import gifs from '../data/gifs.json'
  import polish from '../data/dictionary/polish.js'
  import english from '../data/dictionary/english.js'
  import germany from '../data/dictionary/germany.js'
  import spanish from '../data/dictionary/spanish.js'
  import french from '../data/dictionary/french.js'

  const languages = {
    polish,
    english,
    germany,
    spanish,
    french,
  }

  const userStore = useUserStore()
  const rankingStore = useRankingStore()

  const user = ref(null)
  const loading = ref(true)
  const lang = ref(true)
  const logged = ref(false)
  const selectedGif = ref(null)
  const typing = ref(false)
  let err = 0
  const text = ref('')
  const input = ref('')
  const blurEnabled = ref(true)
  const inputRef = ref(null)
  const isGame = ref(true)
  const isResult = ref(false)
  const caretRef = ref(null)
  const error_pos = new Set()
  const duration = ref(0)
  const wpm = ref(0)
  const acc = ref(0)
  const over = ref(0)
  const key = ref('')
  const isModalVisible = ref(false)
  const start_time = ref(0)
  const word_count = ref(0)
  let was_skipped = false
  const prevInputValue = ref('')
  const gameState = reactive({
    position: 0,
    sequence: [],
  })
  const State = {
    REMAINING: 0,
    ERROR: 1,
    TYPED: 2,
    SKIPPED: 3,
    SPACE: 4,
  }

  const adaptiveAlgorithmEnabled = ref(
    JSON.parse(localStorage.getItem('adaptiveAlgorithmEnabled')) || false
  )
  const selectedLanguage = ref(
    localStorage.getItem('selectedLanguage') || 'english'
  )
  const wordCount = ref(JSON.parse(localStorage.getItem('wordCount')) || 25)

  const languageList = ref([
    { value: 'polish', label: 'polish' },
    { value: 'english', label: 'english' },
    { value: 'germany', label: 'germany' },
    { value: 'spanish', label: 'spanish' },
    { value: 'french', label: 'french' },
  ])

  const wordCountList = ref([
    { value: '20', label: '20' },
    { value: '25', label: '25' },
    { value: '30', label: '30' },
    { value: '40', label: '40' },
    { value: '50', label: '50' },
  ])

  const showModal = () => {
    isModalVisible.value = true
  }

  const get_at = (position) => gameState.sequence[position]
  const alphabet = new Set(
    [...Array(26)].map((_, i) => String.fromCharCode(i + 'a'.charCodeAt(0)))
  )
  // Add special characters to alphabet
  alphabet.add(' ')
  'ąćęłńóśźż'.split('').forEach((char) => alphabet.add(char))

  // Check if character is special
  const isSpecialCharacter = (char) => {
    const specialCharacters = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż']
    return specialCharacters.includes(char)
  }

  const errorHistory = reactive({ games: [] })

  // Hide mouse cursor
  const hideMouseCursor = () => {
    document.body.style.cursor = 'none'
  }

  // Show cursor
  const resetMouseCursor = () => {
    document.body.style.cursor = 'auto'
  }

  // Show cursor on mouse move
  document.addEventListener('mousemove', resetMouseCursor)

  // Update the error history
  const updateErrorHistory = () => {
    const currentErrors = {}

    error_pos.forEach((pos) => {
      const char = gameState.sequence[pos].character
      if (!currentErrors[char]) {
        currentErrors[char] = 0
      }
      currentErrors[char]++
    })

    errorHistory.games.push(currentErrors)

    // Remove errors from the first game when the number of games exceeds 5
    if (errorHistory.games.length > 5) {
      errorHistory.games.shift()
    }
    console.log('Update error history:', errorHistory.games)
  }

  // Selects words from a dictionary based on error history
  const selectWordsBasedOnErrorHistory = (dictionary, count) => {
    let words = []
    console.log('ALGORITHM WORKS')

    const aggregatedErrors = {}
    errorHistory.games.forEach((game) => {
      Object.entries(game).forEach(([char, count]) => {
        if (!aggregatedErrors[char]) {
          aggregatedErrors[char] = 0
        }
        aggregatedErrors[char] += count
      })
    })

    const sortedErrors = Object.entries(aggregatedErrors).sort(
      (a, b) => b[1] - a[1]
    )
    const errorChars = sortedErrors.map((entry) => entry[0])

    for (let char of errorChars) {
      const filteredWords = dictionary.filter((word) => word.includes(char))
      words = words.concat(shuffle(filteredWords).slice(0, count))
      if (words.length >= count) break
    }

    console.log('Selected error characters:', errorChars)

    return shuffle(words).slice(0, count)
  }

  /*
    Handles the input event.
    It processes the user's input, updates the game state, and handles the caret position.
  */
  const onInput = () => {
    const currentInput = input.value.toLowerCase()
    const prevInput = prevInputValue.value.toLowerCase()

    if (prevInput.length > currentInput.length) {
      handleBackspace()
    } else {
      const keyPress = currentInput.charAt(currentInput.length - 1)
      if (start_time.value === 0) {
        start_time.value = performance.now()
        hideMouseCursor()
      }
      handleKeyPress(keyPress)
    }

    prevInputValue.value = input.value

    if (caretRef.value && gameState.position < gameState.sequence.length) {
      const currentElm = document.querySelector(
        `#text span:nth-child(${gameState.position + 1})`
      )
      if (currentElm) {
        const bbox = currentElm.getBoundingClientRect()
        caretRef.value.style.left = bbox.left - 1 + 'px'
        caretRef.value.style.top = bbox.top + 'px'
        caretRef.value.style.height = bbox.height + 'px'
      }
    }
  }

  /*
   Handles key press events during the game.
   keyPress - The key that was pressed.
  */
  const handleKeyPress = (keyPress) => {
    hideMouseCursor()
    document.addEventListener('keydown', handleResetKeyDown2)
    const currentPosition = gameState.position
    const currentCharacter = gameState.sequence[currentPosition]

    if (alphabet.has(keyPress) || isSpecialCharacter(keyPress)) {
      if (currentCharacter && currentCharacter.character === keyPress) {
        currentCharacter.state = State.TYPED
        gameState.position++

        if (keyPress === ' ') {
          word_count.value++
          let newPosition = currentPosition + 1
          while (
            newPosition < gameState.sequence.length &&
            get_at(newPosition).character !== ' '
          ) {
            newPosition++
          }
        }
      } else if (currentCharacter.character === ' ' && keyPress !== ' ') {
        currentCharacter.state = State.SPACE
        gameState.position++
      } else if (keyPress === ' ') {
        if (
          gameState.position > 0 &&
          get_at(gameState.position - 1).character !== ' '
        ) {
          let position = gameState.position
          while (
            position < gameState.sequence.length &&
            get_at(position).character !== ' '
          ) {
            error_pos.add(position)
            get_at(position).state = State.SKIPPED
            was_skipped = true
            position++
          }
          gameState.position = position
        }
      } else {
        currentCharacter.state = State.ERROR
        error_pos.add(gameState.position)
        gameState.position++
      }
    }

    if (gameState.position >= gameState.sequence.length) {
      if (!was_skipped) {
        word_count.value++
      }
      done()
    }
  }

  /*
   Handles the backspace key press event.
   If the game state position is greater than 0, it sets the state of the previous character to "REMAINING"
   and decrements the game state position.
  */
  const handleBackspace = () => {
    if (gameState.position > 0) {
      const current = get_at(gameState.position - 1)
      if (current && current.character !== undefined) {
        current.state = State.REMAINING
        gameState.position--
      }
    }
  }

  /**
   Toggles the blur effect and enables typing.
   Removes the event listener for the 'keydown' event.
   Sets the 'blurEnabled' value to false.
   If 'blurEnabled' is false, focuses on the input element and sets 'typing' to true.
  */
  const toggleBlur = () => {
    document.removeEventListener('keydown', handleStartKeyDown)
    blurEnabled.value = false
    if (!blurEnabled.value) {
      inputRef.value.focus()
      typing.value = true
    }
  }

  /*
   Starts the game by selecting words based on the specified criteria.
   If the adaptive algorithm is enabled and there is a history of errors, words are selected based on the error history. Otherwise, words are randomly selected.
   The selected words are shuffled and assigned to the 'text' variable.
   The game state is also initialized with the selected words.
  */
  const start = () => {
    document.addEventListener('keydown', handleStartKeyDown)

    let words = []
    const adaptiveWordsCount = Math.floor((wordCount.value * 2) / 3) // 2/3 słów z algorytmu adaptacyjnego
    const randomWordsCount = wordCount.value - adaptiveWordsCount // Reszta słów losowo

    if (adaptiveAlgorithmEnabled.value && errorHistory.games.length > 0) {
      console.log('Uruchamianie algorytmu adaptacyjnego')
      // Wybierz słowa na podstawie historii błędów
      const errorWords = selectWordsBasedOnErrorHistory(
        languages[selectedLanguage.value],
        adaptiveWordsCount
      )
      // Dodaj resztę słów
      const randomWords = shuffle(languages[selectedLanguage.value]).slice(
        0,
        randomWordsCount
      )
      // Połącz obie listy słów
      words = words.concat(errorWords, randomWords)
    } else {
      console.log('Uruchamianie losowego wyboru słów')
      words = shuffle(languages[selectedLanguage.value]).slice(
        0,
        wordCount.value
      )
    }

    // Wymieszaj wszystkie wybrane słowa
    words = shuffle(words)

    text.value = words.join(' ')

    gameState.sequence = Array.from(text.value).map((character) => ({
      character,
      state: State.REMAINING,
    }))
  }

  /*
   Function that is called when the game is done.
   It performs various calculations and selects a GIF based on the user's typing performance.
  */
  const done = () => {
    // Disable typing
    typing.value = false

    // Add event listener for resetting the game on keydown
    document.addEventListener('keydown', handleResetKeyDown)

    // Reset mouse cursor
    resetMouseCursor()

    // Disable language selection
    lang.value = false

    // Blur the input field
    inputRef.value.blur()

    // Set game and result flags
    isGame.value = false
    isResult.value = true

    // Calculate duration in minutes
    const end_time = performance.now()
    duration.value = (end_time - start_time.value) / 60000

    // Calculate letter count and errors
    const letter_count = text.value.replace(/\s+/g, '').length
    let errors = error_pos.size
    errors += err
    err = 0

    // Calculate words per minute (WPM)
    wpm.value = parseFloat((word_count.value / duration.value).toFixed(2))

    // Calculate accuracy percentage
    acc.value = parseFloat(((1 - errors / letter_count) * 100).toFixed(2))
    if (acc.value < 0) acc.value = 0

    // Calculate overall score
    over.value = parseFloat(((wpm.value * acc.value) / 100).toFixed(2))

    /*
     Function to select a GIF based on the user's typing performance.
     It filters the available GIFs based on WPM and accuracy ranges.
     If a matching GIF is found, it is randomly selected.
     If no matching GIF is found, selectedGif is set to null.
     The selected GIF is then scaled to a maximum width and height of 400 pixels.
    */
    const selectGif = () => {
      loading.value = true

      if (wpm.value >= 120 && acc.value >= 95) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '120+ WPM, 95-100% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 120 && acc.value >= 80) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '120+ WPM, 80-95% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 60 && acc.value >= 95) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '60-120 WPM, 95-100% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 60 && acc.value >= 80) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '60-120 WPM, 80-95% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 40 && acc.value >= 95) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '40-60 WPM, 95-100% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 40 && acc.value >= 80) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '40-60 WPM, 80-95% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 0 && acc.value >= 95) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '0-40 WPM, 95-100% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (wpm.value >= 0 && acc.value >= 80) {
        const matchingGifs = gifs.gifs.filter(
          (gif) => gif.info === '0-40 WPM, 80-95% ACC'
        )
        selectedGif.value = getRandomGif(matchingGifs)
      } else if (acc.value < 80) {
        const matchingGifs = gifs.gifs.filter((gif) => gif.info === '0-80% ACC')
        selectedGif.value = getRandomGif(matchingGifs)
      } else {
        selectedGif.value = null
      }

      // Scale the selected GIF to a maximum width and height of 400 pixels
      if (selectedGif.value) {
        selectedGif.value = scaleGif(selectedGif.value, 400, 400)
      }

      // Update error history if adaptive algorithm is enabled
      if (adaptiveAlgorithmEnabled.value) {
        updateErrorHistory()
      }
    }

    /**
     * Function to scale a GIF to a maximum width and height while maintaining aspect ratio.
     @param {Object} gif - The GIF object to be scaled.
     @param {number} maxWidth - The maximum width of the scaled GIF.
     @param {number} maxHeight - The maximum height of the scaled GIF.
     @returns {Object} - The scaled GIF object.
    */
    const scaleGif = (gif, maxWidth, maxHeight) => {
      const aspectRatio = gif.width / gif.height
      let newWidth = maxWidth
      let newHeight = newWidth / aspectRatio

      if (newHeight > maxHeight) {
        newHeight = maxHeight
        newWidth = newHeight * aspectRatio
      }

      return {
        ...gif,
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      }
    }

    /**
     * Function to get a random GIF from an array of GIFs.
     * @param {Array} gifs - The array of GIFs to choose from.
     * @returns {Object|null} - The randomly selected GIF object, or null if the array is empty.
     */
    const getRandomGif = (gifs) => {
      const randomIndex = Math.floor(Math.random() * gifs.length)
      return gifs[randomIndex] || null
    }

    // Call the selectGif function to choose a GIF based on the user's typing performance
    selectGif()
  }

  /**
   Resets the game state and initializes all variables to their default values.
  */
  const resetGame = () => {
    document.removeEventListener('keydown', handleResetKeyDown)
    document.removeEventListener('keydown', handleResetKeyDown2)
    typing.value = false
    isGame.value = true
    isResult.value = false
    lang.value = true
    gameState.position = 0
    gameState.sequence.forEach((character) => {
      character.state = State.REMAINING
    })

    was_skipped = false
    word_count.value = 0
    wpm.value = 0
    acc.value = 0
    over.value = 0
    duration.value = 0
    start_time.value = 0
    input.value = ''
    blurEnabled.value = true
    prevInputValue.value = ''
    error_pos.clear()

    key.value = ''

    start()
  }

  /*
   Handles the keydown event for starting the game.
   If the spacebar key is pressed, it toggles the blur.
  */
  const handleStartKeyDown = (event) => {
    if (event.keyCode === 32) {
      toggleBlur()
    }
  }

  /*
   Handles the keydown event for resetting the game.
   If the spacebar key is pressed, it resets the game.
  */
  const handleResetKeyDown = (event) => {
    if (event.keyCode === 32) {
      resetGame()
    }
  }

  /*
   Handles the keydown event for resetting the game and blurring the input.
   If the escape key is pressed, it resets the game and blurs the input.
  */
  const handleResetKeyDown2 = (event) => {
    if (event.keyCode === 27) {
      resetGame()
      inputRef.value.blur()
    }
  }

  // Watch adaptiveAlgorithmEnabled
  watch(adaptiveAlgorithmEnabled, (newValue) => {
    localStorage.setItem('adaptiveAlgorithmEnabled', JSON.stringify(newValue))
  })

  // Watch selectedLanguage
  watch(selectedLanguage, (newVal) => {
    localStorage.setItem('selectedLanguage', newVal)
    resetGame()
    start()
  })

  // Watch wordCount
  watch(wordCount, (newValue) => {
    localStorage.setItem('wordCount', JSON.stringify(newValue))
    resetGame()
    start()
  })

  onMounted(() => {
    start()
  })

  /**
   * Watches the `userStore.user` property and updates the `user` and `logged` variables accordingly.
   * If `user` is truthy, sets `logged` to `true`
   * @param {any} newUser - The new value of `userStore.user`.
   */
  watch(
    () => userStore.user,
    async (newUser) => {
      user.value = newUser
      if (user.value) {
        logged.value = true
      } else {
        logged.value = false
      }
    },
    { immediate: true }
  )

  // Prevent selecting all text with Ctrl + A
  const onKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault()
    }
  }

  const saveScore = async () => {
    if (logged.value) {
      let newScore = {
        user_id: user.value.id,
        accuracy: acc.value,
        wpm: wpm.value,
        overall: over.value,
      }
      await rankingStore.saveScore(newScore)
    }
  }

  // Check if game is finished and save score
  watch(isResult, (newVal) => {
    if (newVal) {
      saveScore()
    }
  })
</script>

<template>
  <main>
    <div class="settings">
      <button class="settings-btn" @click="showModal">
        <font-awesome-icon icon="fa-solid fa-gear" class="iconGear" />Settings
      </button>
      <n-modal v-model:show="isModalVisible">
        <n-card
          style="
            width: 600px;
            text-align: center;
            background-color: #2e343e;
            color: #eceef5;
          "
          title="Settings"
          :bordered="false"
          size="huge"
          role="dialog"
        >
          <template #header>
            <h2 style="color: white">Settings</h2>
          </template>
          <div class="options">
            <div class="option">
              <p>Adaptive algorithm</p>
              <n-switch v-model:value="adaptiveAlgorithmEnabled" />
            </div>
            <div class="option">
              <p>Language</p>
              <n-select
                class="selectedLanguage"
                v-model:value="selectedLanguage"
                style="width: 120px"
                :options="languageList"
              ></n-select>
            </div>
            <div class="option">
              <p>Word count</p>
              <n-select
                class="selectedLanguage"
                v-model:value="wordCount"
                style="width: 120px"
                :options="wordCountList"
              ></n-select>
            </div>
          </div>
        </n-card>
      </n-modal>
    </div>

    <div class="text-container" v-if="isGame">
      <div
        :class="['text', { blur: blurEnabled }]"
        @click="toggleBlur"
        v-if="gameState"
      >
        <div id="caret" ref="caretRef" class="caret" v-if="!blurEnabled"></div>
        <div id="text">
          <span
            class="test"
            v-for="(char, index) in gameState.sequence"
            :key="index"
            :class="{
              correct: char.state === State.TYPED,
              error: char.state === State.ERROR,
              skipped: char.state === State.SKIPPED,
              space: char.state === State.SPACE,
            }"
          >
            {{ char.character }}
          </span>
        </div>
      </div>
    </div>

    <div class="result" v-if="isResult">
      <div class="score">
        <div class="results">
          <div class="scoreResult">
            <div class="wpm">WPM:</div>
            <n-number-animation
              ref="numberAnimationInstRef"
              :from="0.0"
              :to="wpm"
              :active="true"
              :precision="2"
            >
            </n-number-animation>
          </div>
          <div class="scoreResult">
            <div class="accuracy">Accuracy:</div>
            <n-number-animation
              ref="numberAnimationInstRef"
              :from="0.0"
              :to="acc"
              :active="true"
              :precision="2"
            >
            </n-number-animation
            >%
          </div>
          <div class="scoreResult">
            <div class="overall">Overall:</div>
            <n-number-animation
              ref="numberAnimationInstRef"
              :from="0.0"
              :to="over"
              :active="true"
              :precision="2"
            >
            </n-number-animation>
          </div>
          <div class="logged" v-if="!logged">
            <RouterLink class="link" to="/login">Log in</RouterLink>
            to save your score
          </div>
        </div>
        <div class="gif-container" style="width: 400px; height: 400px">
          <iframe
            v-if="selectedGif"
            :src="selectedGif.url"
            :width="selectedGif.width"
            :height="selectedGif.height"
            frameborder="0"
            class="giphy-embed"
            allowfullscreen
            ref="gifFrameRef"
            @load="handleGifLoad"
          ></iframe>
        </div>
      </div>

      <div class="reset" @click="resetGame">
        <font-awesome-icon icon="fa-solid fa-rotate-right" />
        <span>click / press spacebar for restart</span>
      </div>
    </div>

    <!-- Hidden Input -->
    <input
      type="text"
      v-model="input"
      ref="inputRef"
      class="hidden-input"
      @input="onInput"
      @keydown="onKeyDown"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      autocapitalize="off"
    />

    <div class="reset2" @click="resetGame" v-if="typing">
      <font-awesome-icon icon="fa-solid fa-rotate-right" />
      <span>click / press escape for restart</span>
    </div>

    <div class="placeholder" v-if="!typing">
      <font-awesome-icon icon="fa-solid fa-rotate-right" />
      <span></span>
    </div>

    <div class="blur-text" v-if="blurEnabled" @click="toggleBlur">
      <span>click / press spacebar to start</span>
    </div>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    font-size: 2rem;
  }
  .settings-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #eceef5;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .option p {
    margin: 0;
    font-size: 1.3rem;
  }

  .options {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .iconGear {
    margin-right: 0.5rem;
  }

  .selectedLanguage {
    color: black !important;
  }

  .blur {
    filter: blur(12px);
  }

  #text {
    padding: 0 5rem;
  }

  .blur-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    color: white;
    cursor: pointer;
    padding-top: 5rem;
  }

  .reset {
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    cursor: pointer;
    margin-top: 1rem;
    padding: 1rem;
  }

  .reset2 {
    font-size: 0.9rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.7rem;
  }

  .gif-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .placeholder {
    color: #2e343e;
    font-size: 0.9rem;
  }

  .logged {
    font-size: 1rem;
    margin-top: 2rem;
    text-align: center;
  }

  .link {
    color: #98c379;
    font-weight: bold;
  }

  .link:hover {
    color: #769a5c;
  }

  /* Game */
  .correct {
    color: #98c278 !important;
    background-color: transparent;
  }

  span > .correct {
    color: #98c278 !important;
    background-color: transparent;
  }

  .error {
    color: #e06d74 !important;
  }

  .space {
    background-color: #f3515b;
    border-radius: 25px 25px 25px 25px;
  }

  .skipped {
    text-decoration: underline !important;
    text-decoration-color: #e06d74 !important;
    text-decoration-thickness: 3px !important;
    color: #d5d7dd !important;
    background-color: transparent;
  }

  .score {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .caret {
    position: absolute;
    background: #528bff;
    width: 3px;
    z-index: 1;
    transition: left 0.09s ease-out;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 25rem;
    padding-left: 3rem;
  }

  .wpm,
  .accuracy,
  .overall {
    font-weight: bold;
  }

  .scoreResult {
    display: flex;
    align-items: center;
    align-items: center;
    gap: 1rem;
  }

  .hidden-input {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  @media screen and (max-width: 768px) {
    #text {
      font-size: 1.3rem;
      padding: 0 2rem;
    }

    .blur-text {
      font-size: 1.5rem;
      width: 80%;
      text-align: center;
    }

    .result {
      flex-direction: column;
      gap: 2rem;
      font-size: 1rem;
    }

    .score {
      flex-direction: column;
      gap: 2rem;
      font-size: 1rem;
    }

    .results {
      padding: 0 0 2rem 0;
    }

    .scoreResult {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gif-container {
      width: 200px !important;
      height: 200px !important;
    }

    .reset {
      margin-top: 3rem;
      margin-bottom: 3rem;
      font-size: 1rem;
    }
  }
</style>
