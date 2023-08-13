/** @type {import("prettier").Config & import("@ianvs/prettier-plugin-sort-imports").PluginConfig} */
export default {
  arrowParens: 'always',
  printWidth: 80,
  singleQuote: true,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: 'es5',
  tabWidth: 2,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  // @ianvs/prettier-plugin-sort-imports settings:
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '~/(.*)$',
    '^\\.\\.?/(.*)$',
  ],
  importOrderTypeScriptVersion: '5.1.6',
};
