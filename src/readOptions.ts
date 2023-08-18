import * as path from 'path';

import { TSContext } from './types';

/**
 * Read options passed in from the tsconfig.json file
 */
export const readOptions = ({ info, modules }: TSContext) => {
  const {
    pathToApp = 'apps/next',
    defaultTheme = 'light',
    colorTileSize = 18,
  } = info.config as {
    pathToApp?: string;
    defaultTheme?: string;
    colorTileSize?: number;
  };

  const rootDir = path.join(
    modules.typescript.sys.getExecutingFilePath(),
    '../../../../'
  );

  const tamaguiConfigFilePath = path.join(
    path.isAbsolute(pathToApp) ? pathToApp : path.join(rootDir, pathToApp),
    './.tamagui/tamagui.config.json'
  );

  return {
    tamaguiConfigFilePath,
    defaultTheme,
    colorTileSize,
  } as const;
};

export type PluginOptions = ReturnType<typeof readOptions>;
