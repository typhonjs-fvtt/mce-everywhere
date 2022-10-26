<script>
   import ColorPicker      from 'svelte-awesome-color-picker';

   import PickerIndicator  from './PIckerIndicator.svelte';
   import PickerWrapper    from './PickerWrapper.svelte';
   import SliderIndicator  from './SliderIndicator.svelte';
   import SliderWrapper    from './SliderWrapper.svelte';
   import Wrapper          from './Wrapper.svelte';

   export let hex;

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

<ColorPicker bind:hex
             isPopup={false}
             isInput={false}
             isTextInput={false}
             label={''}
             {components}/>
