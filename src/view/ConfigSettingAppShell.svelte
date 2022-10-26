<svelte:options accessors={true} />

<script>
   import { getContext }         from 'svelte';

   import { ApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/core';
   import { debounce }           from '@typhonjs-fvtt/runtime/svelte/util';

   import { TJSSettingsEdit }    from '@typhonjs-fvtt/svelte-standard/component';

   import EditorTheming          from './EditorTheming.svelte';
   import SettingsFooter         from './SettingsFooter.svelte';

   import {
      mceGameSettings,
      mceSessionStorage }        from '../model/index.js';

   import {
      constants,
      sessionConstants }         from '../constants.js';

   export let elementRoot;

   /**
    * Adds extra sections to TJSSettingsEdit.
    *
    * @type {object[]}
    */
   const sections = [{
      label: 'mce-everywhere.app.settings.folders.editor-theming',
      class: EditorTheming,
      store: mceSessionStorage.getStore(`${constants.moduleId}-settings-folder-theming`)
   }];

   const { application } = getContext('external');

   // Get a store that is synchronized with session storage.
   const stateStore = mceSessionStorage.getStore(sessionConstants.appState);

   // Application position store reference. Stores need to be a top level variable to be accessible for reactivity.
   const position = application.position;

   // A debounced callback that serializes application state after 500-millisecond delay.
   const storePosition = debounce(() => $stateStore = application.state.get(), 500);

   // Reactive statement to invoke debounce callback on Position changes.
   $: storePosition($position);
</script>

<ApplicationShell bind:elementRoot>
   <TJSSettingsEdit settings={mceGameSettings} options={{ storage: mceSessionStorage }} {sections}>
      <SettingsFooter slot=settings-footer />
   </TJSSettingsEdit>
</ApplicationShell>