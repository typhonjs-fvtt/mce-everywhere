import { ConfigSettingApp }   from './ConfigSettingApp.js';

export class ConfigSettingButton extends FormApplication
{
   static #mceSettingsApp;

   static showSettings()
   {
      this.#mceSettingsApp = this.#mceSettingsApp ? this.#mceSettingsApp : new ConfigSettingApp();
      this.#mceSettingsApp.render(true, { focus: true });

      return this.#mceSettingsApp;
   }

   /**
    * @inheritDoc
    */
   constructor(options = {})
   {
      super({}, options);
      ConfigSettingButton.showSettings();
   }

   async _updateObject(event, formData) {}
   render() { this.close(); }
}
