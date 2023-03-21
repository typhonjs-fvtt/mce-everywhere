import { getFormat }       from '@typhonjs-fvtt/runtime/color/colord';

import { propertyStore }   from '@typhonjs-fvtt/runtime/svelte/store';

import {
   isObject,
   StyleManager }          from '@typhonjs-fvtt/runtime/svelte/util';

import { TJSGameSettings } from '@typhonjs-fvtt/svelte-standard/store';

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

export class TJSThemeStore
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

   /**
    * @type {Object<String, import('svelte/store').Writable<string|null>>}
    */
   #stores = {}

   #opts;

   /**
    * @param {object} options - Options
    *
    * @param {string} options.namespace - The world setting scope.
    *
    * @param {string} options.key - The world setting key.
    *
    * @param {TJSGameSettings} options.gameSettings - An associated TJSGameSettings instance.
    *
    * @param {StyleManager} options.styleManager - An associated StyleManager instance to manipulate CSS variables.
    *
    */
   constructor(options)
   {
      if (!isObject(options)) { throw new TypeError(`'options' is not an object.`); }

      if (typeof options.namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      if (typeof options.key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      if (!(options.gameSettings instanceof TJSGameSettings))
      {
         throw new TypeError(`'gameSettings' is not an instance of TJSGameSettings.`);
      }

      if (!(options.styleManager instanceof StyleManager))
      {
         throw new TypeError(`'styleManager' is not an instance of StyleManager.`);
      }

      this.#opts = Object.assign({}, options);

      console.log(`!! TJSThemeStore - ctor - this.#opts: `, this.#opts);
   }

   /**
    * @returns {Object<String, import('svelte/store').Writable<string|null>>}
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

      this.#settingsStoreHandler = this.#opts.gameSettings.register({
         namespace: this.#opts.namespace,
         key: this.#opts.key,
         store: this,
         options: {
            scope: 'world',
            config: false,
            default: Object.assign({}, this.#defaultThemeData),
            type: Object
         }
      });

      this.#initialThemeData = game.settings.get(this.#opts.namespace, this.#opts.key);

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
    * @returns {TJSThemeStore}
    */
   set(theme)
   {
     if (!this.#validateThemeData(theme)) { theme = Object.assign({}, this.#initialThemeData); }

      for (const key of this.#keys)
      {
         const keyData = theme[key];

         this.#data[key] = keyData;
         this.#opts.styleManager.setProperty(key, keyData);
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