<script>
   export let pos;
   /* svelte-ignore unused-export-let */
   export let toRight;

   $: console.log(`! pos: `, pos, `top: calc(${(pos / 200) * 160}% + 2px);`);
</script>

<div class=slider-indicator
     style={`top: calc(${(pos / 200) * 160}% + 2px);`} />

<style>
   div {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: white;
      border-radius: 5px;
      margin-left: 2px;

      pointer-events: none;
      z-index: 1;
   }
</style>