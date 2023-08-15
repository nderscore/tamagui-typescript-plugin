import type ts from 'typescript/lib/tsserverlibrary';

import { getCompletionDetails } from './getCompletionDetails';
import { getCompletionsAtPosition } from './getCompletions';
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

      return getCompletionsAtPosition(original, {
        fileName,
        position,
        options,
        ctx,
        config,
        defaultTheme,
      });
    },
  };

  return languageServerHooks;
};
