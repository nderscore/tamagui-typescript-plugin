import ts from 'typescript/lib/tsserverlibrary';

import { getTokenWithValue } from './getTokens';
import {
  makeColorTokenDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { ParsedConfig } from './readConfig';
import { PluginOptions } from './readOptions';
import { TSContext } from './types';
import {
  getMaybeSpecificToken,
  sanitizeMaybeQuotedString,
  toPascal,
} from './utils';

export const getQuickInfo = (
  original: ts.QuickInfo | undefined,
  {
    fileName,
    position,
    ctx,
    config,
    options,
  }: {
    fileName: string;
    position: number;
    ctx: TSContext;
    config: ParsedConfig;
    options: PluginOptions;
  }
): ts.QuickInfo | undefined => {
  const { logger } = ctx;

  logger(`calculating tamagui quick info <$${position}@${fileName}>`);

  const tokenResult = getTokenWithValue(fileName, position, config, ctx);

  if (!tokenResult) return undefined;

  const [type, entryName, textSpan] = tokenResult;

  logger(`found token <${entryName}> of type <${type}>`);

  let found = false;
  const result: ts.QuickInfo = original ?? {
    kind: ts.ScriptElementKind.string,
    kindModifiers: '',
    textSpan,
  };

  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);

  if (type === 'color') {
    const themeValue = config.themeColors[sanitizedEntryName];
    if (themeValue) {
      result.kindModifiers = 'color';
      result.documentation ??= [];
      result.documentation.unshift({
        kind: 'markdown',
        text: makeThemeTokenDescription(themeValue, options),
      });
      found = true;
    }
  }

  if (found) return result;

  const [scale, value] = getMaybeSpecificToken(entryName, type, config);
  if (scale && value) {
    const isColor = scale === 'color';
    if (isColor) {
      result.kindModifiers = 'color';
    }
    result.documentation ??= [];
    result.documentation.unshift({
      kind: 'markdown',
      text: isColor
        ? makeColorTokenDescription(value, options)
        : makeTokenDescription(toPascal(scale), value),
    });
    found = true;
  }

  if (found) return result;

  return undefined;
};
