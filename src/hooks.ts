import type ts from 'typescript/lib/tsserverlibrary';

import { getCompletionDetails } from './getCompletionDetails';
import { getCompletions } from './getCompletions';
import { getQuickInfo } from './getQuickInfo';
import { ParsedConfig } from './readConfig';
import { PluginOptions } from './readOptions';
import { TSContext } from './types';

/**
 * Binding code for hooks into the language server
 */
export const getLanguageServerHooks = ({
  config,
  options,
  getContext,
}: {
  config: ParsedConfig;
  options: PluginOptions;
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
        options,
      });
    },
    //
    getCompletionsAtPosition(fileName, position, opts) {
      const ctx = getContext();
      const { info } = ctx;
      const original = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        opts
      );

      if (!original) return undefined;

      return getCompletions(original, {
        fileName,
        position,
        opts,
        ctx,
        config,
        options,
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
      return getQuickInfo(original, {
        fileName,
        position,
        ctx,
        config,
        options,
      });
    },
    //
  };

  return languageServerHooks;
};
