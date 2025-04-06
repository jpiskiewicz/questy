<script lang="ts">
  import type { Quest } from "$lib/types";
  import { durationToString } from "$lib/util";

  let { quest, onLongPress }: { quest: Quest; onLongPress: (id: number) => void } = $props();

  let callbackShouldExecute = false;

  const longPressAction = () => {
    callbackShouldExecute = true;
    window.setTimeout(() => callbackShouldExecute && onLongPress(quest.id), 500);
  };
</script>

<div class="holder">
  <button
    class="quest"
    onmousedown={longPressAction}
    onmouseup={() => (callbackShouldExecute = false)}
  >
    <h3>{quest.title}</h3>
    <p>{quest.description}</p>
    <p class="smol">Budżet czasowy: {durationToString(quest.duration, true)}</p>
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
      margin: 0;
    }

    .smol {
      font-size: 0.75rem;
    }
  }
</style>
