import color from 'color';

import { toPascal } from './utils';

const svgCheckerboard = `<defs>
<pattern id="pattern-checker" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
<rect x="0" y="0" width="4" height="4" fill="#fff" />
<rect x="4" y="0" width="4" height="4" fill="#000" />
<rect x="0" y="4" width="4" height="4" fill="#000" />
<rect x="4" y="4" width="4" height="4" fill="#fff" />
</pattern>
</defs>
<rect x="1" y="1" width="22" height="22" rx="4" fill="url(#pattern-checker)" />`;

const makeColorTile = (value: string) => {
  try {
    const colorValue = color(value);
    const hasAlphaTransparency = colorValue.alpha() !== 1;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${
      hasAlphaTransparency ? svgCheckerboard : ''
    }<rect x="1" y="1" width="22" height="22" fill="${value}" rx="4" /></svg>`;
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

export const makeColorTokenDescription = (value: string) => {
  return makeTable([
    { color: 'Color', value: 'Value' },
    {
      color: makeColorTile(value),
      value: `\`${value}\``,
    },
  ]);
};

const formatThemePrefix = (key: string) => {
  return key.replace(/([A-Za-z0-9]+)(?:_|$)/g, (_, key) => toPascal(key));
};

export const makeThemeTokenDescription = (values: Record<string, string>) => {
  const table = [{ color: ' ', theme: 'Theme', value: 'Value' }];

  let groupPrefix = '';
  for (const [themeKey, value] of Object.entries(values)) {
    if (!themeKey.includes('_')) {
      table.push({
        color: makeColorTile(value),
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
        color: `${makeColorTile(value)}`,
        theme: `├ **${toPascal(key)}**`,
        value: `\`${value}\``,
      });
    }
  }

  return makeTable(table);
};
