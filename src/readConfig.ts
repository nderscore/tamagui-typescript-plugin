import type { TamaguiInternalConfig } from '@tamagui/core';

import { TSContext } from './types';

type Themes = TamaguiInternalConfig['themes'];

type ThemeKey = keyof TamaguiInternalConfig['themes'] & string;

type Theme = Themes[ThemeKey];

/**
 * Simple utility to transform a token map into a simple key-value map
 */
const simplifyTokenMap = (
  tokens: TamaguiInternalConfig['tokens'][keyof TamaguiInternalConfig['tokens']],
  transformNumbersToPx = true
) => {
  return Object.fromEntries(
    Object.values(tokens).map((variable) => {
      return [
        variable.key as string,
        transformNumbersToPx && typeof variable.val === 'number'
          ? `${variable.val}px`
          : `${variable.val}`,
      ];
    })
  ) as Record<string, string>;
};

// Ignore pattern for component themes
const componentThemePattern = /_[A-Z]/;

/**
 * Get count of underscores in a string
 */
const underscoreDepth = (str: string) => str.split('_').length - 1;

/**
 * Sort themes by depth of underscores, then by presence of defaultTheme,
 * then alphabetically
 */
const sortThemes = (defaultTheme: string) => {
  const defaultThemePrefix = `${defaultTheme}_`;
  return ([keyA]: [ThemeKey, Theme], [keyB]: [ThemeKey, Theme]) => {
    const depthA = underscoreDepth(keyA);
    const depthB = underscoreDepth(keyB);
    if (depthA === depthB) {
      const isADefault = keyA === defaultTheme;
      const isADefaultSubtheme = keyA.startsWith(defaultThemePrefix);
      const isBDefault = keyB === defaultTheme;
      const isBDefaultSubtheme = keyB.startsWith(defaultThemePrefix);
      if (isADefault) return -1;
      if (isBDefault) return 1;
      if (isADefaultSubtheme && !isBDefaultSubtheme) return -1;
      if (isBDefaultSubtheme && !isADefaultSubtheme) return 1;
      return keyA.localeCompare(keyB);
    }
    return depthA - depthB;
  };
};

/**
 * Utility to transform a record of themes into a record of theme tokens
 * with the theme names as keys and the token values as values
 */
const getThemeColors = (
  themes: TamaguiInternalConfig['themes'],
  defaultTheme: string
) => {
  const themeTokens: Record<string, Record<string, string>> = {};

  const sortedThemes = Object.entries(themes);
  sortedThemes.sort(sortThemes(defaultTheme));

  for (const [themeName, theme] of sortedThemes) {
    if (componentThemePattern.test(themeName)) continue;

    for (const [key, variable] of Object.entries(theme)) {
      if (key === 'id') continue;
      const $key = `$${key}`;
      themeTokens[$key] ??= {};
      themeTokens[$key]![themeName] =
        variable.val ?? (variable as unknown as string);
    }
  }

  return themeTokens;
};

/**
 * Read and process the tamagui config file into a simpler format
 */
export const readConfig = (
  tamaguiConfigFilePath: string,
  defaultTheme: string,
  { modules, logger }: TSContext
) => {
  const tamaguiConfigFile = modules.typescript.sys.readFile(
    tamaguiConfigFilePath
  );

  if (!tamaguiConfigFile) {
    logger.error(`No tamagui config file found.`);
    return undefined;
  }

  try {
    const jsonConfig = JSON.parse(tamaguiConfigFile)
      .tamaguiConfig as TamaguiInternalConfig;
    const {
      // TODO:
      // fontSizeTokens,
      shorthands,
      tokens,
      themes,
    } = jsonConfig;

    const color = simplifyTokenMap(tokens.color);
    const space = simplifyTokenMap(tokens.space);
    const size = simplifyTokenMap(tokens.size);
    const radius = simplifyTokenMap(tokens.radius);
    const zIndex = simplifyTokenMap(tokens.zIndex, false);
    const themeColors = getThemeColors(themes, defaultTheme);

    const config = {
      color,
      space,
      size,
      radius,
      shorthands,
      themeColors,
      zIndex,
    } as const;

    logger('Tamagui config parsed!');
    logger(config);

    return config;
  } catch (e) {
    logger.error(
      `Failed to parse tamagui config: ${
        e instanceof Error ? e.message : '(unknown)'
      }`
    );
    return undefined;
  }
};

export type ParsedConfig = Exclude<ReturnType<typeof readConfig>, undefined>;
