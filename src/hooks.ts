import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenTypeAtPosition } from './getTokenType';
import {
  makeColorTokenDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { ParsedConfig } from './readConfig';
import { TSContext } from './types';

const sanitizeMaybeQuotedString = (str: string) =>
  str.replace(/^['"]|['"]$/g, '');

const getMaybeSpecificToken = (
  entryName: string,
  defaultScale: keyof ParsedConfig,
  config: ParsedConfig
) => {
  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);
  const [, scale, token] = sanitizedEntryName.match(/^\$(\w+)\.(.+)$/) ?? [
    '',
    defaultScale,
    sanitizedEntryName,
  ];

  if (!scale) return [undefined, undefined] as const;

  const scaleObj = config[scale as keyof ParsedConfig] as
    | ParsedConfig[keyof ParsedConfig]
    | undefined;

  if (!token) return [undefined, undefined] as const;

  const val = scaleObj?.[
    (token.startsWith('$') ? token : `$${token}`) as keyof typeof scaleObj
  ] as string | undefined;

  if (!val) return [undefined, undefined] as const;

  return [scale, val] as const;
};

const toPascal = (str: string) => {
  if (str.length < 1) return '';
  return str[0]!.toUpperCase() + str.slice(1);
};

export const getLanguageServerHooks = ({
  config,
  defaultTheme,
  getContext,
}: {
  config: ParsedConfig;
  defaultTheme: string;
  getContext: () => TSContext;
}) => {
  const { logger } = getContext();

  const languageServerHooks: Partial<ts.LanguageService> = {
    //
    getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data
    ) {
      const ctx = getContext();
      const { info } = ctx;
      const original = info.languageService.getCompletionEntryDetails(
        fileName,
        position,
        entryName,
        formatOptions,
        source,
        preferences,
        data
      );

      if (!original) return undefined;

      logger(`tamagui completion details: $${position} @ ${fileName}`);

      const type = getTokenTypeAtPosition(fileName, position, config, ctx);

      if (!type) return original;

      logger(`tamagui token type: ${type}`);

      const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);

      if (type === 'color') {
        const themeValue = config.themeColors[sanitizedEntryName];
        if (themeValue) {
          original.documentation ??= [];
          original.documentation.unshift({
            kind: 'markdown',
            text: makeThemeTokenDescription(themeValue),
          });
        } else {
          const colorValue = config.color[sanitizedEntryName];
          if (colorValue) {
            original.documentation ??= [];
            original.documentation.unshift({
              kind: 'markdown',
              text: makeColorTokenDescription(colorValue),
            });
          }
        }
      } else {
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
      }

      return original;
    },
    //
    getCompletionsAtPosition(fileName, position, options) {
      const ctx = getContext();
      const { info } = ctx;
      const original = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options
      );

      if (!original) return undefined;

      logger(`tamagui completion: ${position} @ ${fileName}`);

      const type = getTokenTypeAtPosition(fileName, position, config, ctx);

      if (!type) return original;

      logger(`tamagui token type: ${type}`);

      if (type === 'color') {
        for (const entry of original.entries) {
          const themeValue =
            config.themeColors[sanitizeMaybeQuotedString(entry.name)];
          if (themeValue) {
            const defaultValue = themeValue[defaultTheme];
            entry.labelDetails = {
              detail: ' ' + defaultValue,
              description: 'ThemeToken',
            };
          } else {
            const colorValue =
              config.color[sanitizeMaybeQuotedString(entry.name)];
            if (colorValue) {
              entry.labelDetails = {
                detail: ' ' + colorValue,
                description: 'ColorToken',
              };
            }
          }
        }
      } else {
        for (const entry of original.entries) {
          const [scale, value] = getMaybeSpecificToken(
            entry.name,
            type,
            config
          );
          logger(`tamagui token scale: ${scale} ${value}`);
          if (scale && value) {
            entry.labelDetails = {
              detail: ' ' + value,
              description: `${toPascal(scale)}Token`,
            };
          }
        }
      }

      return original;
    },
    //
    // getQuickInfoAtPosition(fileName, position) {
    //   const ctx = getContext();
    //   const { info } = ctx;
    //   const original = info.languageService.getQuickInfoAtPosition(
    //     fileName,
    //     position
    //   );

    //   if (!original) return undefined;

    //   logger('got type: ' + getTokenTypeAtPosition(fileName, position, ctx));

    //   return original;
    // },
    //
    // provideInlayHints(fileName, span, options) {
    //   const ctx = getContext();
    //   const { info } = ctx;
    //   const original = info.languageService.provideInlayHints(
    //     fileName,
    //     span,
    //     options
    //   );
    //   return original;
    // },
    //
  };

  return languageServerHooks;
};
