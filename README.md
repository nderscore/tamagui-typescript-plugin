# @nderscore/tamagui-typescript-plugin

Typescript Language Server Plugin for [Tamagui](https://tamagui.dev).

## Features

- Show Tamagui theme/token values in TypeScript autocomplete suggestions

- Graphical previews for color and theme tokens

- Automatically reloads when your config is updated by the Tamagui compiler

### Screenshots

![Theme Token Screenshot](./docs/screenshot_autocomplete_theme.png)

![Color Token Screenshot](./docs/screenshot_autocomplete_color.png)

![Space Token Screenshot](./docs/screenshot_autocomplete_space.png)

## Setup

1. Install `@nderscore/tamagui-typescript-plugin` package in your project:

   ```sh
   yarn add @nderscore/tamagui-typescript-plugin
   # or
   pnpm add @nderscore/tamagui-typescript-plugin
   # or
   npm add @nderscore/tamagui-typescript-plugin
   ```

1. Add plugin to your `tsconfig.json` with settings:

   ```json
   {
     "compilerOptions": {
       // ...
       "plugins": [
         {
           "name": "@nderscore/tamagui-typescript-plugin",

           // fill in relative or absolute path to a tamagui app here (parent folder of .tamagui)
           "pathToApp": "apps/next",

           // choose default theme for inline values of theme tokens
           "defaultTheme": "light"
         }
       ]
     }
   }
   ```

1. Make sure your VSCode is configured to use typescript from your workspace:

   - Open VSCode `Command Palette` -> `Select Typescript Version...` -> `Use Workspace Version`

### Usage in Expo-only (no-Next.js) Tamagui projects

Currently, the `@tamagui/babel-plugin` does not generate a `.tamagui` directory with your configuration cached inside.

As a temporary workaround, you can generate it manually:

#### Expo workaround

1. Add `@tamagui/static` to your project:

   ```
   yarn add @tamagui/static
   ```

1. Create a script `generate-tamagui-json.js` and fill in with your settings if needed:

   ```js name='generate-tamagui-json.js'
   // generate-tamagui-json.js
   const { loadTamagui } = require('@tamagui/static');

   loadTamagui({
     config: 'tamagui.config.ts',
     components: ['tamagui'],
   });
   ```

1. Execute `node generate-tamagui-json.js` to generate a `.tamagui` directory in your Expo project folder.

   This script will need to be ran manually after changing your theme/tokens.

## Contributing

If you would like to contribute to this project, please see the [contributing guide](./CONTRIBUTING.md).
