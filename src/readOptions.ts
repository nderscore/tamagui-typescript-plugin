import * as path from 'path';

import { TSContextBase } from './types';

const normalizeFilter = (token: string) =>
  token.startsWith('$') ? token : `$${token}`;

export const createCustomTokenFilter = ({
  themeColor,
  color,
  size,
  space,
  radius,
  zIndex,
}: {
  themeColor?: string[];
  color?: string[];
  size?: string[];
  space?: string[];
  radius?: string[];
  zIndex?: string[];
}) => {
  if (!themeColor && !color && !size && !space && !radius && !zIndex)
    return undefined;

  const customFilters = {
    themeColor: themeColor && new Set(themeColor?.map(normalizeFilter)),
    color: color && new Set(color?.map(normalizeFilter)),
    size: size && new Set(size?.map(normalizeFilter)),
    space: space && new Set(space?.map(normalizeFilter)),
    radius: radius && new Set(radius?.map(normalizeFilter)),
    zIndex: zIndex && new Set(zIndex?.map(normalizeFilter)),
  } as const;

  const customFilter = (scale: keyof typeof customFilters, token: string) => {
    return customFilters?.[scale]?.has(token);
  };

  customFilter.toString = () =>
    Object.entries(customFilters)
      .filter(([, val]) => !!val)
      .map(([key, val]) => `${key}<${[...val!].join(', ')}>`)
      .join('; ');

  return customFilter;
};

/**
 * Read options passed in from the tsconfig.json file
 */
export const readOptions = ({ info, modules }: TSContextBase) => {
  const {
    pathToApp = 'apps/next',
    defaultTheme = 'light',
    colorTileSize = 18,
    completionFilters: {
      showColorTokens = true,
      showTrueTokens = true,
      showShorthandConversion = true,
      custom: {
        themeColor: themeColorFilters = undefined,
        color: colorFilters = undefined,
        size: sizeFilters = undefined,
        space: spaceFilters = undefined,
        radius: radiusFilters = undefined,
        zIndex: zIndexFilters = undefined,
      } = {},
    } = {},
  } = info.config as {
    pathToApp?: string;
    defaultTheme?: string;
    colorTileSize?: number;
    completionFilters?: {
      showColorTokens?: boolean;
      showTrueTokens?: boolean;
      showShorthandConversion?: boolean;
      custom?: {
        themeColor?: string[];
        color?: string[];
        size?: string[];
        space?: string[];
        radius?: string[];
        zIndex?: string[];
      };
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
      showShorthandConversion,
      custom: createCustomTokenFilter({
        themeColor: themeColorFilters,
        color: colorFilters,
        size: sizeFilters,
        space: spaceFilters,
        radius: radiusFilters,
        zIndex: zIndexFilters,
      }),
    },
  } as const;
};

export type PluginOptions = ReturnType<typeof readOptions>;
