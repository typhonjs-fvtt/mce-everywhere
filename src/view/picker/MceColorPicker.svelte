<script>
   import { TJSColorPicker }  from '@typhonjs-fvtt/svelte-standard/component/color-picker';

   import PickerIndicator  from './PickerIndicator.svelte';
   import SliderIndicator  from './SliderIndicator.svelte';

   export let hsv;
   export let options;

   const components = {
      alphaIndicator: SliderIndicator,
      pickerIndicator: PickerIndicator,
      sliderIndicator: SliderIndicator,
   };
</script>

<TJSColorPicker bind:hsv={hsv}
                isPopup={false}
                isInput={false}
                isTextInput={false}
                {components}
                {options} />
