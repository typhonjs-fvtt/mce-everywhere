/**
 * Defines the main constants for module name and label.
 *
 * @type {{moduleId: string, moduleLabel: string}}
 */
const constants = {
   moduleId: 'mce-everywhere',
   moduleLabel: 'TinyMCE Everywhere!'
};

/**
 * @type {MCESettings} Defines all the module settings for world and client.
 */
const settings = {
   clientenabled: 'clientenabled',
   cursor: 'cursor',
   help: 'help',
   journalenabled: 'journalenabled',
};

export { constants, settings };

/**
 * @typedef {object} MCESettings
 *
 * @property {string} clientenabled - Is MCE Everywhere enabled on the particular client?
 *
 * @property {string} cursor - Sets the cursor position when editor is initialized.
 *
 * @property {string} help - Adds a help button to the editor toolbar.
 *
 * @property {string} journalenabled - Enables MCE Everywhere for journal page editing.
 */
