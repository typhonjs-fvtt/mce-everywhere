import { TJSThemeStore }   from './TJSThemeStore.js';

import { mceGameSettings } from './mceGameSettings.js';

import { cssVariables }    from './cssVariables.js';

import {
   constants,
   settings }              from '../constants.js';

export const themeStore = new TJSThemeStore({
   namespace: constants.moduleId,
   key: settings.themeData,
   gameSettings: mceGameSettings,
   styleManager: cssVariables
});