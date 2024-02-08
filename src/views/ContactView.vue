<script setup>
  import { ref } from 'vue'
  import { NSpin } from 'naive-ui'

  const email = ref('')
  const message = ref('')
  const loading = ref(false)

  const handleSubmit = () => {
    loading.value = true
    const mailtoLink = `mailto:JJanik2k@gmail.com?subject=Contact Form Submission&body=${encodeURIComponent(
      `Email: ${email.value}%0D%0AMessage: ${message.value}`
    )}`
    window.location.href = mailtoLink
    loading.value = false
  }
</script>

<template>
  <main>
    <form @submit.prevent="handleSubmit">
      <h2>Contact</h2>
      <div class="group">
        <input type="text" v-model="email" required />
        <span class="highlight"></span>
        <span class="bar"></span>
        <label>Email</label>
      </div>
      <div class="group">
        <textarea rows="5" v-model="message" required></textarea>
        <span class="highlight"></span>
        <span class="bar"></span>
        <label>Message</label>
      </div>
      <div class="btn-box">
        <button class="btn">
          <div v-if="loading">
            <n-spin size="small" />
          </div>

          <div v-else>
            <font-awesome-icon icon="fa-solid fa-paper-plane" />
          </div>
          Send
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
  }
  h2 {
    color: #98c379;
    font-size: 1.8rem;
    padding-bottom: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .sep {
    background: #2196f3;
    box-shadow: none;
    border: none;
    height: 2px;
    width: 25%;
    margin: 0 auto 1rem auto;
  }

  .group {
    position: relative;
    margin: 2rem 0;
  }

  textarea {
    resize: none;
  }

  input,
  textarea {
    background: none;
    font-family: Poppins;
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

  textarea:focus ~ label,
  textarea:valid ~ label {
    top: -25px;
    font-size: 13px;
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
