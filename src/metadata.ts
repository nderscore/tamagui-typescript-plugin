import color from 'color';

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
    { value: 'Value', scale: 'Scale' },
    { value, scale },
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

export const makeThemeTokenDescription = (values: Record<string, string>) => {
  return makeTable([
    { color: 'Color', theme: 'Theme', value: 'Value' },
    ...Object.entries(values).map(([theme, value]) => {
      return {
        color: makeColorTile(value),
        theme: `**${theme}**`,
        value: `\`${value}\``,
      };
    }),
  ]);
};
