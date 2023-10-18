import ts from 'typescript/lib/tsserverlibrary';

import { getVariantsType } from './getVariantsType';
import { mapPropToToken } from './mapPropToToken';
import { ParsedConfig } from './readConfig';
import { TSContext } from './types';

/**
 * Create a stack of all the nodes at a given position
 */
const getNodeTreeAtPosition = (
  node: ts.Node,
  pos: number,
  tree: ts.Node[] = []
): ts.Node[] => {
  const children = node.getChildren();
  for (const child of children) {
    const start = child.getStart();
    const end = child.getEnd();
    if (start <= pos && pos <= end) {
      tree.push(child);
      return getNodeTreeAtPosition(child, pos, tree);
    }
  }
  return tree;
};

/**
 * Determines whether a given type is a TamaguiComponent or similar type
 */
const isTamaguiComponentType = (nodeType: ts.Type) => {
  if (nodeType.aliasSymbol?.escapedName === 'TamaguiComponent') {
    // styled() component
    return true;
  }
  if (nodeType.getProperty('staticConfig')) {
    // styleable() component
    return true;
  }
  return false;
};

/**
 * Determines whether to show tamagui completions at a given position and if
 * so, which type of tokens to show.
 *
 * Walks up the AST to determine whether the cursor position either is or is
 * a descendant of a node that is one of the following:
 *
 * - A property assignment inside a Tamagui styled() call
 * - A property assignment inside a Tamagui JSX element
 * - Or a JSX attribute inside a Tamagui JSX element
 *
 * If a valid property assignment or JSX attribute is found, it's name
 * determines the token type based on the property name.
 */
const getTokenAtPosition = (
  fileName: string,
  position: number,
  ctx: TSContext
) => {
  const { program, typeChecker, logger } = ctx;
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) return undefined;
  logger(`Found source file: ${sourceFile.fileName}`);

  const nodeTree = getNodeTreeAtPosition(sourceFile, position);

  if (nodeTree.length < 2) return undefined;

  let i = nodeTree.length - 1;
  const originNode = nodeTree[i];
  let valueNode: ts.Node | undefined;

  let isInTamaguiScope = false;
  let tagNode: ts.Node | undefined;
  let prop = '';
  let value = '';
  let variantType: ts.Type | undefined;

  let node: ts.Node;
  let done = false;
  while (!done && i >= 0) {
    node = nodeTree[i--]!;
    const nodeType = ctx.typeChecker.getTypeAtLocation(node);
    const isStringLiteral = nodeType.isStringLiteral();

    const isJsxAttribute = node.kind === ts.SyntaxKind.JsxAttribute;
    const isPropertyAssignment = node.kind === ts.SyntaxKind.PropertyAssignment;
    const isJsxOpeningElement = node.kind === ts.SyntaxKind.JsxOpeningElement;
    const isJsxSelfClosingElement =
      node.kind === ts.SyntaxKind.JsxSelfClosingElement;
    const isCallExpression = node.kind === ts.SyntaxKind.CallExpression;
    const isStyledCall =
      isCallExpression && node.getChildAt(0).getText() === 'styled';

    // logger(`
    //   node <${node.getText()}>
    //   nodeKind <${node.kind}>
    //   nodeType <${nodeType.aliasSymbol?.escapedName}>
    //   nodeTypeFlags <${nodeType.flags.toString()}>
    //   isJsxAttribute <${isJsxAttribute}>
    //   isPropertyAssignment <${isPropertyAssignment}>
    //   isJsxOpeningElement <${isJsxOpeningElement}>
    //   isJsxSelfClosingElement <${isJsxSelfClosingElement}>
    //   isCallExpression <${isCallExpression}>
    //   isStyledCall <${isStyledCall}>
    // `);

    if (!prop && !valueNode && isStringLiteral) {
      valueNode = node;
      if (isJsxAttribute) {
        value = node.getChildAt(2).getText();
      } else {
        value = node.getText();
      }
    }
    if (!prop && isPropertyAssignment) {
      prop = node.getChildAt(0).getText();
    }
    if (!prop && isJsxAttribute) {
      prop = node.getChildAt(0).getText();
    }
    if (isJsxOpeningElement || isJsxSelfClosingElement) {
      done = true;
      tagNode = node.getChildAt(1);
      const tagType = typeChecker.getTypeAtLocation(tagNode);
      const isTamaguiComponentTag = isTamaguiComponentType(tagType);
      variantType = getVariantsType(tagType, tagNode, ctx);
      if (isTamaguiComponentTag) {
        isInTamaguiScope = true;
      } else {
        logger(`Non tamagui component type <${node.getText()}>`);
      }
    }
    if (isStyledCall) {
      done = true;
      isInTamaguiScope = true;
    }
  }

  logger(`Tag name <${tagNode?.getText()}>`);
  logger(`Origin node <${originNode?.getText()}>`);
  logger(`Value node <${valueNode?.getText()}>`);
  logger(`Prop <${prop}>`);
  logger(`Value <${value}>`);
  logger(`Has variant type <${Boolean(variantType)}>`);
  logger(`Detected tamagui scope <${isInTamaguiScope}>`);

  // TODO: Remove !prop to detect component highlights
  if (!isInTamaguiScope) return undefined;

  return [prop, value, originNode, valueNode, variantType] as const;
};

export const getTokenType = (
  fileName: string,
  position: number,
  config: ParsedConfig,
  ctx: TSContext
) => {
  const tokenMatch = getTokenAtPosition(fileName, position, ctx);
  if (!tokenMatch) return undefined;
  const [prop] = tokenMatch;
  return mapPropToToken(prop, config);
};

export const getTokenWithValue = (
  fileName: string,
  position: number,
  config: ParsedConfig,
  ctx: TSContext
) => {
  const tokenMatch = getTokenAtPosition(fileName, position, ctx);
  if (!tokenMatch) return undefined;
  const [prop, value, originNode, valueNode, variantType] = tokenMatch;
  return [
    mapPropToToken(prop, config),
    value,
    valueNode
      ? {
          start: valueNode.end - value.length,
          length: value.length,
        }
      : { start: 0, length: 0 },
    originNode,
    variantType,
  ] as const;
};
