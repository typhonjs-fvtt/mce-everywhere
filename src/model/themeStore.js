import { getFormat }       from '@typhonjs-fvtt/runtime/color/colord';
import { propertyStore }   from '@typhonjs-fvtt/runtime/svelte/store';

import { mceGameSettings } from './mceGameSettings.js';

import { cssVariables }    from './cssVariables.js';

import {
   constants,
   settings }              from '../constants.js';

/**
 * @typedef {object} ThemeStores
 *
 * @property {import('svelte/store').Writable<string|null>} toolbarBackground -
 *
 * @property {import('svelte/store').Writable<string|null>} toolbarButtonBackgroundHover -
 *
 * @property {import('svelte/store').Writable<string|null>} toolbarDisabledFontColor -
 *
 * @property {import('svelte/store').Writable<string|null>} toolbarFontColor -
 *
 */

class ThemeStore
{
   #defaultThemeData;

   #initialThemeData;

   #settingsStoreHandler;

   #data = {};

   #keys = [
      '--mce-everywhere-toolbar-background',
      '--mce-everywhere-toolbar-button-background-hover',
      '--mce-everywhere-toolbar-disabled-font-color',
      '--mce-everywhere-toolbar-font-color',
   ];

   #keyStores = {
      '--mce-everywhere-toolbar-background': 'toolbarBackground',
      '--mce-everywhere-toolbar-button-background-hover': 'toolbarButtonBackgroundHover',
      '--mce-everywhere-toolbar-disabled-font-color': 'toolbarDisabledFontColor',
      '--mce-everywhere-toolbar-font-color': 'toolbarFontColor',
   };

   /**
    * Stores the subscribers.
    *
    * @type {(function(data): void)[]}
    */
   #subscriptions = [];

   #stores = {}

   /**
    * @returns {ThemeStores}
    */
   get stores()
   {
      return this.#stores;
   }

   init()
   {
      this.#defaultThemeData = this.#selectDefaultData();
      this.#initialThemeData = Object.assign({}, this.#defaultThemeData);

      for (const key of this.#keys)
      {
         // this.#data[key] = this.#defaultThemeData[key];
         this.#stores[this.#keyStores[key]] = propertyStore(this, key);
      }

      this.#settingsStoreHandler = mceGameSettings.register({
         namespace: mceGameSettings.namespace,
         key: settings.themeData,
         store: this,
         options: {
            scope: 'world',
            config: false,
            default: Object.assign({}, this.#defaultThemeData),
            type: Object
         }
      });

      this.#initialThemeData = game.settings.get(constants.moduleId, settings.themeData);

      if (!this.#validateThemeData(this.#initialThemeData))
      {
         console.warn(
          `TinyMCE Everywhere! (mce-everywhere) warning: Initial theme data invalid. Setting to system default.`);

         this.#initialThemeData = Object.assign({}, this.#defaultThemeData);

         this.set(Object.assign({}, this.#initialThemeData), true);
      }
   }

   #selectDefaultData()
   {
      return {
         '--mce-everywhere-toolbar-background': 'hsla(0, 0%, 0%, 0.1)',
         '--mce-everywhere-toolbar-button-background-hover': 'hsl(60, 35%, 91%)',
         '--mce-everywhere-toolbar-disabled-font-color': 'hsla(212, 29%, 19%, 0.5)',
         '--mce-everywhere-toolbar-font-color': 'hsl(50, 14%, 9%)'
      };
   }

   /**
    * Sets the theme store with new data.
    *
    * @param {object}   theme -
    *
    * @returns {ThemeStore}
    */
   set(theme)
   {
     if (!this.#validateThemeData(theme)) { theme = Object.assign({}, this.#initialThemeData); }

      for (const key of this.#keys)
      {
         const keyData = theme[key];

         this.#data[key] = keyData;
         cssVariables.setProperty(key, keyData);
      }

      this.#updateSubscribers();

      return this;
   }

   /**
    * Validates the given theme data object ensuring that all parameters are found and are correct HSVA values.
    *
    * @param {object}   themeData -
    *
    * @returns {boolean} Validation status.
    */
   #validateThemeData(themeData)
   {
      if (typeof themeData !== 'object' || themeData === null)
      {
         console.warn(
          `TinyMCE Eveywhere (mce-everywhere) warning: 'theme' data is not an object resetting to initial data.`);

         return false;
      }

      for (const key of this.#keys)
      {
         const data = themeData[key];

         if (getFormat(data) !== 'hsl')
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: data for property '${
             key}' is not a HSL color string. Resetting to initial data.`);

            return false;
         }
      }

      return true;
   }

   // ------------

   /**
    * Updates all subscribers
    */
   #updateSubscribers()
   {
      const data = Object.assign({}, this.#data);

      // Early out if there are no subscribers.
      if (this.#subscriptions.length > 0)
      {
         for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](data); }
      }
   }

   /**
    * @param {function(data): void} handler - Callback function that is invoked on update / changes.
    * Receives copy of the theme data.
    *
    * @returns {(function(data): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(Object.assign({}, this.#data));                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

export const themeStore = new ThemeStore();