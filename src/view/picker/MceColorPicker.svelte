<script>
   import { TJSColorPicker }  from '@typhonjs-fvtt/svelte-standard/component';

   import PickerIndicator  from './PickerIndicator.svelte';
   import SliderIndicator  from './SliderIndicator.svelte';

   export let hsv;

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

<TJSColorPicker bind:hsv={hsv} {options} />
