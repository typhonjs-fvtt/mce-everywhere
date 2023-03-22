import { TJSThemeStore }   from './TJSThemeStore.js';

import { mceGameSettings } from './mceGameSettings.js';

import { cssVariables }    from './cssVariables.js';

import {
   constants,
   settings }              from '../constants.js';

const data = [
   {
      label: 'mce-everywhere.settings.theme.toolbar-background',
      var: '--mce-everywhere-toolbar-background',
      type: 'color',
      format: 'hsl',
      default: 'hsla(0, 0%, 0%, 0.1)'
   },
   {
      label: 'mce-everywhere.settings.theme.toolbar-button-hover-background-color',
      var: '--mce-everywhere-toolbar-button-background-hover',
      type: 'color',
      format: 'hsl',
      default: 'hsl(60, 35%, 91%)'
   },
   {
      label: 'mce-everywhere.settings.theme.toolbar-font-color',
      var: '--mce-everywhere-toolbar-font-color',
      type: 'color',
      format: 'hsl',
      default: 'hsl(50, 14%, 9%)'
   },
   {
      label: 'mce-everywhere.settings.theme.toolbar-disabled-font-color',
      var: '--mce-everywhere-toolbar-disabled-font-color',
      type: 'color',
      format: 'hsl',
      default: 'hsla(212, 29%, 19%, 0.5)'
   },
];

export const themeStore = new TJSThemeStore({
   namespace: constants.moduleId,
   key: settings.themeData,
   gameSettings: mceGameSettings,
   styleManager: cssVariables,
   data
});