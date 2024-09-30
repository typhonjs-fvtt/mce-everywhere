<script>
   import { onDestroy } from 'svelte';

   import { localize }  from '#runtime/util/i18n';

   let imageEl;

   Hooks.on('hotbarDrop', hotbarDrop);

   onDestroy(() => Hooks.off('hotbarDrop', hotbarDrop));

   function hotbarDrop(hotbar, data, slot) {
      let handled = false;

      if (data?.type === 'MceEverywhereMacro') {
         handled = true;

         // Wrap the handling code in an async IIFE.
         (async () => {

            // The macro script data to open the quest via the public QuestAPI.
            const command = `Hooks.call('mce-everywhere:open:settings');`;

            const macroData = {
               name: localize('mce-everywhere.macro.name'),
               type: 'script',
               command,
               img: 'modules/mce-everywhere/assets/icons/mce-icon.png'
            };

            // Search for an already existing macro with the same command.
            let macro = game.macros.contents.find((m) => m.command === command);

            // If not found then create a new macro with the command.
            if (!macro) {
               macro = await Macro.create(macroData, { displaySheet: false });
            }

            // Assign the macro to the hotbar.
            await game.user.assignHotbarMacro(macro, slot);
         })();
      }

      return handled;
   }

   function onDragStart(event) {
      const dataTransfer = { type: 'MceEverywhereMacro' };
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.setDragImage(imageEl, 18, 18);
      event.dataTransfer.setData('text/plain', JSON.stringify(dataTransfer));
   }
</script>

<div on:dragstart={onDragStart}
     draggable=true
     title={localize('mce-everywhere.macro.button.title')}
     role=document>
   <img bind:this={imageEl}
        on:dragstart={onDragStart}
        draggable=true
        src="modules/mce-everywhere/assets/icons/mce-icon.png" alt="Macro">
   {localize('mce-everywhere.macro.button.label')}
</div>

<style>
   div {
      display: flex;
      background: rgba(255, 255, 255, 0.1);
      border-top: 1px solid rgb(100, 100, 100);
      height: 40px;
      justify-content: center;
      align-items: center;

      transition: background .5s;
      cursor: grab;
      font-weight: bold;
   }

   div:hover {
      text-shadow: 0 0 3px rgba(255, 0, 0, 0.4);
      background: rgba(255, 255, 255, 0.15);
   }

   img {
      height: 36px;
      width: 36px;
      margin-right: 0.5em;
      border: none;
   }
</style>
