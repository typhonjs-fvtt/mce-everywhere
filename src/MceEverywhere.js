import { MceImpl }      from './MCEImpl.js';
import { MceConfig }    from './MceConfig.js';
import { FontManager }  from './FontManager.js';

export class MceEverywhere
{
   static init()
   {
      const oldEditorFn = HandlebarsHelpers.editor;

      const newEditorFn = (...args) =>
      {
         args[1].hash.engine = 'tinymce';
         return oldEditorFn.call(HandlebarsHelpers, ...args);
      };

      Handlebars.registerHelper({
         editor: newEditorFn
      });

      const oldFn = TextEditor.create;

      TextEditor.create = async (options, content) =>
      {
         // const config = MceConfig.configStandard();
         const config = MceConfig.configExtra();

         const { fonts, fontFormats } = MceImpl.getFontData();

         options = {
            ...config,
            ...options,
            style_formats: config.style_formats,
            plugins: config.plugins,
            toolbar: options.toolbar ? options.toolbar : config.toolbar,
            font_family_formats: fontFormats,
            paste_preprocess: (unused, args) => MceImpl.pastePreprocess(newEditor, args),
            engine: 'tinymce',
         };

         /** @type {HTMLDivElement} */
         const appEl = options.target.closest('[data-appid]');

         if (!appEl)
         {
            console.warn(`TinyMCE Everywhere warning: Could not locate editor app element.`);
            return;
         }

         const appId = appEl.dataset.appid;

         if (!appId)
         {
            console.warn(`TinyMCE Everywhere warning: Could not locate editor app ID.`);
            return;
         }

         const app = globalThis.ui.windows[appId];

         const isJournalPage = options.target.classList.contains('journal-page-content');

         if (isJournalPage)
         {
            // Always have the MCE save button enabled for journal page editor. This allows the button to be clicked
            // if other options in the page header are altered and not only the editor content.
            options.save_enablewhendirty = false;

            // Sanity case due to controlling the journal page editor app if it can't be found exit now.
            if (!app)
            {
               console.warn(`TinyMCE Everywhere warning: Could not locate journal app.`);
               return;
            }
         }

         // ------------------------------------------------------

         // Prepends the CSS variable editor content styles to any existing user defined styles to the `content_style`
         // MCE config parameter. This automatically makes sure the properties are the same between the `.editor-content`
         // and the body of the MCE IFrame.
         options.content_style = `${MceImpl.setMCEConfigContentStyle(options.target)} ${options.content_style}`;

         const editor = await oldFn.call(TextEditor, options, content);

         // // Set the initial selection; 'all', 'end', 'start'.
         // MCEImpl.setInitialSelection(editor, options.initialSelection, 'start')

         if (app)
         {
            // When clicking on the MCE IFrame bring the associated app to top.
            editor.on('click', () => app.bringToTop());
         }

         // For journal page editing replace the save callback with a new one that invokes the original, but also
         // closes the journal page editing app. This allows the app to be closed from the MCE save command.
         if (isJournalPage)
         {
            MceEverywhere.#setupJournal(options, editor, content, app, appEl);
         }
         else
         {
            MceEverywhere.#setupNormal(options, editor, content);
         }

         /**
          * Load core fonts into TinyMCE IFrame.
          *
          * @type {HTMLIFrameElement}
          */
         const editorIFrameEl = options.target.querySelector('.tox-edit-area__iframe');
         if (editorIFrameEl)
         {
            await FontManager.loadFonts({ document: editorIFrameEl.contentDocument, fonts });
         }

         return editor;
      };
   }

   static #setupJournal(options, editor, content, app, appEl)
   {
      // This a subtle modification that only comes into play when switching document sheets for the journal page
      // editor. This matches the close function of JournalTextTinyMCESheet, but JournalTextPageSheet which is
      // configured for the ProseMirror editor will call `destroy()` on the editor in the close function. This
      // will delete / lose the current content when switching sheets. This is prevented by overriding close.
      app.close = async (options = {}) =>
      {
         return JournalPageSheet.prototype.close.call(app, options);
      };

      /** @type {HTMLAnchorElement} */
      const appCloseEl = appEl.querySelector('header a.header-button.close');
      if (!appCloseEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate app header close button.`);
         return;
      }

      // -------------------------------------------------------------------------------------------------------------
      // Collect initial values from all header elements in order to reset them to initial values on cancel action.

      let initialTitleValue;

      /** @type {HTMLInputElement} */
      const headerTitleEl = appEl.querySelector('.journal-header input.title');
      if (!headerTitleEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal header title input element.`);
      }
      else
      {
         initialTitleValue = headerTitleEl.value;
      }

