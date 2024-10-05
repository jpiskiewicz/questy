<main>
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
      <button class="primary"> Zaloguj się </button>
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

  input,
  .primary {
    @include bordered;
  }

  input {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 1rem;
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
    &:hover {
      background: $accent;
    }

    &:active {
      background: $accent-active;
    }
  }

  .secondary {
    text-decoration: underline;
    background: transparent;
    border: 1px solid transparent;

    &:hover {
      font-weight: 700;
    }

    &:active {
      color: $accent-active;
    }
  }
</style>
