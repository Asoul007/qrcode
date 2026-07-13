import { describe, expect, it } from 'vitest';
import { getContentState, getDensityWarning } from './content';

describe('getContentState', () => {
  it('accepts non-empty text and preserves line breaks', () => {
    const result = getContentState('text', 'hello\nworld');

    expect(result).toEqual({
      canGenerate: true,
      normalizedValue: 'hello\nworld',
      error: null,
      message: '文本有效。',
      characterCount: 11,
    });
  });

  it('blocks empty text', () => {
    const result = getContentState('text', '   ');

    expect(result.canGenerate).toBe(false);
    expect(result.error).toBe('请输入要生成二维码的内容。');
    expect(result.normalizedValue).toBe('');
  });

  it('formats valid JSON with two-space indentation', () => {
    const result = getContentState('json', '{"site":"qr.example.com","ok":true}');

    expect(result.canGenerate).toBe(true);
    expect(result.normalizedValue).toBe('{\n  "site": "qr.example.com",\n  "ok": true\n}');
    expect(result.error).toBeNull();
    expect(result.message).toBe('JSON 有效，已按 2 空格缩进格式化。');
  });

  it('blocks invalid JSON with a clear message', () => {
    const result = getContentState('json', '{"site":');

    expect(result.canGenerate).toBe(false);
    expect(result.normalizedValue).toBe('');
    expect(result.error).toBe('JSON 格式无效，请检查括号、引号和逗号。');
  });
});

describe('getDensityWarning', () => {
  it('returns null for short content', () => {
    expect(getDensityWarning('hello')).toBeNull();
  });

  it('warns for dense content', () => {
    expect(getDensityWarning('x'.repeat(900))).toBe(
      '内容较长，二维码会更密，建议扫码前先测试可读性。',
    );
  });
});
