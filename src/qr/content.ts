import type { ContentState, InputMode } from './types';

export function getContentState(mode: InputMode, rawValue: string): ContentState {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return {
      canGenerate: false,
      normalizedValue: '',
      error: '请输入要生成二维码的内容。',
      message: '等待输入内容。',
      characterCount: rawValue.length,
    };
  }

  if (mode === 'text') {
    return {
      canGenerate: true,
      normalizedValue: rawValue,
      error: null,
      message: '文本有效。',
      characterCount: rawValue.length,
    };
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('JSON root must be an object or array');
    }
    const normalizedValue = JSON.stringify(parsed, null, 2);

    return {
      canGenerate: true,
      normalizedValue,
      error: null,
      message: 'JSON 有效，可点击格式化 JSON 按钮。',
      characterCount: normalizedValue.length,
    };
  } catch {
    return {
      canGenerate: false,
      normalizedValue: '',
      error: 'JSON 格式无效，请检查括号、引号和逗号。',
      message: 'JSON 无效。',
      characterCount: rawValue.length,
    };
  }
}

export function getDensityWarning(value: string): string | null {
  return value.length >= 800 ? '内容较长，二维码会更密，建议扫码前先测试可读性。' : null;
}
