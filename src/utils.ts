import { ParsedConfig } from './readConfig';

// Detect specific scale tokens ($foo.bar)
const specificTokenPattern = /^\$[A-Za-z]\w+\./;

/**
 * Reformats a token string to be used for sorting
 *
 * - Specific tokens are sorted last
 * - Numeric portions of tokens are sorted numerically
 */
export const getSortText = (sortText: string) => {
  let text = sortText;
  if (specificTokenPattern.test(text)) {
    // add prefix to specific tokens to sort them last:
    text = `__${text}`;
  }
  // add prefix to numeric portions of tokens to sort them numerically:
  text = text.replace(/(-?)(\d+|\btrue$)/, (_, sign, num) => {
    return `${sign ? '1' : '0'}${num.padStart(9, '0')}`;
  });
  return text;
};

/**
 * Extracts the token and scale from a token string
 * If a specific token was not used, the default scale is returneds
 */
export const getMaybeSpecificToken = (
  entryName: string,
  defaultScale: keyof ParsedConfig,
  config: ParsedConfig
) => {
  const sanitizedEntryName = sanitizeMaybeQuotedString(entryName);
  const [, scale, token] = sanitizedEntryName.match(
    /^\$([a-zA-Z]\w+)\.(.+)$/
  ) ?? ['', defaultScale, sanitizedEntryName];

  if (!scale || !token) return [undefined, undefined] as const;

  const scaleObj = config[scale as keyof ParsedConfig] as
    | ParsedConfig[keyof ParsedConfig]
    | undefined;

  const val = scaleObj?.[
    (token.startsWith('$') ? token : `$${token}`) as keyof typeof scaleObj
  ] as string | undefined;

  if (!val) return [undefined, undefined] as const;

  return [scale, val] as const;
};

/**
 * Removes quotes from a string if it's quoted
 */
export const sanitizeMaybeQuotedString = (str: string) =>
  str.replace(/^['"]|['"]$/g, '');

// TODO: should be more robust
export const toPascal = (str: string) => {
  if (str.length < 1) return '';
  return str[0]!.toUpperCase() + str.slice(1);
};
