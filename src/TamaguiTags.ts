export const baseTag = (tag: string) => `tama-${tag}` as const;

export const TAMAGUI_SHORTHAND_TAG = baseTag('shorthand');
