<script lang="ts">
  import type { Quest } from "$lib/types";
  import { QuestType, QuestStatus } from "$lib/types";
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import QuestTile from "$lib/components/QuestTile.svelte";
  import QuestForm from "$lib/components/QuestForm.svelte";

  let { data } = $props();

  let sessionControlOpen = $state(false);
  let questCreateFormOpen = $state(false);
  let questEditFormOpen = $state(false);
  let editedQuest: number = $state(-1);
  let quests: Quest[] = $state([]);
  let sessionControl: HTMLDivElement | undefined = $state();

  const dismissSessionControl = ({ target }: MouseEvent) => {
    if (!sessionControl?.contains(target as HTMLElement)) {
      sessionControlOpen = false;
    }
  };

  onMount(() => {
    onMount(() => {
      const ws = new WebSocket(base + "/api2/quests");
      ws.onmessage = (e: MessageEvent) => (quests = JSON.parse(e.data));
    });
  });
</script>

{#snippet questListing(name: string, quests: Quest[])}
  <h2>{name}</h2>
  <div class="quests">
    {#each quests as quest}
      <QuestTile
        {quest}
        onLongPress={(id: number) => {
          editedQuest = id;
          questEditFormOpen = true;
        }}
      />
    {/each}
  </div>
{/snippet}

<main>
  <button class="ghost" onclick={() => (sessionControlOpen = !sessionControlOpen)}>
    {data.username}
  </button>
  {#if sessionControlOpen}
    <div class="session-control" bind:this={sessionControl}>
      <a href="{base}/logout" class="minimal"> Wyloguj się </a>
    </div>
    <button class="dismiss" onclick={dismissSessionControl} aria-label="dissmiss button"> </button>
  {/if}
  <section>
    {@render questListing(
      "Questy główne",
      quests.filter(
        ({ type, status }) => type === QuestType.Main && status !== QuestStatus.Finished
      )
    )}
    {@render questListing(
      "Questy poboczne",
      quests.filter(
        ({ type, status }) => type === QuestType.Side && status !== QuestStatus.Finished
      )
    )}
    {@render questListing(
      "Zakończone",
      quests.filter(({ status }) => status === QuestStatus.Finished)
    )}
    <button class="fab" onclick={() => (questCreateFormOpen = true)} aria-label="create new quest">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.6113 21.3888H8.33334V18.6113H18.6113V8.33337H21.3888V18.6113H31.6667V21.3888H21.3888V31.6667H18.6113V21.3888Z"
          fill="black"
        />
      </svg>
    </button>
  </section>
</main>
{#if questCreateFormOpen}
  <QuestForm title="Stwórz questa" action="?/createQuest" bind:isOpened={questCreateFormOpen} />
{/if}
{#if questEditFormOpen}
  <QuestForm
    title="Edytuj questa"
    action="?/editQuest"
    bind:isOpened={questEditFormOpen}
    initialData={quests.find(({ id }) => id === editedQuest)}
  />
{/if}

<style lang="scss">
  @import "$lib/styles";

  main {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 1rem;
    padding: 68px 1rem 1rem;
  }

  .session-control {
    position: absolute;
    z-index: 1;
    top: 0.5rem;
    right: 0.5rem;
    width: 204px;
    display: grid;
    grid-template-rows: 2.5rem 2.5rem;
    justify-content: end;
    background: $ui;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }

  .dismiss {
    position: absolute;
    opacity: 0;
    inset: 0;
  }

  button:hover {
    cursor: pointer;
  }

  .ghost {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    width: max-content;
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    background: transparent;
    border-radius: 0.25rem;
    border: none;
    @include button-text;

    &:hover {
      background: $ui;
    }

    &:active {
      background: $on-ui-active;
    }
  }

  .minimal {
    grid-row-start: 2;
    font-size: 1rem;
    color: $main;
    @include button-minimal;
    width: 6.75rem;
    padding: 0.625rem 0;
    display: flex;
    justify-content: center;
  }

  .quests {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .fab {
    position: fixed;
    bottom: 2rem;
    right: 1rem;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    @include button-primary;
  }
</style>
