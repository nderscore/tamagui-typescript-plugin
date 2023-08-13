import * as path from 'path';

import { TSContext } from './types';

export const readOptions = ({ info, modules }: TSContext) => {
  const { configFilePath = 'apps/next', defaultTheme = 'light' } =
    info.config as {
      configFilePath?: string;
      defaultTheme?: string;
    };

  const rootDir = path.join(
    modules.typescript.sys.getExecutingFilePath(),
    '../../../../'
  );

  const tamaguiConfigFilePath = path.join(
    path.isAbsolute(configFilePath)
      ? configFilePath
      : path.join(rootDir, configFilePath),
    './.tamagui/tamagui.config.json'
  );

  return {
    tamaguiConfigFilePath,
    defaultTheme,
  } as const;
};
