<script>
   import { TJSColorPicker }  from '@typhonjs-fvtt/svelte-standard/component/color-picker';

   import PickerIndicator  from './PickerIndicator.svelte';
   import PickerWrapper    from './PickerWrapper.svelte';
   import SliderIndicator  from './SliderIndicator.svelte';
   import SliderWrapper    from './SliderWrapper.svelte';
   import Wrapper          from './Wrapper.svelte';

   export let hsv;

   const components = {
      alphaIndicator: SliderIndicator,
      alphaWrapper: SliderWrapper,
      pickerIndicator: PickerIndicator,
      pickerWrapper: PickerWrapper,
      sliderIndicator: SliderIndicator,
      sliderWrapper: SliderWrapper,
      wrapper: Wrapper
   };
</script>

<TJSColorPicker bind:hsv={hsv}
                isPopup={false}
                isInput={false}
                isTextInput={false}
                label={''}
                {components} />
