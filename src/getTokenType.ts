import type ts from 'typescript/lib/tsserverlibrary';

import { TSContext } from './types';

const getNodeTreeAtPosition = (
  node: ts.Node,
  pos: number,
  depth = 0
): ts.Node[] => {
  const tree: ts.Node[] = [];
  const children = node.getChildren();
  for (const child of children) {
    const start = child.getStart();
    const end = child.getEnd();
    if (start <= pos && pos <= end) {
      tree.push(child);
      tree.push(
        ...children.flatMap((child) =>
          getNodeTreeAtPosition(child, pos, depth + 1)
        )
      );
    }
  }
  return tree;
};

export const getTokenTypeAtPosition = (
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

  const top = nodeTree.pop()!;
  let parent = nodeTree.pop()!;
  const topType = typeChecker.getTypeAtLocation(top);

  // unwrap JSX expressions
  if (topType.isStringLiteral() && parent.getText()[0] === '{') {
    parent = nodeTree.pop()!;
  } else if (top.getText() === '}' && parent.getText()[0] === '{') {
    parent = nodeTree.pop()!;
    parent = nodeTree.pop() ?? parent;
  }

  let isMaybeTamaguiToken = false;
  while (!isMaybeTamaguiToken && nodeTree.length > 0) {
    const node = nodeTree.pop()!;
    const nodeType = typeChecker.getTypeAtLocation(node);
    if (typeChecker.typeToString(nodeType).startsWith('TamaguiComponent<')) {
      // is inside `styled()` call
      isMaybeTamaguiToken = true;
    }
    if (typeChecker.typeToString(nodeType) === 'Element') {
      // is maybe jsx prop
      isMaybeTamaguiToken = true;
    }
  }

  logger(`Parent text: <${parent.getText()}>`);
  logger(`Is maybe tamagui token: ${isMaybeTamaguiToken} <${top.getText()}>`);

  if (!isMaybeTamaguiToken) return undefined;

  // TODO:
  // Make these checks more robust, more comprehendible, & support shorthands:

  if (
    /^(?:color|(?:background|shadow|outline|border(?:Top|Left|Right|Bottom)*)Color)[:=]/.test(
      parent.getText()
    )
  ) {
    return 'color';
  }

  if (
    /^(?:space|(?:padding|margin)(?:Top|Left|Right|Bottom)?|gap|(?:row|column)Gap)[:=]/.test(
      parent.getText()
    )
  ) {
    return 'space';
  }

  if (
    /^(?:size|width|height|border(?:Top|Left|Right|Bottom)*Width)[:=]/.test(
      parent.getText()
    )
  ) {
    return 'size';
  }

  if (
    /^(?:border(?:Top|Left|Right|Bottom)*Radius)[:=]/.test(parent.getText())
  ) {
    return 'radius';
  }

  if (/^zIndex[:=]/.test(parent.getText())) {
    return 'zIndex';
  }

  return undefined;
};
