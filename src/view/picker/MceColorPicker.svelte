<script>
   import { TJSColordPicker }  from '@typhonjs-fvtt/svelte-standard/component';

   import PickerIndicator  from './PickerIndicator.svelte';
   import SliderIndicator  from './SliderIndicator.svelte';

   export let color;

   const options = {
      isTextInput: false,
      isPopup: false,

      components: {
         alphaIndicator: SliderIndicator,
         pickerIndicator: PickerIndicator,
         sliderIndicator: SliderIndicator,
      }
   }
</script>

<TJSColordPicker bind:color {options} />
