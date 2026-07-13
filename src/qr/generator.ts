import QRCode from 'qrcode';
import type { QrOptions } from './types';

function toLibraryOptions(options: QrOptions) {
  return {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: 2,
    width: options.size,
    color: {
      dark: options.foreground,
      light: options.background,
    },
  };
}

export async function createQrPngDataUrl(value: string, options: QrOptions): Promise<string> {
  return QRCode.toDataURL(value, toLibraryOptions(options));
}

export async function createQrSvg(value: string, options: QrOptions): Promise<string> {
  return QRCode.toString(value, {
    ...toLibraryOptions(options),
    type: 'svg',
  });
}
