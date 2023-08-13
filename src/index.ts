import type ts from 'typescript/lib/tsserverlibrary';

import { getLanguageServerHooks } from './hooks';
import { readConfig } from './readConfig';
import { readOptions } from './readOptions';
import { TSContext, tss } from './types';

const init = (modules: { typescript: tss }) => {
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      const program = info.languageService.getProgram()!;

      const logger = (msg: string | {}, type = 'info' as 'info' | 'error') => {
        const payload =
          typeof msg === 'string' ? msg : `\n${JSON.stringify(msg, null, 2)}`;
        info.project.projectService.logger[type === 'info' ? 'info' : 'msg'](
          `TSTamagui:: ${payload}`
        );
      };
      logger.error = (msg: string | {}) => logger(msg, 'error');

      logger('Initializing Tamagui Plugin...');

      const ctx: TSContext = {
        info,
        modules,
        logger,
        program,
        typeChecker: program.getTypeChecker(),
      };

      const getContext = () => {
        const program =
          (info.project['program'] as ts.Program | undefined) ?? ctx.program;
        return {
          ...ctx,
          program,
          typeChecker: program.getTypeChecker(),
        };
      };

      const { tamaguiConfigFilePath, defaultTheme } = readOptions(ctx);

      logger(`Using tamagui config path: ${tamaguiConfigFilePath}`);

      const tamaguiConfig = readConfig(tamaguiConfigFilePath, ctx);

      if (!tamaguiConfig) {
        logger(`Tamagui config was not parsed. Bailing.`);
        return info.languageService;
      }

      const languageServerHooks = getLanguageServerHooks({
        config: tamaguiConfig,
        defaultTheme,
        getContext,
      });

      const proxy: ts.LanguageService = Object.create(null);
      for (const k of Object.keys(info.languageService) as Array<
        keyof ts.LanguageService
      >) {
        const x = info.languageService[k]!;
        // @ts-expect-error - this is fine
        proxy[k] = (...args: Array<{}>) =>
          // @ts-expect-error - this is fine
          x.apply(info.languageService, args);
      }

      Object.assign(proxy, languageServerHooks);

      return proxy;
    },
  };
};

export = init;
