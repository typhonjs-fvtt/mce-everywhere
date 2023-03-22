<script>
   import { themeStore }      from '../model';

   import SectionColor        from './components/SectionColor.svelte';

   // Stores the components for theme entry `options.type`
   const types = {
      color: SectionColor
   };

   const components = themeStore.components;
</script>

<div>
   {#each components as options}
      <svelte:component this={types[options.type]} {options} />
   {/each}
</div>
