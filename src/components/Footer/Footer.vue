<script setup>
  import { NTooltip } from 'naive-ui'
</script>

<template>
  <footer>
    <div class="left-side">
      <div class="contact">
        <n-tooltip trigger="hover">
          <template #trigger>
            <RouterLink to="/contact" class="text footer-link">
              <font-awesome-icon icon="fa-solid fa-envelope" class="icon" />
              Contact
            </RouterLink>
          </template>
          Contact
        </n-tooltip>
      </div>

      <div class="code">
        <n-tooltip trigger="hover">
          <template #trigger>
            <a href="https://github.com/Hakciu/Typee" class="text footer-link">
              <font-awesome-icon icon="fa-solid fa-code" class="icon" />
              Code
            </a>
          </template>
          Code
        </n-tooltip>
      </div>
    </div>

    <div class="right-side">
      <span class="logo-footer">Typee</span>
      © 2024
    </div>
  </footer>
</template>

<style scoped>
  footer {
    position: fixed;
    bottom: 0;
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    z-index: 1;
    background-color: #2e343e;
  }

  .left-side {
    display: flex;
    gap: 3rem;
  }

  .logo-footer {
    font-family: 'Fasthand', cursive;
    font-size: 1.8rem;
  }

  @media screen and (max-width: 768px) {
    footer {
      width: 100%;
      padding: 0 1rem;
    }

    .left-side {
      gap: 2.5rem;
    }
  }
</style>
