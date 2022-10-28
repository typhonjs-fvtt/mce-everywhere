<script>
   import { localize }        from '@typhonjs-fvtt/runtime/svelte/helper';

   import ColorPicker         from './picker/ColorPicker.svelte';

   import { themeStore }      from '../model';

   const {
      toolbarBackground,
      toolbarButtonBackgroundHover,
      toolbarDisabledFontColor,
      toolbarFontColor,
   } = themeStore.stores;

   $: console.log(`! EditorTheming - toolbarBackground: `, $toolbarBackground);
   $: console.log(`! EditorTheming - toolbarButtonBackgroundHover: `, $toolbarButtonBackgroundHover);
   $: console.log(`! EditorTheming - toolbarDisabledFontColor: `, $toolbarDisabledFontColor);
   $: console.log(`! EditorTheming - toolbarFontColor: `, $toolbarFontColor);
</script>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-background')}</span>
   <div class=picker-1><ColorPicker bind:hex={$toolbarBackground} /></div>
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-button-hover-background-color')}</span>
   <div class=picker-2><ColorPicker bind:hex={$toolbarButtonBackgroundHover} /></div>
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-font-color')}</span>
   <div class=picker-3><ColorPicker bind:hex={$toolbarFontColor} /></div>
</section>

<section class=tjs-settings-entry>
   <span>{localize('mce-everywhere.settings.theme.toolbar-disabled-font-color')}</span>
   <div class=picker-4><ColorPicker bind:hex={$toolbarDisabledFontColor} /></div>
</section>

<style>
   div {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex: 1;
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