<script>
   import { localize }        from '@typhonjs-fvtt/runtime/svelte/helper';

   import ColorPicker         from './picker/ColorPicker.svelte';

   import {
      cssVariables,
      mceGameSettings }       from '../model/index.js';

   import { settings }        from '../constants.js';

   const storeToolbarBackground = mceGameSettings.getStore(settings.themeToolbarBackground)
   const storeToolbarFontColor = mceGameSettings.getStore(settings.themeToolbarFontColor)
   const storeToolbarDisabledFontColor = mceGameSettings.getStore(settings.themeToolbarDisabledFontColor)

   $: cssVariables.setProperty('--mce-everywhere-toolbar-background', $storeToolbarBackground);
   $: cssVariables.setProperty('--mce-everywhere-toolbar-font-color', $storeToolbarFontColor);
   $: cssVariables.setProperty('--mce-everywhere-toolbar-disabled-font-color', $storeToolbarDisabledFontColor);

</script>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-background')}</span>
   <div><ColorPicker bind:hex={$storeToolbarBackground} /></div>
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-font-color')}</span>
   <div><ColorPicker bind:hex={$storeToolbarFontColor} /></div>
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-disabled-font-color')}</span>
   <div><ColorPicker bind:hex={$storeToolbarDisabledFontColor} /></div>
</section>

<style>
   div {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex: 3;
      justify-content: flex-end;
      align-items: center;
   }

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

      --picker-height: 50px;
      --picker-width: 50px;
      --slider-width: 10px;
   }

   section:not(:last-child) {
      margin: var(--tjs-settings-entry-margin, 0 0 1rem 0);
   }
</style>