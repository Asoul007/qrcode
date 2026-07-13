export type InputMode = 'text' | 'json';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ContentState = {
  canGenerate: boolean;
  normalizedValue: string;
  error: string | null;
  message: string;
  characterCount: number;
};

export type QrOptions = {
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  foreground: string;
  background: string;
};
