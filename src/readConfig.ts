import type { TamaguiInternalConfig } from '@tamagui/core';

import { TSContext } from './types';

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

const getThemeColors = (themes: TamaguiInternalConfig['themes']) => {
  const themeTokens: Record<string, Record<string, string>> = {};

  for (const [themeName, theme] of Object.entries(themes)) {
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

export const readConfig = (
  tamaguiConfigFilePath: string,
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
    const { tokens, themes } = jsonConfig;

    const color = simplifyTokenMap(tokens.color);
    const space = simplifyTokenMap(tokens.space);
    const size = simplifyTokenMap(tokens.size);
    const radius = simplifyTokenMap(tokens.radius);
    const zIndex = simplifyTokenMap(tokens.zIndex, false);
    const themeColors = getThemeColors(themes);

    const config = {
      color,
      space,
      size,
      radius,
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
