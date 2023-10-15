import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenType } from './getTokens';
import {
  makeColorTokenDescription,
  makeShorthandDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { ParsedConfig } from './readConfig';
import { PluginOptions } from './readOptions';
import { safeInsertDocs } from './safeInsertDocs';
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

  if (isShorthand && shorthand && options.showShorthandTranslations) {
    safeInsertDocs(
      original,
      'shorthand',
      makeShorthandDescription(shorthand, prop)
    );
  }

  let foundThemeColor = false;
  if (type === 'color') {
    const themeValue = config.themeColors[sanitizedEntryName];
    if (themeValue) {
      safeInsertDocs(
        original,
        'token',
        makeThemeTokenDescription(themeValue, options)
      );
      foundThemeColor = true;
    }
  }

  const [scale, value] = !foundThemeColor
    ? getMaybeSpecificToken(entryName, type, config)
    : [];
  if (scale && value) {
    const isColor = scale === 'color';
    safeInsertDocs(
      original,
      'token',
      isColor
        ? makeColorTokenDescription(value, options)
        : makeTokenDescription(toPascal(scale), value)
    );
  }

  return original;
};
