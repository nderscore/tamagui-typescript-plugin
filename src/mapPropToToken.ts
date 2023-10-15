import { tokenCategories } from '@tamagui/helpers';

import { ParsedConfig } from './readConfig';

interface MapPropToTokenReturn {
  type: Exclude<keyof ParsedConfig, 'shorthands' | 'themeColors'>;
  shorthand?: string;
  prop: string;
  isShorthand: boolean;
}

/**
 * Maps a property or shorthand to a token category
 */
export const mapPropToToken = (
  prop: string,
  config: ParsedConfig
): MapPropToTokenReturn => {
  const shorthandMapped = config.shorthands[
    prop as keyof typeof config.shorthands
  ] as string | undefined;
  const isShorthand = Boolean(shorthandMapped);
  const realProp = shorthandMapped ?? prop;

  for (const [category, properties] of Object.entries(tokenCategories)) {
    if (realProp in properties) {
      return {
        type: category as Exclude<
          keyof ParsedConfig,
          'shorthands' | 'themeColors'
        >,
        shorthand: isShorthand ? prop : undefined,
        prop: realProp,
        isShorthand,
      };
    }
  }

  return { type: 'space', shorthand: prop, prop: realProp, isShorthand };
};