      let initialTitleLevel;

      /** @type {HTMLSelectElement} */
      const headerSelectEl = appEl.querySelector('.journal-header select[name="title.level"]');
      if (!headerSelectEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal header title select element.`);
      }
      else
      {
         initialTitleLevel = headerSelectEl.value;
      }

      let initialTitleDisplay;

      /** @type {HTMLInputElement} */
      const headerDisplayEl = appEl.querySelector('.journal-header input[name="title.show"]');
      if (!headerDisplayEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal header title display element.`);
      }
      else
      {
         initialTitleDisplay = headerDisplayEl.checked;
      }

      // -------------------------------------------------------------------------------------------------------------

      /**
       * In the case of the journal page editor on save close the associated app.
       *
       * @type {Function}
       */
      const originalSaveCallbackFn = editor?.options?.get?.('save_onsavecallback');
      if (typeof originalSaveCallbackFn === 'function')
      {
         const newSaveCallbackFn = () =>
         {
            // Abort saving if the header title is empty.
            if (!MceEverywhere.#validateJournalTitle(headerTitleEl)) { return; }

            setTimeout(() =>
            {
               originalSaveCallbackFn();
               app.close();
            }, 0);
         }

         editor?.options?.set?.('save_onsavecallback', newSaveCallbackFn);
      }

      /**
       * Resets all journal page data to initial values before closing app.
       *
       * @param {string} content - Original content.
       */
      const closeActionFn = (content) =>
      {
         const saveCallback = editor?.options?.get?.('save_onsavecallback');

         editor.resetContent(content);

         setTimeout(() =>
         {
            if (headerTitleEl && initialTitleValue) { headerTitleEl.value = initialTitleValue; }
            if (headerSelectEl && initialTitleLevel) { headerSelectEl.value = initialTitleLevel; }
            if (headerDisplayEl && initialTitleDisplay) { headerDisplayEl.value = initialTitleDisplay; }

            if (typeof saveCallback === 'function') { saveCallback() }
         }, 0);
      }

      // Override app header close button by adding handler for 'pointerdown' which acts before the 'click'
      // event of Foundry core. Invoke the close action function reversing any changes.
      appCloseEl.addEventListener('pointerdown', (event) =>
      {
         // Stop default close handler from triggering.
         event.preventDefault();
         event.stopPropagation();

         closeActionFn(content);
      })

      // Add a keydown handler to the main app element to catch `Escape` and `Ctrl-s` to respectively close or
      // save & close the journal page editor app. This allows the same behavior to control the entire journal page
      // editor experience.
      appEl.addEventListener('keydown', (event) =>
      {
         if (event.key === 'Escape')
         {
            closeActionFn(content);
         }
         else if (event.key === 's' && (event.ctrlKey || event.metaKey))
         {
            // Stop browser save dialog from appearing.
            event.preventDefault();
            event.stopPropagation();

            // Abort saving if the header title is empty.
            if (!MceEverywhere.#validateJournalTitle(headerTitleEl)) { return; }

            const saveCallback = editor?.options?.get?.('save_onsavecallback');

            setTimeout(() =>
            {
               if (typeof saveCallback === 'function') { saveCallback() }
            }, 0);
         }
      });

      // Close the editor on 'esc' key pressed; reset content; invoke the registered Foundry save callback with
      // a deferral via setTimeout.
      editor.on('keydown', (event) =>
      {
         if (event.key === 'Escape') { closeActionFn(content); }
      });

      // Invoke any existing setup function in the config object provided.
      if (typeof existingSetupFn === 'function') { existingSetupFn(editor); }
   }

   static #setupNormal(options, editor, content)
   {
      // Close the editor on 'esc' key pressed; reset content; invoke the registered Foundry save callback with
      // a deferral via setTimeout.
      editor.on('keydown', ((event) =>
      {
         if (event.key === 'Escape')
         {
            editor.resetContent(content);

            const saveCallback = editor?.options?.get?.('save_onsavecallback');
            if (typeof saveCallback === 'function') { setTimeout(() => saveCallback(), 0); }
         }
      }));
   }

   /**
    * Validates that the journal page title is not empty and posts a warning message if so.
    *
    * @param {HTMLInputElement} headerTitleEl -
    *
    * @returns {boolean} Whether the journal page title is valid.
    */
   static #validateJournalTitle(headerTitleEl)
   {
      const isValid = headerTitleEl.value.length >= 1;

      if (!isValid)
      {
         globalThis.ui.notifications.warn('mce-everywhere.journal.validation', { localize: true });
      }

      return isValid;
   }
}
