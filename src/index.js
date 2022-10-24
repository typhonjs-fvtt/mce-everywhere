import { GameSettings }          from './model/GameSettings.js';
import { MceEverywhere }         from './override/MceEverywhere.js';

import { constants, settings }   from './constants.js';

Hooks.on('init', () =>
{
   GameSettings.init();

   const enabled = game.settings.get(constants.moduleId, settings.clientenabled);

   // Append main stylesheet to `head`.
   if (enabled)
   {
      console.log('TinyMCE Everywhere! (mce-everywhere) | Initializing');

      MceEverywhere.init();

      document.getElementsByTagName('head')[0].append(Object.assign(document.createElement('link'), {
         href: 'modules/mce-everywhere/css/mce-everywhere.css',
         rel: 'stylesheet',
         type: 'text/css',
         media: 'all'
      }));
   }
});