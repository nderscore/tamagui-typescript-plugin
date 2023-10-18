import ts from 'typescript/lib/tsserverlibrary';

import { TSContext } from './types';

export const getVariantsType = (
  type: ts.Type,
  node: ts.Node,
  ctx: TSContext
) => {
  const TVariantPropsSymbol = type.getProperties().find((symb) => {
    return symb.escapedName === '___variantProps';
  });

  if (!TVariantPropsSymbol) {
    ctx.logger(`Could not find variant props`);
    return;
  }

  return ctx.typeChecker.getTypeOfSymbolAtLocation(TVariantPropsSymbol, node);
};
