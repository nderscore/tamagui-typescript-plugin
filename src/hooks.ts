import type ts from 'typescript/lib/tsserverlibrary';

import { getCompletionDetails } from './getCompletionDetails';
import { getCompletions } from './getCompletions';
import { getQuickInfo } from './getQuickInfo';
import { ParsedConfig } from './readConfig';
import { TSContext } from './types';

/**
 * Binding code for hooks into the language server
 */
export const getLanguageServerHooks = ({
  config,
  defaultTheme,
  getContext,
}: {
  config: ParsedConfig;
  defaultTheme: string;
  getContext: () => TSContext;
}) => {
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

      return getCompletionDetails(original, {
        fileName,
        position,
        entryName,
        formatOptions,
        source,
        preferences,
        data,
        ctx,
        config,
        defaultTheme,
      });
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

      return getCompletions(original, {
        fileName,
        position,
        options,
        ctx,
        config,
        defaultTheme,
      });
    },
    //
    getQuickInfoAtPosition(fileName, position) {
      const ctx = getContext();
      const { info } = ctx;
      const original = info.languageService.getQuickInfoAtPosition(
        fileName,
        position
      );
      ctx.logger('HHUHH???????');
      return getQuickInfo(original, {
        fileName,
        position,
        ctx,
        config,
        defaultTheme,
      });
    },
    //
  };

  return languageServerHooks;
};
