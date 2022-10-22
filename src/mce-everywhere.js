import { MCEImpl }         from './MCEImpl.js';
import { TinyMCEHelper }   from './TinyMCEHelper.js';
import { FontManager }     from './FontManager.js';

class MceEverywhere
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
         // const config = TinyMCEHelper.configStandard();
         const config = TinyMCEHelper.configExtra();

         const { fonts, fontFormats } = MCEImpl.getFontData();

         options = {
            ...config,
            ...options,
            style_formats: config.style_formats,
            plugins: config.plugins,
            toolbar: options.toolbar ? options.toolbar : config.toolbar,
            font_family_formats: fontFormats,
            paste_preprocess: (unused, args) => MCEImpl.pastePreprocess(newEditor, args),
            engine: 'tinymce',
         };

         // ------------------------------------------------------

         // Store any existing setup function.
         const existingSetupFn = options.setup;

         options.setup = (editor) =>
         {
            // Close the editor on 'esc' key pressed; reset content; invoke the registered Foundry save callback with
            // a deferral via setTimeout.
            editor.on('keydown', ((e) =>
            {
               if (e.keyCode === 27)
               {
                  editor.resetContent(content);

                  const saveCallback = editor?.options?.get?.('save_onsavecallback');
                  if (typeof saveCallback === 'function') { setTimeout(() => saveCallback(), 0); }
               }
            }));

            // // Set the initial selection; 'all', 'end', 'start'.
            // MCEImpl.setInitialSelection(editor, options.initialSelection, 'start')

            // Invoke any existing setup function in the config object provided.
            if (typeof existingSetupFn === 'function') { existingSetupFn(editor); }
         };

         // Prepends the CSS variable editor content styles to any existing user defined styles to the `content_style`
         // MCE config parameter. This automatically makes sure the properties are the same between the `.editor-content`
         // and the body of the MCE IFrame.
         options.content_style = `${MCEImpl.setMCEConfigContentStyle(options.target)} ${options.content_style}`;

         const newEditor = await oldFn.call(TextEditor, options, content);

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
}

Hooks.on('init', MceEverywhere.init);
