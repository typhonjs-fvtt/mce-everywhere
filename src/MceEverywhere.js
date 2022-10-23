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

         if (options.target.classList.contains('journal-page-content'))
         {
            MceEverywhere.#setupJournal(options, content);
         }
         else
         {
            MceEverywhere.#setupNormal(options, content);
         }

         // ------------------------------------------------------

         // Prepends the CSS variable editor content styles to any existing user defined styles to the `content_style`
         // MCE config parameter. This automatically makes sure the properties are the same between the `.editor-content`
         // and the body of the MCE IFrame.
         options.content_style = `${MceImpl.setMCEConfigContentStyle(options.target)} ${options.content_style}`;

         const newEditor = await oldFn.call(TextEditor, options, content);

         // // Set the initial selection; 'all', 'end', 'start'.
         // MCEImpl.setInitialSelection(editor, options.initialSelection, 'start')

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

         return newEditor;
      };
   }

   static #setupJournal(options, content)
   {
      const appEl = options.target.closest('[data-appid]');

      if (!appEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal app element.`);
         return;
      }

      const appId = appEl.dataset.appid;

      if (!appId)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal app ID.`);
         return;
      }

      const app = globalThis.ui.windows[appId];

      if (!app)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate journal app.`);
         return;
      }

      const appCloseEl = appEl.querySelector('header a.header-button.close');

      if (!appCloseEl)
      {
         console.warn(`TinyMCE Everywhere warning: Could not locate app header close button.`);
         return;
      }

      // Always have the MCE save button enabled.
      options.save_enablewhendirty = false;

      // -------------------------------------------------------------------------------------------------------------
      // Collect initial values from all header elements in order to reset them to initial values on cancel action.

      let initialTitleValue;

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

      // Store any existing setup function.
      const existingSetupFn = options.setup;

      /**
       * TinyMCE setup callback to further configure editor for key handling and app close control.
       *
       * Also loads the Foundry v10+ system fonts into MCE IFrame / copy and copies essential `editor-content`
       * parameters.
       *
       * @param {TinyMCE.Editor} editor -
       */
      options.setup = (editor) =>
      {
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

               app.close();
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

         const closeKeyFn = (event) =>
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

               const saveCallback = editor?.options?.get?.('save_onsavecallback');

               setTimeout(() =>
               {
                  if (typeof saveCallback === 'function') { saveCallback() }
                  app.close();
               }, 0);
            }
         }

         appEl.addEventListener('keydown', closeKeyFn);

         // Close the editor on 'esc' key pressed; reset content; invoke the registered Foundry save callback with
         // a deferral via setTimeout.
         editor.on('keydown', closeKeyFn);

         // Invoke any existing setup function in the config object provided.
         if (typeof existingSetupFn === 'function') { existingSetupFn(editor); }
      };
   }

   static #setupNormal(options, content)
   {
      // Store any existing setup function.
      const existingSetupFn = options.setup;

      options.setup = (editor) =>
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

         // Invoke any existing setup function in the config object provided.
         if (typeof existingSetupFn === 'function') { existingSetupFn(editor); }
      };
   }
}
