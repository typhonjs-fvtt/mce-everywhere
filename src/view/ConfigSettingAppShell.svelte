<svelte:options accessors={true} />

<script>
   import { getContext }            from 'svelte';

   import { TJSApplicationShell }   from '#runtime/svelte/component/application';
   import { Timing }                from '#runtime/util';

   import { TJSSettingsEdit }       from '#standard/component/fvtt/settings';

   import SettingsFooter            from './SettingsFooter.svelte';

   import { mceGameSettings }       from '../model/index.js';

   import { sessionConstants }      from '../constants.js';

   export let elementRoot;

   const { application } = getContext('#external');

   // Get a store that is synchronized with session storage.
   const stateStore = application.reactive.sessionStorage.getStore(sessionConstants.appState);

   // Application position store reference. Stores need to be a top level variable to be accessible for reactivity.
   const position = application.position;

   // A debounced callback that serializes application state after 500-millisecond delay.
   const storePosition = Timing.debounce(() => $stateStore = application.state.current(), 500);

   // Reactive statement to invoke debounce callback on Position changes.
   $: storePosition($position);
</script>

<TJSApplicationShell bind:elementRoot>
   <TJSSettingsEdit settings={mceGameSettings} options={{ storage: application.reactive.sessionStorage }}>
      <SettingsFooter slot=settings-footer />
   </TJSSettingsEdit>
</TJSApplicationShell>