/**
 * NOTE: This code is modified from the Foundry client code.
 *
 * It provides an override for resizable apps changing to pointer events to be able to use `setPointerCapture` as this
 * will detect when the mouse is over an open MCE editor IFrame and stop the resize action if the mouse is let go at
 * this point. The core Draggable class uses mouse events and thus does not stop the resize action when the mouse is
 * let go over the MCE IFrame causing the resize handle to get stuck active.
 *
 * By using pointer events and stopping propagation MceDraggable acts before the core Foundry Draggable / resize
 * handler.
 *
 * @param {Application} app - The Application that is being made draggable.
 *
 * @param {HTMLElement} element - A reference to the Application's outermost element.
 *
 * @param {HTMLElement} handle - The element that acts as a drag handle.
 */
export class MceDraggable
{
   /** @type {object} */
   #initial;

   constructor(app, element, handle)
   {
      this.app = app;
      this.element = element;
      this.handle = handle;

      /**
       * Duplicates the application starting position to track differences.
       *
       * @type {object}
       */
      this.position = null;

      /**
       * Remember event handlers associated with this Draggable class so that they may be later unregistered.
       *
       * @type {object}
       */
      this.handlers = {};

      // Activate interactivity
      this.#activateListeners();
   }

   /**
    * Activate event handling for a Draggable application
    * Attach handlers for resizing
    */
   #activateListeners()
   {
      // Register handlers
      this.handlers["resizeDown"] = ["pointerdown", (e) => this.#onResizePointerDown(e), false];
      this.handlers["resizeMove"] = ["pointermove", (e) => this.#onResizePointerMove(e), false];
      this.handlers["resizeUp"] = ["pointerup", (e) => this.#onResizeMouseUp(e), false];

      // Attach the pointer down handler
      this.handle.addEventListener(...this.handlers.resizeDown);
   }

   /**
    * Handle the initial mouse click which activates dragging behavior for the application
    *
    * @param {PointerEvent} event -
    *
    * @private
    */
   #onResizePointerDown(event)
   {
      event.preventDefault();
      event.stopPropagation();

      // Record initial position
      this.position = foundry.utils.deepClone(this.app.position);

      if (this.position.height === "auto") { this.position.height = this.element.clientHeight; }
      if (this.position.width === "auto") { this.position.width = this.element.clientWidth; }

      this.#initial = { x: event.clientX, y: event.clientY };

      // Add temporary handlers
      window.addEventListener(...this.handlers.resizeMove);
      window.addEventListener(...this.handlers.resizeUp);

      this.handle.setPointerCapture(event.pointerId);
   }

   /**
    * Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport
    *
    * @param {PointerEvent} event -
    *
    * @private
    */
   #onResizePointerMove(event)
   {
      event.preventDefault();
      event.stopPropagation();

      const scale = this.app.position.scale ?? 1;

      const deltaX = (event.clientX - this.#initial.x) / scale;
      const deltaY = (event.clientY - this.#initial.y) / scale;

      const newPosition = {
         width: this.position.width + deltaX,
         height: this.position.height + deltaY
      };

      this.app?.setPosition(newPosition);
   }

   /* ----------------------------------------- */

   /**
    * Conclude the dragging behavior when the mouse is released setting the final position and removing listeners.
    *
    * @param {PointerEvent} event -
    *
    * @private
    */
   #onResizeMouseUp(event)
   {
      event.preventDefault();
      event.stopPropagation();

      window.removeEventListener(...this.handlers.resizeMove);
      window.removeEventListener(...this.handlers.resizeUp);

      this.app?._onResize(event);
   }
}