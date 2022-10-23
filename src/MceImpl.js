import { FontManager }  from './FontManager.js';

export class MceImpl
{
   /**
    * Stores the CSS properties that are inspected on the `.editor-content` div before the editor is active and
    * copies these values if set or the default values to the body element of the TinyMCE IFrame.
    *
    * @type {object[]}
    */
   static #s_CSS_PROPS_EDITOR = [
      { property: 'color', default: '#000' },
      { property: 'font-family', default: 'Signika' },
      { property: 'font-size', default: '10.5pt' },
      { property: 'line-height', default: 'normal' },
      { property: 'padding', default: '3px 0 0 0' }
   ];

   /**
    * Defines a regex to check for the shape of a raw Foundry document UUID.
    *
    * @type {RegExp}
    */
   static #s_UUID_REGEX = /(\.).*([a-zA-Z0-9]{16})/;

   /**
    * Provides a mechanism to load core Foundry fonts and any additional font family definitions. The returned data
    * includes the parsed font family definitions and the configuration data TinyMCE needs for loading the font formats.
    *
    * @returns {{ fonts: Object<FontFamilyDefinition>[], fontFormats: string}} Font formats for MCE & all fonts to load.
    */
   static getFontData()
   {
      /**
       * @type {Object<FontFamilyDefinition>[]}
       */
      const fonts = FontManager.getCoreDefinitions();

      // Process font family definitions to create the font format string for TinyMCE. Remove duplicates.

      /** @type {Set<string>} */
      const fontFormatSet = new Set();

      for (const definitions of fonts)
      {
         if (typeof definitions === 'object')
         {
            for (const family of Object.keys(definitions))
            {
               fontFormatSet.add(`${family}=${family};`);
            }
         }
      }

      return { fonts, fontFormats: [...fontFormatSet].sort().join('') };
   }

   /**
    * Handles paste preprocessing.
    *
    * The pasted text is examined for the shape of a raw UUID and if detected attempts to retrieve the document and if
    * found will generate a proper document link from it. You can get the raw UUID by context-clicking the icon in the
    * app header bar for various documents.
    *
    * @param {TinyMCE.Editor} editor -
    *
    * @param {object}         args -
    */
   static pastePreprocess(editor, args)
   {
      // Prevent paste if content is not a string.
      if (typeof args.content !== 'string')
      {
         args.stopImmediatePropagation();
         args.stopPropagation();
         args.preventDefault();
      }

      let text = args.content;

      // Check if pasted test matches the shape of a UUID. If so do a lookup and if a document is retrieved build
      // a UUID.
      if (this.#s_UUID_REGEX.test(text))
      {
         const uuidDoc = globalThis.fromUuidSync(text);
         if (uuidDoc)
         {
            text = `@UUID[${text}]{${uuidDoc.name}}`;
         }
      }

      args.content = text;
   }

   /**
    * Sets the initial selection based on `options.initialSelection`.
    *
    * @param {TinyMCE.Editor} editor - MCE editor.
    *
    * @param {string}   initialSelection - Initial selection option.
    *
    * @param {string}   defaultValue - Default value if initialSelection is invalid.
    */
   static setInitialSelection(editor, initialSelection, defaultValue)
   {
      const type = initialSelection === 'all' || initialSelection === 'end' || initialSelection === 'start' ?
       initialSelection : defaultValue;

      const selection = editor.selection;

      /** @type {HTMLBodyElement} */
      const bodyEl = editor.getBody();

      // Sanity check.
      if (!bodyEl) { return; }

      switch (type)
      {
         case 'all':
            selection.select(bodyEl, true);
            break;

         case 'end':
            selection.select(bodyEl, true);
            selection.collapse(false);
            break;

         case 'start':
            selection.select(bodyEl, true);
            selection.collapse(true);
            break;
      }

      editor.focus();
   }

   /**
    * Copies over the CSS variable data that is inspected on the `.editor-content` div before the editor is active if
    * set or the default values to the body element of the TinyMCE IFrame.
    *
    * @param {HTMLDivElement} editorContentEl -
    *
    * @returns {string} TinyMCE config `content_style` parameter for .
    */
   static setMCEConfigContentStyle(editorContentEl)
   {
      const cssBodyInlineStyles = {};

      // Get current CSS variables for editor content and set it to inline styles for the MCE editor iFrame.
      const styles = globalThis.getComputedStyle(editorContentEl);

      for (const entry of this.#s_CSS_PROPS_EDITOR)
      {
         const currentPropertyValue = styles.getPropertyValue(entry.property);
         cssBodyInlineStyles[entry.property] = currentPropertyValue !== '' ? currentPropertyValue : entry.default;
      }

      return `body { ${Object.entries(cssBodyInlineStyles).map((array) => `${array[0]}: ${array[1]};`).join(';')} }`;
   }
}
