<script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { NSpin, NText } from 'naive-ui'
  import { useUserStore } from '../stores/users'

  const router = useRouter()
  const userStore = useUserStore()
  const loading = ref(false)

  const userCredentials = reactive({
    email: '',
    password: '',
  })

  const handleLogin = async () => {
    loading.value = true
    await userStore.handleLogin(userCredentials)
    errorMessage.value = userStore.errorMessage
    if (!errorMessage.value) {
      loading.value = false
      router.push('/')
    }
  }

  const SignInWithDiscord = async () => {
    loading.value = true
    await userStore.handleDiscordLogin()
    errorMessage.value = userStore.errorMessage
    if (!errorMessage.value) {
      loading.value = false
      router.push('/')
    }
  }

  const errorMessage = ref('')
</script>

<template>
  <main>
    <h2 class="title">Log in</h2>
    <form @submit.prevent="handleLogin">
      <div class="group">
        <input type="text" v-model="userCredentials.email" required />
        <span class="highlight"></span>
        <span class="bar"></span>
        <label>Email</label>
      </div>
      <div class="group">
        <input type="password" v-model="userCredentials.password" required />
        <span class="highlight"></span>
        <span class="bar"></span>
        <label>Password</label>
      </div>
      <NText type="error" v-if="errorMessage">{{ errorMessage }}</NText>
      <button class="btn">
        <div v-if="loading">
          <n-spin size="small" />
        </div>
        <div v-else>
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
          Log in
        </div>
      </button>
    </form>
    <span>Or</span>
    <button class="btn-discord" @click="SignInWithDiscord">
      <font-awesome-icon icon="fa-brands fa-discord" />Log in with Discord
    </button>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .title {
    font-size: 1.8rem;
    color: #98c379;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 1rem;
  }

  span {
    font-size: 1.2rem;
  }

  .btn-discord {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    margin: 1rem 0;
    gap: 0.8rem;
    border: none;
    border-radius: 5rem;
    background-color: #5865f2;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .btn-discord:hover {
    background-color: #3240d7;
  }

  .group {
    position: relative;
    margin: 1.5rem 0;
  }
  textarea {
    resize: none;
  }

  input,
  textarea {
    background: none;
    color: #edeff5;
    font-size: 1rem;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 320px;
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #848484;
  }

  input:focus {
    outline: none;
  }

  input:focus ~ label,
  input:valid ~ label {
    top: -14px;
    font-size: 12px;
    color: #2196f3;
  }

  input:focus ~ .bar:before {
    width: 320px;
  }

  input[type='password'] {
    letter-spacing: 0.3em;
  }

  label {
    color: #848484;
    font-size: 16px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 10px;
    transition: 300ms ease all;
  }

  .bar {
    position: relative;
    display: block;
    width: 320px;
  }

  .bar:before {
    content: '';
    height: 2px;
    width: 0;
    bottom: 0;
    position: absolute;
    background: #2196f3;
    transition: 300ms ease all;
    left: 0%;
  }
</style>
