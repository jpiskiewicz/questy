<script lang="ts">
  import type { Quest } from "$lib/types";
  import { durationToString } from "$lib/util";

  const start = () =>
    fetch(
      "/api/quests/start?id=" +
        quest.id +
        "&end_time=" +
        (Date.now() + quest.duration * 1000).toString().slice(0, 10),
      {
        method: "PATCH"
      }
    );

  let { quest, onLongPress }: { quest: Quest; onLongPress: (id: number) => void } = $props();

  let pressTimestamp = 0;
  let longPressActionScheduled = false;
</script>

<div class="holder">
  <button
    class="quest"
    onmousedown={() => {
      pressTimestamp = Date.now();
      longPressActionScheduled = true;
      window.setTimeout(() => longPressActionScheduled && onLongPress(quest.id), 500);
    }}
    onmouseup={() => {
      if (Date.now() - pressTimestamp < 500) {
        longPressActionScheduled = false;
        start();
      }
    }}
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
