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
    completionFilters: { showColorTokens = true, showTrueTokens = true } = {},
  } = info.config as {
    pathToApp?: string;
    defaultTheme?: string;
    colorTileSize?: number;
    completionFilters?: {
      showColorTokens?: boolean;
      showTrueTokens?: boolean;
    };
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
    completionFilters: {
      showColorTokens,
      showTrueTokens,
    },
  } as const;
};

export type PluginOptions = ReturnType<typeof readOptions>;
