import { TJSGameSettings }       from '@typhonjs-fvtt/svelte-standard/store';
import { ConfigSettingButton }   from "../view/ConfigSettingButton.js";

import { constants, settings }   from '../constants.js';

class MceGameSettings extends TJSGameSettings
{
   constructor()
   {
      super(constants.moduleId);
   }

   init() {
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

      // Add a convenience hook to open Autorec settings from macro.
      Hooks.on('mce-everywhere:open:settings', () => {
         if (game.user.isGM) { ConfigSettingButton.showSettings(); }
      });

      game.settings.registerMenu(namespace, settings.button, {
         name: 'mce-everywhere.config-button.name',
         label: 'mce-everywhere.config-button.label',
         icon: 'fas fa-dice-d20',
         type: ConfigSettingButton,
         restricted: true,
      });

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
               onlyJournals: 'mce-everywhere.settings.location.choices.only-journals',
               notJournals: 'mce-everywhere.settings.location.choices.not-journals'
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

      // Editor Theme ------------------------------------------------------------------------------------------------

      // TODO REMOVE
      allSettings.push({
         namespace,
         key: settings.journalenabled,
         options: {
            name: 'mce-everywhere.settings.journalenabled.name',
            hint: 'mce-everywhere.settings.journalenabled.hint',
            scope: scope.world,
            config: false,
            default: true,
            type: Boolean
         }
      });

      // Selectively register settings w/ core Foundry based on whether the user is GM.
      this.registerAll(allSettings, !game.user.isGM);
   }
}

export const mceGameSettings = new MceGameSettings();