<script lang="ts">
  import type { Quest } from "$lib/types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import QuestTile from "$lib/components/QuestTile.svelte";
  import QuestForm from "$lib/components/QuestForm.svelte";

  let { data } = $props();

  let sessionControlOpen = $state(false);
  let questCreateFormOpen = $state(false);
  let questEditFormOpen = $state(false);
  let editedQuest: number = $state(-1);
  let quests: Quest[] = $state([]);
  let sessionControlHolder: HTMLDivElement;

  const dismissSessionControl = ({ target }: MouseEvent) => {
    if (!sessionControlHolder.contains(target as HTMLElement)) {
      sessionControlOpen = false;
    }
  };

  const performAuthenticatedRequest = async (url: string): Promise<Response | null> => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) goto("/logout"); // Probably auth error
      return resp;
    } catch (err) {
      console.log(err);
      goto("/logout");
    }
    return null;
  };

  const loadQuestList = async () => {
    const resp = await performAuthenticatedRequest("/api/quests");
    if (resp) {
      quests = await resp.json();
    }
  };

  const startQuestInvalidationHandler = async () => {
    const resp = await performAuthenticatedRequest("/api/stream");
    if (!resp) return;
    const reader = resp.body!.getReader();
    const handleInvalidation = async ({
      done
    }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
      if (!done) {
        const res = await reader.read();
        handleInvalidation(res);
      }
    };
    handleInvalidation(await reader.read());
  };

  onMount(() => {
    loadQuestList();
    startQuestInvalidationHandler();
  });
</script>

<main>
  {#if sessionControlOpen}
    <button class="dismiss-button" onclick={dismissSessionControl} aria-label="dissmiss button">
    </button>
  {/if}
  <nav>
    <div class="session-control-holder" bind:this={sessionControlHolder}>
      <button class="ghost" onclick={() => (sessionControlOpen = !sessionControlOpen)}>
        {data.username}
      </button>
      {#if sessionControlOpen}
        <div>
          <a href="/logout" class="minimal"> Wyloguj się </a>
        </div>
      {/if}
    </div>
  </nav>
  <h2>Questy główne</h2>
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
  <button class="fab" onclick={() => (questCreateFormOpen = true)} aria-label="create new quest">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.6113 21.3888H8.33334V18.6113H18.6113V8.33337H21.3888V18.6113H31.6667V21.3888H21.3888V31.6667H18.6113V21.3888Z"
        fill="black"
      />
    </svg>
  </button>
</main>
{#if questCreateFormOpen}
  <QuestForm title="Stwórz questa" action="?/createQuest" bind:isOpened={questCreateFormOpen} />
{/if}
{#if questEditFormOpen}
  <QuestForm
    title="Edytuj questa"
    action="?/editQuest"
    bind:isOpened={questEditFormOpen}
    initialData={quests[editedQuest - 1]}
  />
{/if}

<style lang="scss">
  @import "$lib/styles";

  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .dismiss-button {
    position: absolute;
    opacity: 0;
    inset: 0;
    z-index: -1;
  }

  nav {
    display: flex;
    justify-content: flex-end;
  }

  .session-control-holder {
    position: relative;

    div {
      position: absolute;
      top: -0.5rem;
      left: -0.5rem;
      width: 204px;
      display: grid;
      grid-template-rows: 2.5rem 2.5rem;
      justify-content: end;
      background: $ui;
      border-radius: 0.5rem;
      z-index: -1;
      padding: 0.5rem;
    }
  }

  button:hover {
    cursor: pointer;
  }

  .ghost {
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
