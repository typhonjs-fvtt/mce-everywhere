<svelte:options accessors={true} />

<script>
   import { getContext }            from 'svelte';

   import { TJSApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/core';
   import { debounce }              from '@typhonjs-fvtt/runtime/svelte/util';

   import { TJSSettingsEdit }       from '@typhonjs-fvtt/svelte-standard/component';

   import SettingsFooter            from './SettingsFooter.svelte';

   import {
      mceGameSettings,
      mceSessionStorage }           from '../model/index.js';

   import { sessionConstants }      from '../constants.js';

   export let elementRoot;

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

<TJSApplicationShell bind:elementRoot>
   <TJSSettingsEdit settings={mceGameSettings} options={{ storage: mceSessionStorage }}>
      <SettingsFooter slot=settings-footer />
   </TJSSettingsEdit>
</TJSApplicationShell>