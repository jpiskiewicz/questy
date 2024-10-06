<script lang="ts">
  import { slide } from "svelte/transition";

  let { form } = $props();

  let alert = $state(false);
  $effect(() => {
    if (form?.message) {
      alert = true;
      window.setTimeout(() => (alert = false), 5000);
    }
  });
</script>

<main>
  <div class="alert {form?.success ? 'good' : 'bad'}" class:visible={alert}>
    {form?.message}
  </div>

  <h1>Dawaj, robimy z tego questa</h1>
  <form method="POST">
    <div class="fields">
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Hasło
        <input type="password" name="password" minlength="4" required />
      </label>
    </div>
    <div class="buttons">
      <button class="secondary" formaction="?/register"> Zarejestruj się </button>
      <button class="primary" formaction="?/login"> Zaloguj się </button>
    </div>
  </form>
</main>

<style lang="scss">
  @import "$lib/styles";

  main {
    display: grid;
    grid-template-rows: 52px max-content max-content;
    gap: 3rem;
    padding: 2rem 1rem;
  }

  .alert {
    border: 1px solid $main;
    border-radius: 0.25rem;
    padding: 1rem 2rem;
    transition: transform 0.5s ease-out;
    transform: translateY(calc(0px - (2rem + 100%)));
  }

  .good {
    background: $accent;
  }

  .bad {
    background: $bad;
  }

  .visible {
    transform: translateY(0);
  }

  h1 {
    grid-row-start: 2;
    width: 340px;
    @include hero;
  }

  form,
  label,
  .fields {
    display: flex;
    flex-direction: column;
  }

  form {
    grid-row-start: 3;
    gap: 2rem;
    padding: 2rem 1rem;
    background: $ui;
    border-radius: 0.25rem;
  }

  .fields {
    gap: 1rem;
  }

  label {
    gap: 0.25rem;
  }

  input {
    @include bordered;
  }

  input {
    @include input;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
  }

  button {
    padding: 0.625rem 0;
    width: 7.75rem;
    display: flex;
    justify-content: center;
    font-size: 1rem;

    &:hover {
      cursor: pointer;
    }
  }

  .primary {
    @include button-primary;
  }

  .secondary {
    @include button-minimal;
  }
</style>
