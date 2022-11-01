<script>
   import { localize }        from '@typhonjs-fvtt/runtime/svelte/helper';

   import MceColorPicker      from './picker/MceColorPicker.svelte';

   import { themeStore }      from '../model';

   const {
      toolbarBackground,
      toolbarButtonBackgroundHover,
      toolbarDisabledFontColor,
      toolbarFontColor,
   } = themeStore.stores;
</script>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-background')}</span>
   <MceColorPicker bind:hsv={$toolbarBackground} />
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-button-hover-background-color')}</span>
   <MceColorPicker bind:hsv={$toolbarButtonBackgroundHover} />
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-font-color')}</span>
   <MceColorPicker bind:hsv={$toolbarFontColor} />
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-disabled-font-color')}</span>
   <MceColorPicker bind:hsv={$toolbarDisabledFontColor} />
</section>

<style>
   span {
      color: var(--tjs-settings-entry-label-color, inherit);
      font-size: var(--tjs-settings-entry-label-font-size, inherit);
      line-height: var(--tjs-settings-entry-label-line-height, var(--form-field-height));
      flex: 2;
   }

   section {
      clear: both;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;

      --tjs-color-picker-picker-height: 50px;
      --tjs-color-picker-picker-width: 50px;
      --tjs-color-picker-slider-width: 10px;
   }

   section:not(:last-child) {
      margin: var(--tjs-settings-entry-margin, 0 0 1rem 0);
   }
</style>