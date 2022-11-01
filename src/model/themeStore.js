import { colord }          from '@typhonjs-fvtt/runtime/color/colord';
import { propertyStore }   from '@typhonjs-fvtt/runtime/svelte/store';
import { isObject }        from '@typhonjs-fvtt/runtime/svelte/util';

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
         '--mce-everywhere-toolbar-background': { h: 0, s: 0, v: 0, a: 0.1 },
         '--mce-everywhere-toolbar-button-background-hover': { h: 60, s: 7, v: 94, a: 1 },
         '--mce-everywhere-toolbar-disabled-font-color': { h: 212, s: 45, v: 24, a: 0.5 },
         '--mce-everywhere-toolbar-font-color': { h: 50, s: 24, v: 10, a: 1 }
      };
   }

   /**
    * Sets the theme store with new data.
    *
    * TODO: Needs a rework at some point. TJSColorPicker is a new component and currently only serializes HSV colors
    * to an object. This is problematic when using `propertyStore` on the single setting containing multiple CSS
    * variables also stored as objects due to the `propertyStore` not being able to check for equality.
    *
    * When TJSColorPicker is upgraded to handle data + text strings ideally switching to HSV color strings will
    * relax the restriction of notifying all subscribers / `propertyStores`.
    *
    * @param {object}   theme -
    *
    * @param {boolean}  forceUpdateAllSubscribers -
    *
    * @returns {ThemeStore}
    */
   set(theme, forceUpdateAllSubscribers = false)
   {
      let updateAllSubscribers = forceUpdateAllSubscribers;

      if (!this.#validateThemeData(theme))
      {
         theme = Object.assign({}, this.#initialThemeData);
         updateAllSubscribers = true;
      }

      for (const key of this.#keys)
      {
         const keyData = theme[key];

         this.#data[key] = keyData;
         cssVariables.setProperty(key, colord(keyData).toHex());
      }

      // Usually only update the TJSGameSettings store handler on `set`. However, if data validation fails then update
      // all subscribers including all the propertyStore instances / `this.#stores` with the new valid data.
      if (updateAllSubscribers)
      {
         this.#updateSubscribers();
      }
      else if (this.#settingsStoreHandler)
      {
         this.#settingsStoreHandler(theme);
      }

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
          `TinyMCE Eveywhere (mce-everywhere) warning: 'theme' data not an object resetting to initial data.`);

         return false;
      }

      for (const key of this.#keys)
      {
         const data = themeData[key];

         if (!isObject(data))
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: data for property '${
             key}' not an object. Resetting to initial data.`);

            return false;
         }

         if (typeof data.h !== 'number' || data.h < 0 || data.h > 360)
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: 'hue (h)' for property '${
             key}' is malformed or out of range. Resetting to initial data.`);

            return false;
         }

         if (typeof data.s !== 'number' || data.s < 0 || data.s > 100)
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: 'saturation (s)' for property '${
             key}' is malformed or out of range. Resetting to initial data.`);

            return false;
         }

         if (typeof data.v !== 'number' || data.v < 0 || data.v > 100)
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: 'value (v)' for property '${
             key}' is malformed or out of range. Resetting to initial data.`);

            return false;
         }

         if (typeof data.a !== 'number' || data.a < 0 || data.a > 1)
         {
            console.warn(`TinyMCE Eveywhere (mce-everywhere) warning: alpha (a) for property '${
             key}' is malformed or out of range. Resetting to initial data.`);

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