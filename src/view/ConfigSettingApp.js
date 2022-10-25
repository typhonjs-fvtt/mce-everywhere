import { SvelteApplication }  from '@typhonjs-fvtt/runtime/svelte/application';

import ConfigSettingAppShell  from './ConfigSettingAppShell.svelte';

import { sessionConstants }   from '../constants.js';

export class ConfigSettingApp extends SvelteApplication
{
   /** @inheritDoc */
   constructor(options)
   {
      super(options);

      try
      {
         // Attempt to parse session storage item and set application state.
         this.state.set(JSON.parse(sessionStorage.getItem(sessionConstants.appState)));
      }
      catch (err) { /**/ }
   }

   /**
    *
    */
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: 'mce-everywhere.app.settings.title',
         id: 'mce-everywhere-settings',
         resizable: true,
         minimizable: true,
         width: 600,
         height: 750,
         minWidth: 550,

         svelte: {
            class: ConfigSettingAppShell,
            target: document.body
         }
      });
   }
}