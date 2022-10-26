<script>
   /** @type {HTMLElement} */
   export let wrapper = void 0;

   /** @type {boolean} */
   export let isOpen = false;

   /** @type {boolean} */
   export let isPopup = true;

   /* svelte-ignore unused-export-let */
   export let toRight = false;
</script>

<div class=wrapper
     bind:this={wrapper}
     class:isOpen
     class:isPopup
     role={isPopup ? 'dialog' : void 0}
     aria-label="color picker">
   <slot />
</div>

<style>
   div {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 3px 0 0 4px;
      border: 1px solid black;
      border-radius: 8px;
      display: none;
      width: fit-content;
      height: 61px;
   }
   .isOpen {
      display: block;
   }
   .isPopup {
      position: absolute;
      top: 25px;
      z-index: 2;
   }
</style>