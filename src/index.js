import { MceEverywhere }         from './override/MceEverywhere.js';

import { mceGameSettings }       from './model/index.js';

import { constants, settings }   from './constants.js';

import '../styles/init.scss';

Hooks.on('ready', () =>
{
   mceGameSettings.init();

   document.getElementsByTagName('head')[0].append(Object.assign(document.createElement('link'), {
      href: 'modules/mce-everywhere/style.css',
      rel: 'stylesheet',
      type: 'text/css',
      media: 'all'
   }));

   const enabled = game.settings.get(constants.moduleId, settings.clientenabled);

   if (enabled)
   {
      console.log('TinyMCE Everywhere! (mce-everywhere) | Initializing');
      MceEverywhere.init();
   }
});