import { describe, expect, it } from 'vitest';
import { createQrPngDataUrl, createQrSvg } from './generator';

const options = {
  errorCorrectionLevel: 'M' as const,
  size: 512,
  foreground: '#17201B',
  background: '#FFFFFF',
};

describe('qr generator', () => {
  it('creates a PNG data URL', async () => {
    const dataUrl = await createQrPngDataUrl('hello', options);

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('creates SVG markup', async () => {
    const svg = await createQrSvg('hello', options);

    expect(svg).toContain('<svg');
    expect(svg).toContain('#17201B');
  });
});
