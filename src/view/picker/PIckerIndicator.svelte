<script>
   export let pos;

   /* svelte-ignore unused-export-let */
   export let hex;
   export let isDark;

   $: console.log(`! pos: `, pos, `left: calc(${(pos.x / 200) * 160}% + 2px); top: calc(${(pos.y / 200) * 160}% + 2px)`);
</script>

<div class=picker-indicator
     style={`left: calc(${(pos.x / 200) * 160}% + 0.5px); top: calc(${
		(pos.y / 200) * 160}% + 0.5px); box-shadow: 0 0 4px ${isDark ? 'white' : 'black'};`}
/>

<style>
   div {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 5px;

      pointer-events: none;
      z-index: 1;
      transition: box-shadow 0.2s;
   }
</style>