<script>
   export let focused = false;
   /* svelte-ignore unused-export-let */
   export let toRight = false;
</script>

<div class=picker-wrapper class:focused>
   <slot />
</div>

<style>
   div {
      display: inline-block;
      margin-right: 3px;
      height: 54px;
      width: 54px;
      border-radius: var(--tjs-input-color-border-radius, 5px);
      overflow: hidden;

      outline: 2px solid transparent;
      outline-offset: 3px;
      transition: outline 0.2s ease-in-out;
      user-select: none;
   }

   div.focused {
      outline: 2px solid var(--tjs-input-color-focus-outline, red);
   }
</style>