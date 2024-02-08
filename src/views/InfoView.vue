<script setup></script>

<template>
  <main>
    <p>
      Umiejętność szybkiego i efektywnego pisania na klawiaturze jest nie tylko
      przydatna, ale często niezbędna. Jedną z najlepszych metod na osiągnięcie
      mistrzostwa w pisaniu jest technika "touch typing", która pozwala na
      pisanie szybko i bez konieczności patrzenia na klawiaturę.
    </p>
    <p>
      Palce powinny być umieszczone na klawiszach domowych tak jak na grafice
      poniżej. To ułożenie pozwala na szybki i intuicyjny dostęp do wszystkich
      klawiszy, minimalizując potrzebę ruchu rąk.
    </p>
    <img
      src="https://www.typing.academy/app/source/public/images/intro/en/basic-position.png"
      alt="10 fingers method"
    />
    <p>
      Skup się na precyzji. Upewnij się, że każdy klawisz, który naciskasz, jest
      tym, który zamierzałeś nacisnąć. Pamiętaj, że błędy w pisaniu spowalniają
      Cię bardziej niż umiarkowane tempo z wysoką dokładnością
    </p>
    <p>
      Utrzymuj pozytywne nastawienie i motywuj się do regularnych ćwiczeń. Ustal
      sobie realistyczne cele i ciesz się z każdego postępu. Pamiętaj, że każdy
      mistrz kiedyś zaczynał od podstaw.
    </p>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.3rem;
    text-align: center;
  }

  @media screen and (max-width: 768px) {
    main {
      font-size: 1rem;
      width: 100%;
      margin: 75% 7rem 0 7rem;
      padding: 0 1rem;
      padding-bottom: 15rem;
      text-align: left;
    }

    img {
      width: 100%;
    }
  }
</style>
