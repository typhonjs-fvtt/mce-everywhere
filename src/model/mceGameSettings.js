import { TJSGameSettings }       from '@typhonjs-fvtt/svelte-standard/store';

import { ConfigSettingButton }   from "../view/ConfigSettingButton.js";
import EditorTheming             from '../view/EditorTheming.svelte';

import { constants, settings }   from '../constants.js';

class MceGameSettings extends TJSGameSettings
{
   constructor()
   {
      super(constants.moduleId);
   }

   init()
   {
      const namespace = this.namespace;

      /**
       * Constants for setting scope type.
       *
       * @type {{world: string, client: string}}
       */
      const scope = {
         client: 'client',
         world: 'world'
      };

      const allSettings = [];

      // Add a convenience hook to open settings from macro.
      Hooks.on('mce-everywhere:open:settings', () => {
         if (game.user.isGM) { ConfigSettingButton.showSettings(); }
      });

      // Register a restricted menu for GMs to launch settings from standard Foundry location.
      game.settings.registerMenu(namespace, settings.button, {
         name: 'mce-everywhere.config-button.name',
         label: 'mce-everywhere.config-button.label',
         icon: 'fas fa-dice-d20',
         type: ConfigSettingButton,
         restricted: true,
      });

      if (document)

      // Add custom section component to end of settings for theming options if container queries are available.
      if ('container' in document.documentElement.style)
      {
         this.uiControl.addSection({
            folder: 'mce-everywhere.app.settings.folders.editor-theming',
            class: EditorTheming
         })
      }

      // Top level ---------------------------------------------------------------------------------------------------

      allSettings.push({
         namespace,
         key: settings.clientenabled,
         options: {
            name: 'mce-everywhere.settings.clientenabled.name',
            hint: 'mce-everywhere.settings.clientenabled.hint',
            scope: scope.client,
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
         }
      });

      allSettings.push({
         namespace,
         key: settings.location,
         options: {
            name: 'mce-everywhere.settings.location.name',
            hint: 'mce-everywhere.settings.location.hint',
            scope: scope.world,
            config: true,
            default: 'all',
            type: String,
            choices: {
               all: 'mce-everywhere.settings.location.choices.all',
               onlyJournals: 'mce-everywhere.settings.location.choices.onlyJournals',
               notJournals: 'mce-everywhere.settings.location.choices.notJournals'
            },
            onChange: () =>
            {
               // When changed the editor handlebars helper must render again, so render all UI windows.
               // Note: If by chance that there is an editor in a nop-popOut Application there is a sanity check
               // in `MceEverywhere`.
               if (typeof globalThis.ui.windows === 'object')
               {
                  for (const app of Object.values(globalThis.ui.windows))
                  {
                     if (typeof app?.render === 'function') { app.render(true); }
                  }
               }
            }
         }
      });

      // Editor Settings ---------------------------------------------------------------------------------------------

      allSettings.push({
         namespace,
         key: settings.toolbar,
         folder: 'mce-everywhere.app.settings.folders.editor-settings',
         options: {
            name: 'mce-everywhere.settings.toolbar.name',
            hint: 'mce-everywhere.settings.toolbar.hint',
            scope: scope.world,
            config: true,
            default: 'dynamic',
            type: String,
            choices: {
               dynamic: 'mce-everywhere.settings.toolbar.choices.dynamic',
               extended: 'mce-everywhere.settings.toolbar.choices.extended',
               basic: 'mce-everywhere.settings.toolbar.choices.basic',
               default: 'mce-everywhere.settings.toolbar.choices.default'
            }
         }
      });

      allSettings.push({
         namespace,
         key: settings.cursor,
         folder: 'mce-everywhere.app.settings.folders.editor-settings',
         options: {
            name: 'mce-everywhere.settings.cursor.name',
            hint: 'mce-everywhere.settings.cursor.hint',
            scope: scope.world,
            config: true,
            default: 'start',
            type: String,
            choices: {
               start: 'mce-everywhere.settings.cursor.choices.start',
               end: 'mce-everywhere.settings.cursor.choices.end'
            }
         }
      });

      allSettings.push({
         namespace,
         key: settings.help,
         folder: 'mce-everywhere.app.settings.folders.editor-settings',
         options: {
            name: 'mce-everywhere.settings.help.name',
            hint: 'mce-everywhere.settings.help.hint',
            scope: scope.world,
            config: true,
            default: false,
            type: Boolean
         }
      });

      // Selectively register settings w/ core Foundry based on whether the user is GM.
      this.registerAll(allSettings, !game.user.isGM);
   }
}

export const mceGameSettings = new MceGameSettings();