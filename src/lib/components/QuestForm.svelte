<script lang="ts">
  import type { BlurParams, TransitionConfig } from "svelte/transition";
  import type { Quest } from "$lib/types";
  import { QuestType } from "$lib/types";
  import { sineInOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import { durationToString } from "$lib/util";
  import { enhance } from "$app/forms";

  let {
    title,
    action,
    isOpened = $bindable(),
    initialData = undefined
  }: {
    title: string;
    action: string;
    isOpened: boolean;
    initialData?: Quest;
  } = $props();

  const questTypes = [
    { id: QuestType.Main, name: "główny" },
    { id: QuestType.Side, name: "poboczny" }
  ];
  let chosenQuestType = $state(initialData?.type || questTypes[0].id);

  const fadeFly = (
    node: HTMLElement,
    params: BlurParams | undefined = undefined
  ): TransitionConfig => {
    const prevTransform = getComputedStyle(node).transform.replace("none", "");
    return {
      delay: params?.delay || 0,
      duration: params?.duration || 250,
      easing: params?.easing || sineInOut,
      css: (t: number, u: number) => `transform: ${prevTransform} translateY(${29 * u}px);
               opacity: ${Math.min(t * 1.5, 1)};
               pointer-events: none;`
    };
  };

  onMount(() => (document.body.style["overflow"] = "hidden"));
  onDestroy(() => (document.body.style["overflow"] = "auto"));
</script>

<button
  class="bg"
  onclick={() => (isOpened = false)}
  aria-label="dismiss"
  transition:fade={{ duration: 250 }}
></button>
<form transition:fadeFly method="POST" use:enhance onsubmit={() => (isOpened = false)} {action}>
  <h2>{title}</h2>
  <div class="inputs">
    <label>
      Typ questa
      <input type="hidden" name="type" value={chosenQuestType} required />
      <div class="segmented-control">
        {#each questTypes as { id, name }}
          <button
            type="button"
            class:selected={id === chosenQuestType}
            onclick={() => (chosenQuestType = id)}>{name}</button
          >
        {/each}
      </div>
    </label>
    <label>
      Tytuł
      <input name="title" minlength="1" maxlength="256" value={initialData?.title} required />
    </label>
    <label>
      Opis
      <textarea name="description" rows="3">{initialData?.description}</textarea>
    </label>
    <label>
      Budżet czasowy
      <input
        type="time"
        name="time"
        min="00:01"
        value={durationToString(initialData?.duration)}
        required
      />
    </label>
    <input type="hidden" name="id" value={initialData?.id} />
  </div>
  <div class="button-holder">
    <button>Gotowe</button>
  </div>
</form>

<style lang="scss">
  @import "$lib/styles";

  .bg {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    border: none;
  }

  form,
  label,
  .inputs {
    display: flex;
    flex-direction: column;
  }

  form {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 2;
    padding: 2rem 1rem;
    gap: 2rem;
    background: $ui;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  h2 {
    @include section-name;
    margin: 0;
  }

  .inputs {
    gap: 1rem;
    padding: 0 1rem;
  }

  label {
    gap: 0.25rem;
  }

  button:hover {
    cursor: pointer;
  }

  .segmented-control,
  input,
  textarea {
    @include bordered;
  }

  .segmented-control,
  input {
    @include input;
  }

  .segmented-control {
    padding: 0.25rem;
    display: flex;

    button {
      width: 100%;
      height: 100%;
      border-radius: 0.25rem;
      border: none;
      background: $bg;
      font-size: 1rem;

      &.selected {
        background: $on-ui-active;
        font-weight: 700;
      }
    }
  }

  input[type="time"] {
    width: max-content;
  }

  textarea {
    font-size: 1rem;
    resize: none;
  }

  .button-holder {
    display: flex;
    justify-content: right;

    button {
      @include button-primary;
      width: 9.25rem;
      padding: 0.625rem 0;
    }
  }
</style>
