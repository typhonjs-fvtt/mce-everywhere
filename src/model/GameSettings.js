import { constants, settings } from '../constants.js';

export class GameSettings
{
   static init()
   {
      /**
       * Constants for setting scope type.
       *
       * @type {{world: string, client: string}}
       */
      const scope = {
         client: 'client',
         world: 'world'
      };

      // game.settings.registerMenu(namespace, 'custom-autorec', {
      //    label: 'autoanimations.settings.autoRecSetting',
      //    icon: 'fas fa-dice-d20',
      //    type: AutorecShim,
      //    restricted: true,
      // });

      game.settings.register(constants.moduleId, settings.clientenabled, {
         name: 'mce-everywhere.settings.clientenabled.name',
         hint: 'mce-everywhere.settings.clientenabled.hint',
         scope: scope.client,
         config: true,
         default: true,
         type: Boolean,
         requiresReload: true
      });

      game.settings.register(constants.moduleId, settings.cursor, {
         name: 'mce-everywhere.settings.cursor.name',
         hint: 'mce-everywhere.settings.cursor.hint',
         scope: scope.world,
         config: true,
         default: 'start',
         type: String,
         choices: {
            start: 'mce-everywhere.settings.cursor.start',
            end: 'mce-everywhere.settings.cursor.end'
         },
      });

      game.settings.register(constants.moduleId, settings.help, {
         name: 'mce-everywhere.settings.help.name',
         hint: 'mce-everywhere.settings.help.hint',
         scope: scope.world,
         config: true,
         default: false,
         type: Boolean
      });

      game.settings.register(constants.moduleId, settings.journalenabled, {
         name: 'mce-everywhere.settings.journalenabled.name',
         hint: 'mce-everywhere.settings.journalenabled.hint',
         scope: scope.world,
         config: true,
         default: true,
         type: Boolean
      });
   }
}
