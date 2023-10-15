import ts from 'typescript/lib/tsserverlibrary';

type ResultWithDocumentation = {
  documentation?: ts.SymbolDisplayPart[];
};

/**
 * Safely inserts documentation into a result with deduping
 *
 * Pass null as the value to remove the documentation if it exists
 */
export const safeInsertDocs = <T extends ResultWithDocumentation>(
  target: T,
  id: string,
  value: string | null
): void => {
  const idTag = `<!--[tama-${id}]-->\n`;
  if (target.documentation) {
    const existingTagIndex = target.documentation.findIndex((doc) =>
      doc.text.endsWith(idTag)
    );
    if (existingTagIndex !== -1) {
      target.documentation.splice(existingTagIndex, 1);
    }
  }
  if (value === null) {
    return;
  }
  target.documentation ??= [];
  target.documentation.unshift({
    kind: 'markdown',
    text: `${value}\n\n${idTag}`,
  });
};
