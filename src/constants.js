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
 * @type {MCESessionConstants} Defines all the module session storage static constants.
 */
const sessionConstants = {
   appState: `${constants.moduleId}.settings.appState`
};

/**
 * @type {MCESettings} Defines all the module settings for world and client.
 */
const settings = {
   button: 'button',
   clientenabled: 'clientenabled',
   cursor: 'cursor',
   help: 'help',
   journalenabled: 'journalenabled',
   location: 'location',
   themeToolbarBackground: 'themeToolbarBackground',
   themeToolbarFontColor: 'themeToolbarFontColor',
   themeToolbarDisabledFontColor: 'themeToolbarDisabledFontColor',
   toolbar: 'toolbar'
};

export { constants, sessionConstants, settings };

/**
 * @typedef {object} MCESessionConstants
 *
 * @property {string} appState - Stores the settings app state.
 */

/**
 * @typedef {object} MCESettings
 *
 * @property {string} button - Defines the settings button for GMs.
 *
 * @property {string} clientenabled - Is MCE Everywhere enabled on the particular client?
 *
 * @property {string} cursor - Sets the cursor position when editor is initialized.
 *
 * @property {string} help - Adds a help button to the editor toolbar.
 *
 * @property {string} location - Defines where MCE Everywhere replaces the editor; all, only journals, not journals.
 *
 * @property {string} themeToolbarBackground - Defines the toolbar background color.
 *
 * @property {string} themeToolbarFontColor - Defines the toolbar font color.
 *
 * @property {string} themeToolbarDisabledFontColor - Defines the toolbar disabled font color.
 *
 * @property {string} toolbar - Defines the editor toolbar type: basic, dynamic, extended, default.
 */
