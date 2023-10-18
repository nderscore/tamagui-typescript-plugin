import ts from 'typescript/lib/tsserverlibrary';

import { getTokenWithValue } from './getTokens';
import {
  makeColorTokenDescription,
  makeShorthandDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
  makeVariantsSummary,
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

  if (!tokenResult) return original;

  const [
    { type, isShorthand, shorthand, prop },
    entryName,
    textSpan,
    originNode,
    variantsType,
  ] = tokenResult;

  logger(`Logging shorthand and prop ${shorthand} ${prop}`);

  logger(`found token <${entryName}> of type <${type}>`);

  let touched = false;
  const result: ts.QuickInfo = original ?? {
    kind: ts.ScriptElementKind.string,
    kindModifiers: '',
    textSpan,
  };

  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);

  if (isShorthand && shorthand && options.showShorthandTranslations) {
    safeInsertDocs(
      result,
      'shorthand',
      makeShorthandDescription(shorthand, prop)
    );
    touched = true;
  }

  if (variantsType && originNode) {
    logger(`Inserting variant docs`);
    const variantDocs = makeVariantsSummary(
      variantsType,
      originNode,
      ctx.typeChecker
    );
    logger(variantDocs);
    safeInsertDocs(result, 'variantDocs', variantDocs);
  }

  let foundThemeColor = false;
  if (type === 'color') {
    const themeValue = config.themeColors[sanitizedEntryName];
    if (themeValue) {
      result.kindModifiers = 'color';
      safeInsertDocs(
        result,
        'token',
        makeThemeTokenDescription(themeValue, options)
      );
      foundThemeColor = true;
      touched = true;
    }
  }

  const [scale, value] = !foundThemeColor
    ? getMaybeSpecificToken(entryName, type, config)
    : [];
  if (scale && value) {
    const isColor = scale === 'color';
    if (isColor) {
      result.kindModifiers = 'color';
    }
    safeInsertDocs(
      result,
      'token',
      isColor
        ? makeColorTokenDescription(value, options)
        : makeTokenDescription(toPascal(scale), value)
    );
    touched = true;
  }

  // avoid returning our custom result if we didn't touch it
  return touched ? result : original;
};
