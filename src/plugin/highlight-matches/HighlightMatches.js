import { debounce }              from '#runtime/svelte/util';

import { constants, settings }   from '../../constants.js';

export class HighlightMatches
{
   static init(editor)
   {
      let active = game.settings.get(constants.moduleId, settings.highlightDocumentMatches);

      const debounced = debounce((event) =>
      {
         if (active) { this.#handleSelectionChange(event, editor); }
      }, 500);

      editor.on('SelectionChange', debounced);

      editor.ui.registry.addIcon('magicWand', '<svg width="20px" height="20px"><path d="M 13.789062 7.222656 L 17.058594 3.953125 L 15.867188 2.757812 L 12.59375 6.027344 Z M 18.777344 3.953125 C 18.777344 4.152344 18.710938 4.320312 18.578125 4.457031 L 4.226562 18.808594 C 4.089844 18.941406 3.921875 19.007812 3.722656 19.007812 C 3.523438 19.007812 3.351562 18.941406 3.21875 18.808594 L 1.007812 16.597656 C 0.875 16.464844 0.808594 16.296875 0.808594 16.097656 C 0.808594 15.894531 0.875 15.726562 1.007812 15.59375 L 15.363281 1.238281 C 15.496094 1.105469 15.664062 1.039062 15.867188 1.039062 C 16.066406 1.039062 16.234375 1.105469 16.367188 1.238281 L 18.578125 3.449219 C 18.710938 3.582031 18.777344 3.753906 18.777344 3.953125 Z M 3.699219 1.832031 L 4.792969 2.167969 L 3.699219 2.503906 L 3.367188 3.597656 L 3.03125 2.503906 L 1.9375 2.167969 L 3.03125 1.832031 L 3.367188 0.738281 Z M 7.605469 3.640625 L 9.792969 4.308594 L 7.605469 4.980469 L 6.9375 7.167969 L 6.265625 4.980469 L 4.078125 4.308594 L 6.265625 3.640625 L 6.9375 1.453125 Z M 17.984375 8.972656 L 19.078125 9.308594 L 17.984375 9.644531 L 17.648438 10.738281 L 17.316406 9.644531 L 16.222656 9.308594 L 17.316406 8.972656 L 17.648438 7.878906 Z M 10.84375 1.832031 L 11.9375 2.167969 L 10.84375 2.503906 L 10.507812 3.597656 L 10.171875 2.503906 L 9.078125 2.167969 L 10.171875 1.832031 L 10.507812 0.738281 Z M 10.84375 1.832031 "/></svg>');

      editor.ui.registry.addToggleButton('highlightDocumentMatches', {
         icon: 'magicWand',
         tooltip: game.i18n.localize(),
         onAction: (api) => api.setActive(active = !api.isActive()),
         onSetup: (api) => api.setActive(active)
      });
   }

   static #handleSelectionChange(event, editor)
   {
      const selection = event?.target?.getSelection?.();
      const selectedText = selection?.toString();

      if (selection && typeof selectedText === 'string' && selectedText.length >= 4)
      {
         const matches = globalThis.game.documentIndex.lookup(selectedText);

console.log(`!! HighlightMatchesControl - #handleSelectionChange - selectedText: ${selectedText}; matches: `, matches);

         const range = selection.getRangeAt(0);
         if (range)
         {
            const bounds = range.getBoundingClientRect();
// console.log(`!! HighlightMatchesControl - #handleSelectionChange - bounds: `, bounds);
         }
      }
   }
}