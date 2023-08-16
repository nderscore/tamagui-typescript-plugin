import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenType } from './getTokens';
import {
  makeColorTokenDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { ParsedConfig } from './readConfig';
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
    // defaultTheme,
    ctx,
    config,
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
    defaultTheme: string;
  }
): ts.CompletionEntryDetails => {
  const { logger } = ctx;

  logger(`calculating tamagui completion details <$${position}@${fileName}>`);

  const type = getTokenType(fileName, position, config, ctx);

  if (!type) return original;

  logger(`token type <${type}>`);

  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);

  if (type === 'color') {
    const themeValue = config.themeColors[sanitizedEntryName];
    if (themeValue) {
      original.documentation ??= [];
      original.documentation.unshift({
        kind: 'markdown',
        text: makeThemeTokenDescription(themeValue),
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
          ? makeColorTokenDescription(value)
          : makeTokenDescription(toPascal(scale), value),
    });
  }

  return original;
};
