<script>
   import { localize }        from '@typhonjs-fvtt/runtime/svelte/helper';

   import MceColorPicker      from './picker/MceColorPicker.svelte';

   import { themeStore }      from '../model';

   import { TJSColordPicker }  from '@typhonjs-fvtt/svelte-standard/component';
   import { TJSColordPickerSavedColors }  from '@typhonjs-fvtt/svelte-standard/component';

   const {
      toolbarBackground,
      toolbarButtonBackgroundHover,
      toolbarDisabledFontColor,
      toolbarFontColor,
   } = themeStore.stores;

   const options2 = {
      addons: [TJSColordPickerSavedColors],
      format: 'hsl',
      formatType: 'string',
      hasAddons: true,
      hasAlpha: true,
      hasButtonBar: true,
      hasTextInput: true,
      isPopup: true,
      lockTextFormat: false,
      precision: 0,
      width: 80
   };

   // $: console.log(`! EditorTheming - $toolbarBackground: `, $toolbarBackground)

   // let color = '#ff0000';
   // let color = 'rgba(255, 50, 50, 0.5)';
   // let color = 'hsla(240, 50%, 100%, 0.5)';
   // let color = { h: 180, s: 100, v: 100, a: 0.35 };

   // let color = 'hsla(-0.25turn 50% 100% / 0.5)';
   // let color = 'hsla(-0.25456565656turn 99.456546456456% 50% / 0.5)';

   // let color = 'hsl(240, 100%, 50%, 0.5)';
   // let color = 'hsla(240, 50%, 99%, 0.5)';

   // let color = void 0;

   let color = 'hsl(240 100% 50% / 0.5)';

</script>

<div>
   <section class=tjs-settings-entry>
      <span>{localize('mce-everywhere.settings.theme.toolbar-background')}</span>
      <MceColorPicker bind:color={$toolbarBackground} />
   </section>

<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-button-hover-background-color')}</span>-->
<!--      <MceColorPicker bind:color={$toolbarButtonBackgroundHover} />-->
<!--   </section>-->

<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-font-color')}</span>-->
<!--      <MceColorPicker bind:color={$toolbarFontColor} />-->
<!--   </section>-->

<!--   <section class=tjs-settings-entry>-->
<!--      <span>{localize('mce-everywhere.settings.theme.toolbar-disabled-font-color')}</span>-->
<!--      <MceColorPicker bind:color={$toolbarDisabledFontColor} />-->
<!--   </section>-->

</div>

   <section class=tjs-settings-entry>
      <main>
         <label>Text Input:<input type=checkbox bind:checked={options2.hasTextInput}></label>
         <label>Button Bar:<input type=checkbox bind:checked={options2.hasButtonBar}></label>
         <label>Addons:<input type=checkbox bind:checked={options2.hasAddons}></label>

         <label>Chrome Layout:<input type=checkbox on:change={(e) => options2.layout = e.target.checked ? 'chrome' : void 0}></label>
         <label>Enable Alpha:<input type=checkbox bind:checked={options2.hasAlpha}></label>
         <label>Lock Text Format:<input type=checkbox bind:checked={options2.lockTextFormat}></label>
         <label>Popup:<input type=checkbox bind:checked={options2.isPopup}></label>
      </main>
   </section>

   <section class=tjs-settings-entry>
      <main>
         <label>Format:
            <select bind:value={options2.format}>
               <option value=hex>HEX</option>
               <option value=hsl>HSL</option>
               <option value=hsv>HSV</option>
               <option value=rgb>RGB</option>
            </select>
         </label>
         <label>Type:
            <select bind:value={options2.formatType}>
               <option value=string>String</option>
               <option value=object>Object</option>
            </select>
         </label>
         <label>Precision: <input type=range min=0 max=10 bind:value={options2.precision} style="width: 100px"></label>
         <label>Width: <input type=range min=50 max=400 bind:value={options2.width} style="width: 100px"> ({options2.width})</label>
      </main>
   </section>

   <section class=tjs-settings-entry>
      <span>{typeof color === 'object' ? JSON.stringify(color) : color}</span>
   </section>

<main>
   <TJSColordPicker bind:color options={options2} />
   <TJSColordPicker bind:color options={options2} />
</main>

<!--<main>-->
<!--   <TJSColordPicker bind:color options={options2} />-->
<!--</main>-->

<style>
   input {
   margin: 0 8px;
      vertical-align: bottom;
      position: relative;
      top: 1px;
   }

   input[type=range] {
      vertical-align: center;
   }

   select {
      color: #b5b3a4
   }

   span {
      color: var(--tjs-settings-entry-label-color, inherit);
      font-size: var(--tjs-settings-entry-label-font-size, inherit);
      line-height: var(--tjs-settings-entry-label-line-height, var(--form-field-height));
      flex: 2;
   }

   div {
      --tjs-color-picker-wrapper-background: rgba(0, 0, 0, 0.2);
   }

   main {
      --tjs-color-picker-container-width: 90%;
      --tjs-color-picker-wrapper-background: rgba(0, 0, 0, 0.2);

      display: flex;
      justify-content: space-between;
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