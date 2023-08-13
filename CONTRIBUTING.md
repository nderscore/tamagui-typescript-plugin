# Contributing

## Set up local dev environment

1. Use `yalc` / `npm link` / etc to link this project folder to your tamagui project.

1. Add plugin config to `tsconfig.json` (see [README](./README.md))

## Development workflow

1. Run `pnpm build` in plugin workspace

1. Refresh your tamagui project vscode window / TS server

1. Trigger an autocomplete to appear

1. Check logs:

   - Open VSCode `Command Palette` -> `Open TS Server Logs...`

   - `ctrl/cmd + f` -> `TSTamagui::`

1. Start over from build step after making changes to the plugin code.
