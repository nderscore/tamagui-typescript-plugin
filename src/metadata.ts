import color from 'color';

import { PluginOptions } from './readOptions';
import { toPascal } from './utils';

const squirclePath = `M 0,12 C 0,0 0,0 12,0 24,0 24,0 24,12 24,24 24,24 12,24 0, 24 0,24 0,12`;

const svgCheckerboard = `<defs>
<pattern id="pattern-checker" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
<rect x="0" y="0" width="4" height="4" fill="#fff" />
<rect x="4" y="0" width="4" height="4" fill="#000" />
<rect x="0" y="4" width="4" height="4" fill="#000" />
<rect x="4" y="4" width="4" height="4" fill="#fff" />
</pattern>
</defs>
<path d="${squirclePath}" fill="url(#pattern-checker)" />`;

const makeColorTile = (value: string, size: number) => {
  try {
    const colorValue = color(value);
    const hasAlphaTransparency = colorValue.alpha() !== 1;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">${
      hasAlphaTransparency ? svgCheckerboard : ''
    }<path d="${squirclePath}" fill="${value}" /></svg>`;
    const image = `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
    return image;
  } catch {
    return '';
  }
};

const makeTable = (rows: Record<string, string>[]) => {
  const header = rows[0]!;
  const keys = Object.keys(header);
  const renderRow = (row: Record<string, string>) => {
    return `| ${keys.map((key) => row[key]).join(' | ')} |`;
  };
  const renderSplitter = () => {
    return `| ${keys.map(() => '---').join(' | ')} |`;
  };

  return `${renderRow(header)}\n${renderSplitter()}\n${rows
    .slice(1)
    .map(renderRow)
    .join('\n')}`;
};

export const makeTokenDescription = (scale: string, value: string) => {
  return makeTable([
    { scale: 'Scale', value: 'Value' },
    {
      scale: `**${scale}**`,
      value,
    },
  ]);
};

export const makeColorTokenDescription = (
  value: string,
  options: PluginOptions
) => {
  return makeTable([
    { color: 'Color', value: 'Value' },
    {
      color: makeColorTile(value, options.colorTileSize),
      value: `\`${value}\``,
    },
  ]);
};

export const makeShorthandDescription = (shorthand: string, prop: string) => {
  return `\`${shorthand}\` is short for \`${prop}\``;
};

const formatThemePrefix = (key: string) => {
  return key.replace(/([A-Za-z0-9]+)(?:_|$)/g, (_, key) => toPascal(key));
};

export const makeThemeTokenDescription = (
  values: Record<string, string>,
  options: PluginOptions
) => {
  const table = [{ color: ' ', theme: 'Theme', value: 'Value' }];

  let groupPrefix = '';
  for (const [themeKey, value] of Object.entries(values)) {
    if (!themeKey.includes('_')) {
      table.push({
        color: makeColorTile(value, options.colorTileSize),
        theme: `**${toPascal(themeKey)}**`,
        value: `\`${value}\``,
      });
    } else {
      const [, group, key] = themeKey.match(/((?:[A-Za-z0-9]+_)+)(.+)/) ?? [];
      if (!group || !key) {
        throw new Error(`TSTamagui:: Invalid theme key <${themeKey}>`);
      }
      if (group !== groupPrefix) {
        groupPrefix = group;
        table.push({
          color: ' ',
          theme: `┌\u{A0}**${formatThemePrefix(group)}**`,
          value: '──────',
        });
      }
      table.push({
        color: `${makeColorTile(value, options.colorTileSize)}`,
        theme: `├ **${toPascal(key)}**`,
        value: `\`${value}\``,
      });
    }
  }

  return makeTable(table);
};
