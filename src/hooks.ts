import { format } from 'path';
import type ts from 'typescript/lib/tsserverlibrary';

import { getTokenTypeAtPosition } from './getTokenType';
import {
  makeColorTokenDescription,
  makeThemeTokenDescription,
  makeTokenDescription,
} from './metadata';
import { readConfig } from './readConfig';
import { TSContext } from './types';

export const getLanguageServerHooks = ({
  config,
  defaultTheme,
  getContext,
}: {
  config: Exclude<ReturnType<typeof readConfig>, undefined>;
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

      const type = getTokenTypeAtPosition(fileName, position, ctx);

      if (!type) return original;

      logger(`tamagui completion details: ${position} @ ${fileName}`);

      if (type === 'color') {
        const themeValue = config.themeColors[entryName];
        if (themeValue) {
          original.documentation ??= [];
          original.documentation.push({
            kind: 'markdown',
            text: makeThemeTokenDescription(themeValue),
          });
        } else {
          const colorValue = config.color[entryName];
          if (colorValue) {
            original.documentation ??= [];
            original.documentation.push({
              kind: 'markdown',
              text: makeColorTokenDescription(colorValue),
            });
          }
        }
      } else {
        const c = config[type];
        const value = c[entryName];
        if (value) {
          const scale = `${type[0]!.toUpperCase()}${type.slice(1)}Token`;
          original.documentation ??= [];
          original.documentation.push({
            kind: 'markdown',
            text: makeTokenDescription(scale, value),
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

      const type = getTokenTypeAtPosition(fileName, position, ctx);

      if (!type) return original;

      if (type === 'color') {
        for (const entry of original.entries) {
          const themeValue = config.themeColors[entry.name];
          if (themeValue) {
            const defaultValue = themeValue[defaultTheme];
            entry.labelDetails ??= {};
            entry.labelDetails.detail = ' ' + defaultValue;
            entry.labelDetails.description = 'ThemeToken';
          } else {
            const colorValue = config.color[entry.name];
            if (colorValue) {
              entry.labelDetails ??= {};
              entry.labelDetails.detail = ' ' + colorValue;
              entry.labelDetails.description = 'ColorToken';
            }
          }
        }
      } else {
        const c = config[type];
        for (const entry of original.entries) {
          const value = c[entry.name];
          if (value) {
            entry.labelDetails ??= {};
            entry.labelDetails.detail = ' ' + value;
            entry.labelDetails.description = `${type[0]!.toUpperCase()}${type.slice(
              1
            )}Token`;
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
