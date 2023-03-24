export const themeStoreConfig = {
   version: '0.0.1',
   url: 'modules/mce-everywhere/assets/themedata.json',

   components: [
      {
         label: 'mce-everywhere.settings.theme.toolbar-background',
         var: '--mce-everywhere-toolbar-background',
         type: 'color',
         default: 'hsla(0, 0%, 0%, 0.1)'
      },
      {
         label: 'mce-everywhere.settings.theme.toolbar-button-hover-background-color',
         var: '--mce-everywhere-toolbar-button-background-hover',
         type: 'color',
         default: 'hsl(60, 35%, 91%)'
      },
      {
         label: 'mce-everywhere.settings.theme.toolbar-font-color',
         var: '--mce-everywhere-toolbar-font-color',
         type: 'color',
         default: 'hsl(50, 14%, 9%)'
      },
      {
         label: 'mce-everywhere.settings.theme.toolbar-disabled-font-color',
         var: '--mce-everywhere-toolbar-disabled-font-color',
         type: 'color',
         default: 'hsla(212, 29%, 19%, 0.5)'
      }
   ]
};