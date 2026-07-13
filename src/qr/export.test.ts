import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText, downloadDataUrl, downloadTextFile } from './export';

const originalClipboard = navigator.clipboard;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: originalClipboard,
  });
});

describe('copyText', () => {
  it('copies text through navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await copyText('hello');

    expect(writeText).toHaveBeenCalledWith('hello');
  });
});

describe('downloadTextFile', () => {
  it('creates and clicks a download link', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:qr');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');

    downloadTextFile('qr.svg', '<svg></svg>', 'image/svg+xml');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledTimes(1);

    vi.runAllTimers();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:qr');
  });
});

describe('downloadDataUrl', () => {
  it('creates and clicks a direct data url download link', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');

    downloadDataUrl('qr.png', 'data:image/png;base64,abc');

    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledTimes(1);
  });
});
