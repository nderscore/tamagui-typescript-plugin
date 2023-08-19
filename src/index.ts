import type ts from 'typescript/lib/tsserverlibrary';

import { getLanguageServerHooks } from './hooks';
import { readConfig } from './readConfig';
import { readOptions } from './readOptions';
import { TSContext, tss } from './types';

const init = (modules: { typescript: tss }) => {
  const plugin: ts.server.PluginModule = {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      const program = info.languageService.getProgram()!;

      const logger = (msg: string | {}, type = 'info' as 'info' | 'error') => {
        const payload =
          typeof msg === 'string'
            ? msg
            : `(json)\n${JSON.stringify(
                msg,
                (_key, val) =>
                  typeof val === 'function' ? val.toString() : val,
                2
              )}`;
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

      const options = readOptions(ctx);

      logger(`Options parsed`);
      logger(options);

      const { defaultTheme, tamaguiConfigFilePath } = options;

      logger(`Using tamagui config path: ${tamaguiConfigFilePath}`);

      const tamaguiConfig = readConfig(options, ctx);

      if (!tamaguiConfig) {
        logger.error(`Tamagui config was not parsed.`);
        return info.languageService;
      }

      const languageServerHooks = getLanguageServerHooks({
        config: tamaguiConfig,
        options,
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

      logger(`Setting up watcher for <${tamaguiConfigFilePath}>`);

      const watchHost = modules.typescript.createWatchCompilerHost(
        [tamaguiConfigFilePath],
        { resolveJsonModule: true },
        modules.typescript.sys
      );

      watchHost.watchFile(tamaguiConfigFilePath, () => {
        logger('tamagui.config.json was updated.');
        const nextTamaguiConfig = readConfig(options, getContext());
        if (!nextTamaguiConfig) {
          logger(`Failed to parse updated tamagui config.`);
          return;
        }
        logger('Replacing tamagui config with new values.');
        for (const key in Object.keys(tamaguiConfig)) {
          delete tamaguiConfig[key as keyof typeof tamaguiConfig];
        }
        Object.assign(tamaguiConfig, nextTamaguiConfig);
      });

      const _watchProgram = modules.typescript.createWatchProgram(watchHost);

      return proxy;
    },
  };

  return plugin;
};

export = init;
