<script>
   import { TJSColordPicker }  from '@typhonjs-fvtt/svelte-standard/component';

   export let color;

   const options = {
      isTextInput: false,
      isPopup: false,
      width: 80,
   }
</script>

<TJSColordPicker bind:color {options} />
