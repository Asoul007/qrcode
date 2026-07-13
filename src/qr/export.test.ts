import { describe, expect, it, vi } from 'vitest';
import { copyText, downloadTextFile } from './export';

describe('copyText', () => {
  it('copies text through navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await copyText('hello');

    expect(writeText).toHaveBeenCalledWith('hello');
  });
});

describe('downloadTextFile', () => {
  it('creates and clicks a download link', () => {
    const click = vi.fn();
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');
    const createElement = vi.spyOn(document, 'createElement');

    createElement.mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement);

    downloadTextFile('qr.svg', '<svg></svg>', 'image/svg+xml');

    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
  });
});
