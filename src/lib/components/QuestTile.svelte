<script lang="ts">
  import type { Quest } from "$lib/types";

  let { quest }: { quest: Quest } = $props();
</script>

<div class="holder">
  <button class="quest">
    <h3>{quest.title}</h3>
    <p>{quest.description}</p>
  </button>
</div>

<style lang="scss">
  @import "$lib/styles";

  h3 {
    @include quest-title;
  }

  .holder {
    padding: 0 1rem;
  }

  .quest {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    background: $ui;
    border: none;
    border-radius: 0.25rem;
    padding: 1rem;
    width: 100%;

    p {
      font-size: 1rem;
    }
  }
</style>
