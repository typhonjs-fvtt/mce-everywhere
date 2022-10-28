import { propertyStore }   from '@typhonjs-fvtt/runtime/svelte/store';

import { mceGameSettings } from './mceGameSettings.js';

import { cssVariables }    from './cssVariables.js';

import {
   constants,
   settings }              from '../constants.js';

import { get } from 'svelte/store';

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
   /**
    * Provides a regex to validate theme data properties ensuring they are 6 or 8 length hex colors.
    *
    * @type {RegExp}
    */
   static #hexColorRegex = /^(#[a-zA-Z0-9]{8})|(#[a-zA-Z0-9]{6})$/;

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
// console.log(`! themeStore - get stores`)
      for (const key of Object.keys(this.#stores))
      {
// console.log(`! themeStore - get stores - key: ${key}; value: `, get(this.#stores[key]))
      }

      return this.#stores;
   }

   init()
   {
// console.log(`! themeStore - init`)
      this.#defaultThemeData = this.#selectDefaultData();
      this.#initialThemeData = Object.assign({}, this.#defaultThemeData);

      for (const key of this.#keys)
      {
         this.#data[key] = this.#defaultThemeData[key];
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
// game.settings.set(constants.moduleId, settings.themeData, this.#defaultThemeData);
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
         // '--mce-everywhere-toolbar-background': { h: 0, s: 0, v: 0, a: 0.1 },
         // '--mce-everywhere-toolbar-button-background-hover': { h: 60, s: 7, v: 94, a: 1 },
         // '--mce-everywhere-toolbar-disabled-font-color': { h: 212, s: 45, v: 24, a: 0.5 },
         // '--mce-everywhere-toolbar-font-color': { h: 50, s: 24, v: 10, a: 1 },
         '--mce-everywhere-toolbar-background': '#0000001a',
         '--mce-everywhere-toolbar-button-background-hover': '#f0f0e0',
         '--mce-everywhere-toolbar-disabled-font-color': '#222f3e80',
         '--mce-everywhere-toolbar-font-color': '#191813',
      }
   }

   set(theme, forceUpdateAllSubscribers = false)
   {
      let updateAllSubscribers = forceUpdateAllSubscribers;

      if (!this.#validateThemeData(theme))
      {
// console.log(`! themeStore - set - A - INVALID THEME DATA: `, theme);
         theme = Object.assign({}, this.#initialThemeData);
         updateAllSubscribers = true;
      }

// console.log(`! themeStore - set - 0 - theme: `, theme);
// console.trace();
      for (const key of this.#keys)
      {
         const keyData = theme[key];

         if ((typeof keyData === 'string' || keyData === null) && this.#data[key] !== keyData)
         {
// console.log(`! themeStore - set - 1 - key: ${key} - value: ${keyData}`, );
// console.trace();
// console.log(`! themeStore - set - 2 - current store value: `, get(this.#stores[this.#keyStores[key]]))
            this.#data[key] = keyData;
            cssVariables.setProperty(key, keyData);
         }
      }

      this.#updateSubscribers();

      // // Usually only update the TJSGameSettings store handler on `set`. However, if data validation fails then update
      // // all subscribers including all of the propertyStore instances / `this.#stores` with the new valid data.
      // if (updateAllSubscribers)
      // {
      //    this.#updateSubscribers();
      // }
      // else if (this.#settingsStoreHandler)
      // {
      //    this.#settingsStoreHandler(theme);
      // }

      return this;
   }

   #validateThemeData(themeData)
   {
      if (typeof themeData !== 'object' || themeData === null)
      {
         console.warn(
          `TinyMCE Eveywhere (mce-everywhere) warning: 'theme' data not an object resetting to initial data.`);

         return false;
      }

      for (const key of this.#keys)
      {
         if (!ThemeStore.#hexColorRegex.test(themeData[key]))
         {
            console.warn(
             `TinyMCE Eveywhere (mce-everywhere) warning: data for property '${
               key}' not a hex color. Resetting to initial data.`);

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