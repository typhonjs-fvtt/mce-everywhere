<script>
   import { localize }        from '@typhonjs-fvtt/runtime/svelte/helper';

   import MceColorPicker      from './picker/MceColorPicker.svelte';

   import { themeStore }      from '../model';

   import { TJSColorPicker }  from '@typhonjs-fvtt/svelte-standard/component';

   const {
      toolbarBackground,
      toolbarButtonBackgroundHover,
      toolbarDisabledFontColor,
      toolbarFontColor,
   } = themeStore.stores;

   const options2 = {
      isAlpha: true,
      isPopup: true,
      isTextInput: true
   }
</script>

<div>
   <section class=tjs-settings-entry>
      <span>{localize('mce-everywhere.settings.theme.toolbar-background')}</span>
      <MceColorPicker bind:hsv={$toolbarBackground} />
   </section>

<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-button-hover-background-color')}</span>-->
<!--      <MceColorPicker bind:hsv={$toolbarButtonBackgroundHover} />-->
<!--   </section>-->
<!--   -->
<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-font-color')}</span>-->
<!--      <MceColorPicker bind:hsv={$toolbarFontColor} />-->
<!--   </section>-->
<!--   -->
<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-disabled-font-color')}</span>-->
<!--      <MceColorPicker bind:hsv={$toolbarDisabledFontColor} />-->
<!--   </section>-->

</div>

   <section class=tjs-settings-entry>
      <span>Enable alpha / popup / text input</span>
      <main>
         <input type=checkbox bind:checked={options2.isAlpha}>
         <input type=checkbox bind:checked={options2.isPopup}>
         <input type=checkbox bind:checked={options2.isTextInput}>
         <input type=checkbox on:change={(e) => options2.variant = e.target.checked ? 'chrome' : void 0}>
      </main>
   </section>

<main>
   <TJSColorPicker options={options2} />
</main>

<!--<br />-->
<!--<TJSColorPicker />-->


<style>
   span {
      color: var(--tjs-settings-entry-label-color, inherit);
      font-size: var(--tjs-settings-entry-label-font-size, inherit);
      line-height: var(--tjs-settings-entry-label-line-height, var(--form-field-height));
      flex: 2;
   }

   div {
      --tjs-color-picker-picker-margin: 0 3px 0 0;
      --tjs-color-picker-picker-height: 54px;
      --tjs-color-picker-picker-width: 54px;
      --tjs-color-picker-picker-border-radius: 5px;
      --tjs-color-picker-slider-margin: 0 3px 0 0;
      --tjs-color-picker-slider-height: 54px;
      --tjs-color-picker-slider-width: 10px;
      --tjs-color-picker-wrapper-background: rgba(0, 0, 0, 0.2);
      --tjs-color-picker-wrapper-padding: 3px 0 0 3px;
      --tjs-color-picker-wrapper-margin: 0;
      --tjs-color-picker-wrapper-border-radius: 8px;
      --tjs-color-picker-wrapper-height: 62px;
      --tjs-color-picker-wrapper-width: fit-content;
   }

   main {
      --tjs-color-picker-wrapper-background: rgba(0, 0, 0, 0.2);
   }

   section {
      clear: both;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
   }

   section:not(:last-child) {
      margin: var(--tjs-settings-entry-margin, 0 0 1rem 0);
   }
</style>