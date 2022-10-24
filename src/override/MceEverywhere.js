import { FontManager }           from '../model/FontManager.js';
import { MceConfig }             from './MceConfig.js';
import { MceDraggable }          from './MceDraggable.js';
import { MceImpl }               from './MceImpl.js';

import { constants, settings }   from '../constants.js';

export class MceEverywhere
{
   static init()
   {
      // Replace the original handlebars helper for editor helper to control engine parameter.
      const origHandlebarsEditorFn = HandlebarsHelpers.editor;

      const newEditorFn = (...args) =>
      {
         const journalEnabled = game.settings.get(constants.moduleId, settings.journalenabled);

         // If the MCE Everywhere is disabled for journals respect the existing engine parameter.
         if (!journalEnabled && args?.[1]?.hash?.class === 'journal-page-content')
         {
            return origHandlebarsEditorFn.call(HandlebarsHelpers, ...args);
         }

         // By default, always replace editor engine;
         if (typeof args?.[1]?.hash === 'object')
         {
            // Don't enable mceeverywhere styles by exiting early if mceeverywhere is false.
            const mceeverywhere = typeof args[1].hash.mceeverywhere === 'boolean' ? args[1].hash.mceeverywhere : true;
            if ((args[1].hash.engine === 'tinymce' || args[1].hash.engine === void 0) && !mceeverywhere)
            {
               return origHandlebarsEditorFn.call(HandlebarsHelpers, ...args);
            }

            args[1].hash.engine = 'tinymce';
         }

         const result = origHandlebarsEditorFn.call(HandlebarsHelpers, ...args);

         // Add `mce-everywhere class` so that the module styles targets an explicit class.
         result.string = result.string.replace('<div class="editor">', '<div class="editor mce-everywhere">');

         return result;
      };

      // Register the new helper.
      Handlebars.registerHelper({ editor: newEditorFn });

      // Store the original `TextEditor.create` function.
      const origTextEditorCreateFn = TextEditor.create;

      // Hard override `TextEditor.create` to fully control the editor creation.
      TextEditor.create = async (options, content) =>
      {
         const journalEnabled = game.settings.get(constants.moduleId, settings.journalenabled);

         // If MCE Everywhere is disabled for journal page editing then simply call the original function
         if (!journalEnabled && options.target.classList.contains('journal-page-content') &&
          options.engine === 'prosemirror')
         {
            return origTextEditorCreateFn.call(TextEditor, options, content);
         }

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

         const config = MceConfig.configExtra({ help: game.settings.get(constants.moduleId, settings.help) });

         const { fonts, fontFormats } = MceImpl.getFontData();

         options = {
            ...config,
            ...options,
            style_formats: config.style_formats,
            font_family_formats: options.font_family_formats ? options.font_family_formats : fontFormats,
            paste_preprocess: (unused, args) => MceImpl.pastePreprocess(editor, args),
            engine: 'tinymce',
         };

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

         const editor = await origTextEditorCreateFn.call(TextEditor, options, content);

         // Set the initial cursor location; 'start', 'end'.
         MceImpl.setCursorLocation(editor);

         if (app)
         {
            // When clicking on the MCE IFrame bring the associated app to top.
            editor.on('click', () => app.bringToTop());

            // If the app is resizable add a Draggable override to the resize handle that uses pointer events instead
            // of the core solution that uses mouse events which acts first before the core resize handler. This allows
            // the pointer to be released over the open MCE IFrame and properly stop the resize action. This Draggable
            // override is only added once as the outer app frame is not rendered again. A check for a data attribute
            // is done to prevent adding multiple handlers.
            if (app?.options?.resizable && appEl instanceof HTMLElement)
            {
               const resizeHandle = appEl.querySelector('.window-resizable-handle');
               if (resizeHandle && resizeHandle.dataset['mcedraggable'] !== 'true')
               {
                  resizeHandle.dataset['mcedraggable'] = 'true';
                  new MceDraggable(app, appEl, appEl.querySelector('.window-resizable-handle'));
               }
            }
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
      app.close = async (optionsArg = {}) =>
      {
         return JournalPageSheet.prototype.close.call(app, optionsArg);  // eslint-disable-line no-undef
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
         };

         editor?.options?.set?.('save_onsavecallback', newSaveCallbackFn);
      }

      /**
       * Resets all journal page data to initial values before closing app.
       *
       * @param {string} contentArg - Original content.
       */
      const closeActionFn = (contentArg) =>
      {
         const saveCallback = editor?.options?.get?.('save_onsavecallback');

         editor.resetContent(contentArg);

         setTimeout(() =>
         {
            if (headerTitleEl && initialTitleValue) { headerTitleEl.value = initialTitleValue; }
            if (headerSelectEl && initialTitleLevel) { headerSelectEl.value = initialTitleLevel; }
            if (headerDisplayEl && initialTitleDisplay) { headerDisplayEl.value = initialTitleDisplay; }

            if (typeof saveCallback === 'function') { saveCallback(); }
         }, 0);
      };

      // Override app header close button by adding handler for 'pointerdown' which acts before the 'click'
      // event of Foundry core. Invoke the close action function reversing any changes.
      appCloseEl.addEventListener('pointerdown', (event) =>
      {
         // Stop default close handler from triggering.
         event.preventDefault();
         event.stopPropagation();

         closeActionFn(content);
      });

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
               if (typeof saveCallback === 'function') { saveCallback(); }
            }, 0);
         }
      });

      // Close the editor on 'esc' key pressed; reset content; invoke the registered Foundry save callback with
      // a deferral via setTimeout.
      editor.on('keydown', (event) =>
      {
         if (event.key === 'Escape') { closeActionFn(content); }
      });
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
