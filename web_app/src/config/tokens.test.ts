import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { tokens } from './tokens';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(start => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

it('keeps body, muted and status text at AA contrast on terminal surfaces', () => {
  for (const foreground of [tokens.text, tokens.muted, tokens.green, tokens.amber]) {
    for (const background of [tokens.obsidian, tokens.charcoal, tokens.charcoal2]) {
      const light = luminance(foreground), dark = luminance(background);
      expect((light + 0.05) / (dark + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  }
});

it('keeps CSS color tokens aligned and supplies reduced-motion overrides', () => {
  const css = readFileSync('src/styles/index.css', 'utf8');
  for (const value of Object.values(tokens)) expect(css).toContain(value);
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(css).toContain('animation: none !important');
  expect(css).toContain('transition: none !important');
});
