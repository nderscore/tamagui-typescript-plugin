import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenType } from './getTokens';
import { handleTagEntry } from './handleTagEntry';
import {
  makeColorTokenDescription,
  makeShorthandDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { ParsedConfig } from './readConfig';
import { PluginOptions } from './readOptions';
import { TAMAGUI_SHORTHAND_TAG } from './TamaguiTags';
import { TSContext } from './types';
import {
  getMaybeSpecificToken,
  sanitizeMaybeQuotedString,
  toPascal,
} from './utils';

/**
 * Hook to augment completion details with markdown documentation
 */
export const getCompletionDetails = (
  original: ts.CompletionEntryDetails,
  {
    fileName,
    position,
    entryName,
    // formatOptions,
    // source,
    // preferences,
    // data,
    ctx,
    config,
    options,
  }: {
    entryName: string;
    fileName: string;
    position: number;
    formatOptions?: ts.FormatCodeOptions | ts.FormatCodeSettings;
    source?: string;
    preferences?: ts.UserPreferences;
    data?: ts.CompletionEntryData;
    ctx: TSContext;
    config: ParsedConfig;
    options: PluginOptions;
  }
): ts.CompletionEntryDetails => {
  const { logger } = ctx;

  logger(`calculating tamagui completion details <$${position}@${fileName}>`);

  const tokenType = getTokenType(fileName, position, config, ctx);

  if (!tokenType) return original;
  const { type, shorthand, prop, isShorthand } = tokenType;

  logger(`token type <${type}>`);

  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);

  if (
    isShorthand &&
    shorthand &&
    options.completionFilters.showShorthandConversion
  ) {
    handleTagEntry(
      {
        name: TAMAGUI_SHORTHAND_TAG,
        text: [
          {
            kind: 'markdown',
            text: makeShorthandDescription(shorthand, prop),
          },
        ],
      },
      original
    );
  }

  if (type === 'color') {
    const themeValue = config.themeColors[sanitizedEntryName];
    if (themeValue) {
      original.documentation ??= [];
      original.documentation.unshift({
        kind: 'markdown',
        text: makeThemeTokenDescription(themeValue, options),
      });
      return original;
    }
  }

  const [scale, value] = getMaybeSpecificToken(entryName, type, config);
  if (scale && value) {
    original.documentation ??= [];
    original.documentation.unshift({
      kind: 'markdown',
      text:
        scale === 'color'
          ? makeColorTokenDescription(value, options)
          : makeTokenDescription(toPascal(scale), value),
    });
  }

  return original;
};
