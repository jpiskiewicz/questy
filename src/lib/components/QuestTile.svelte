<script lang="ts">
  import type { Quest } from "$lib/types";
  import { QuestStatus } from "$lib/types";
  import { onMount, onDestroy } from "svelte";
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

  const calcLeft = () => (new Date(quest.end_time).valueOf() - Date.now()) / 1000;

  let { quest, onLongPress }: { quest: Quest; onLongPress: (id: number) => void } = $props();

  let pressTimestamp = 0;
  let longPressActionScheduled = false;
  let left = $state(calcLeft());
  let interval: number;

  onMount(() => (interval = window.setInterval(() => (left = calcLeft()), 1000)));
  onDestroy(() => window.clearInterval(interval));
</script>

<div class="quest" class:started={quest.status === QuestStatus.Started}>
  <button
    class="start-quest"
    onmousedown={() => {
      pressTimestamp = Date.now();
      longPressActionScheduled = true;
      window.setTimeout(() => longPressActionScheduled && onLongPress(quest.id - 1), 500);
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
    <div class="time-budget">
      {#if quest.status === QuestStatus.Started}
        <progress max="1" value={1 - left / quest.duration}></progress>
        {#if left > 0}
          <p class="smol">Pozostało: {durationToString(left, true)}</p>
        {/if}
      {:else}
        <p class="smol">Budżet czasowy: {durationToString(quest.duration, true)}</p>
      {/if}
    </div>
  </button>
  {#if quest.status === QuestStatus.Started}
    <div class="end-button-holder">
      <button onclick={() => fetch("/api/quests/end?id=" + quest.id, { method: "PATCH" })}>
        Gotowe
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  @import "$lib/styles";

  h3 {
    @include quest-title;
  }

  .quest {
    border: none;
    background: #fff;
    transition: background 0.5s ease;
    gap: 1rem;
    &.started {
      border: 1px solid #000;
      padding: 0rem 1rem;
      background: $ui;
    }
  }

  .quest,
  .start-quest {
    display: flex;
    flex-direction: column;
    border-radius: 0.25rem;
    border: none;
  }

  .start-quest {
    gap: 0.625rem;
    text-align: left;
    padding: 1rem;
    width: 100%;
    background: $ui;

    p {
      font-size: 1rem;
      margin: 0;
    }

    .smol {
      font-size: 0.75rem;
      white-space: nowrap;
    }
  }

  .time-budget {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  progress {
    appearance: none;
    height: 0.5rem;
    width: 100%;
  }

  progress[value]::-webkit-progress-bar {
    background: $ui;
    border-radius: 0.25rem;
    border: 1px solid #000;
  }

  progress[value]::-webkit-progress-value {
    background: #000;
    border-radius: 0.25rem;
  }

  .end-button-holder {
    padding-bottom: 1rem;
    display: flex;
    justify-content: end;
    button {
      @include button-primary;
      width: 7.75rem;
      padding: 0.75rem 0rem;
    }
  }
</style>
