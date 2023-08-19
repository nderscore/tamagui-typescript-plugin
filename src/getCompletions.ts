import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenType } from './getTokens';
import { ParsedConfig } from './readConfig';
import { PluginOptions } from './readOptions';
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
    // opts,
    ctx,
    config,
    options,
  }: {
    fileName: string;
    position: number;
    opts?: ts.GetCompletionsAtPositionOptions;
    ctx: TSContext;
    config: ParsedConfig;
    options: PluginOptions;
  }
): ts.WithMetadata<ts.CompletionInfo> => {
  const { logger } = ctx;
  const { defaultTheme } = options;

  logger(`calculating tamagui completions <$${position}@${fileName}>`);

  const type = getTokenType(fileName, position, config, ctx);

  if (!type) return original;

  logger(`token type <${type}>`);

  const entries: ts.CompletionEntry[] = [];
  for (const entry of original.entries) {
    if (type === 'color') {
      const sanitizedEntryName = sanitizeMaybeQuotedString(entry.name);
      const themeValue = config.themeColors[sanitizedEntryName];
      if (themeValue) {
        if (
          options.completionFilters.custom?.('themeColor', sanitizedEntryName)
        ) {
          // custom filter
          continue;
        }
        const defaultValue =
          themeValue[defaultTheme] ?? Object.values(themeValue)[0];
        entry.kindModifiers = 'color';
        // add an extra '$' to prioritize theme tokens over color tokens
        entry.sortText = '$' + getSortText(entry.name);
        entry.labelDetails = {
          detail: ' ' + defaultValue,
          description: 'ThemeToken',
        };
        entries.push(entry);
        continue;
      }
    }

    const [scale, value, token] = getMaybeSpecificToken(
      entry.name,
      type,
      config
    );
    if (scale && value) {
      if (options.completionFilters.custom?.(scale, token)) {
        // custom filter
        continue;
      }
      const isTrueToken =
        (scale === 'space' || scale === 'size') &&
        (token === '$true' || token === '$-true');
      if (isTrueToken && !options.completionFilters.showTrueTokens) {
        // filter out true and -true tokens
        continue;
      }
      const isColor = scale === 'color';
      if (isColor && !options.completionFilters.showColorTokens) {
        // filter out color tokens if the option is disabled
        continue;
      }
      if (isColor) {
        entry.kindModifiers = 'color';
      }
      entry.sortText = getSortText(entry.name);
      entry.labelDetails = {
        detail: ' ' + value,
        description: `${toPascal(scale)}Token`,
      };
    }

    entries.push(entry);
  }

  original.entries = entries;

  return original;
};
