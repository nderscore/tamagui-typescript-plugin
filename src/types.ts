import type ts from 'typescript/lib/tsserverlibrary';

export type tss = typeof ts;

export type TSContextBase = {
  info: ts.server.PluginCreateInfo;
  modules: { typescript: tss };
  logger: ((msg: string | {}, type?: 'info' | 'error') => void) & {
    error: (msg: string | {}) => void;
  };
};

export type TSContext = TSContextBase & {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
};
