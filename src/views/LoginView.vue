<script setup>
  import LoginForm from '@/components/LoginForm.vue'
  import RegisterForm from '@/components/RegisterForm.vue'
</script>

<template>
  <div>
    <RegisterForm />
    <LoginForm />
  </div>
</template>

<style scoped>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 15rem;
  }

  @media screen and (max-width: 768px) {
    div {
      flex-direction: column-reverse;
      gap: 10rem;
      margin-top: 35rem;
      padding-bottom: 35rem;
    }
  }
</style>
