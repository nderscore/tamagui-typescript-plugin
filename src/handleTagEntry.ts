import {
  CompletionEntryDetails,
  QuickInfo,
  SymbolDisplayPart,
} from 'typescript/lib/tsserverlibrary';

import { baseTag } from './TamaguiTags';

export const handleTagEntry = (
  tag: { name: ReturnType<typeof baseTag>; text: SymbolDisplayPart[] },
  obj: QuickInfo | CompletionEntryDetails
) => {
  obj.tags ??= [];
  obj.tags.push(tag);
};
