import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenType } from './getTokens';
import { ParsedConfig } from './readConfig';
import { TSContext } from './types';
import {
  getMaybeSpecificToken,
  getSortText,
  sanitizeMaybeQuotedString,
  toPascal,
} from './utils';

/**
 * Hook to augment completion results with tamagui tokens
 */
export const getCompletions = (
  original: ts.WithMetadata<ts.CompletionInfo>,
  {
    fileName,
    position,
    // options,
    ctx,
    config,
    defaultTheme,
  }: {
    fileName: string;
    position: number;
    options?: ts.GetCompletionsAtPositionOptions;
    ctx: TSContext;
    config: ParsedConfig;
    defaultTheme: string;
  }
): ts.WithMetadata<ts.CompletionInfo> => {
  const { logger } = ctx;

  logger(`calculating tamagui completions <$${position}@${fileName}>`);

  const type = getTokenType(fileName, position, config, ctx);

  if (!type) return original;

  logger(`token type <${type}>`);

  for (const entry of original.entries) {
    if (type === 'color') {
      const themeValue =
        config.themeColors[sanitizeMaybeQuotedString(entry.name)];
      if (themeValue) {
        const defaultValue =
          themeValue[defaultTheme] ?? Object.values(themeValue)[0];
        entry.kindModifiers = 'color';
        // add an extra '$' to prioritize theme tokens over color tokens
        entry.sortText = '$' + getSortText(entry.name);
        entry.labelDetails = {
          detail: ' ' + defaultValue,
          description: 'ThemeToken',
        };
        continue;
      }
    }

    const [scale, value] = getMaybeSpecificToken(entry.name, type, config);
    if (scale && value) {
      const isColor = scale === 'color';
      if (isColor) {
        entry.kindModifiers = 'color';
      }
      entry.sortText = getSortText(entry.name);
      entry.labelDetails = {
        detail: ' ' + value,
        description: `${toPascal(scale)}Token`,
      };
    }
  }

  return original;
};
