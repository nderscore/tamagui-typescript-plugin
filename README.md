## Tamagui Typescript Language Server Plugin

⚠️ This is a prototype. Beware! ⚠️

### Dev setup

1. Use `yalc` / `npm link` / etc to link this project folder to your tamagui project.

1. Use your tamagui project's workspace typescript:

   - Open VSCode `Command Palette` -> `Select Typescript Version...` -> `Use Workspace Version`

1. Add this to your tamagui project's `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...
    "plugins": [
      {
        "name": "tamagui-typescript-plugin",
        "configFilePath": "apps/next", // fill in relative or absolute path to a tamagui app here (parent folder of .tamagui)
        "defaultTheme": "light" // choose default theme for inline colors
      }
    ]
  }
}
```

### Dev instructions

1. Run `pnpm build`

1. Refresh your tamagui project vscode window / TS server

1. Trigger an autocomplete to appear

1. Check logs:

   - Open VSCode `Command Palette` -> `Open TS Server Logs...`

   - `ctrl/cmd + f` -> `TSTamagui::`

1. Made a change? Start over from 1 😅
