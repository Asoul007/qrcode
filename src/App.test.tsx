import { act, fireEvent, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as generator from './qr/generator';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders the main QR Studio screen with text mode selected by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'QR Studio' })).toBeInTheDocument();
    expect(screen.getByLabelText('二维码内容')).toHaveValue('Hello QR Studio');
    expect(screen.getByRole('button', { name: '文本' })).toHaveClass('active');
    expect(screen.getByRole('button', { name: '格式化 JSON' })).toBeDisabled();
    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();
    expect(screen.getByText('等待生成二维码…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '生成二维码' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下载 SVG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '复制内容' })).toBeDisabled();
  });

  it('clears the preview and blocks actions for invalid JSON', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: '{"site":' } });

    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();
    expect(screen.getByText('JSON 格式无效，请检查括号、引号和逗号。')).toBeInTheDocument();
    expect(screen.getByText('等待输入内容')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '复制内容' })).toBeDisabled();
  });

  it('clears preview and messages when the clear button is used', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
    fireEvent.change(screen.getByLabelText('二维码内容'), {
      target: { value: '{"site":"qr.example.com","content":"hello"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }));

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '格式化 JSON' }));

    expect(screen.getByText('JSON 已格式化。')).toBeInTheDocument();
    expect(screen.getByAltText('生成的二维码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '复制内容' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: '清空' }));

    expect(screen.getByLabelText('二维码内容')).toHaveValue('');
    expect(screen.queryByText('JSON 已格式化。')).not.toBeInTheDocument();
    expect(screen.getByText('等待输入内容')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '复制内容' })).toBeDisabled();
  });

  it('ignores clicks on the active mode button', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }));

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '文本' }));

    expect(screen.getByAltText('生成的二维码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '下载 SVG' })).toBeEnabled();
  });

  it('drops stale generation results after the content changes', async () => {
    const pngDeferred = createDeferred<string>();
    const svgDeferred = createDeferred<string>();

    vi.spyOn(generator, 'createQrPngDataUrl').mockReturnValue(pngDeferred.promise);
    vi.spyOn(generator, 'createQrSvg').mockReturnValue(svgDeferred.promise);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }));
    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: 'hello world' } });

    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();

    await act(async () => {
      pngDeferred.resolve('data:image/png;base64,stale');
      svgDeferred.resolve('<svg></svg>');
      await Promise.resolve();
    });

    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();
  });

  it('generates text QR after the button is clicked', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: 'hello world' } });

    expect(screen.getByText('文本有效。')).toBeInTheDocument();
    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();
    expect(screen.getByText('等待生成二维码…')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }));

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());
  });

  it('clamps oversized size input to the supported range', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('尺寸'), { target: { value: '99999' } });

    expect(screen.getByLabelText('尺寸')).toHaveDisplayValue('99999');
    expect(screen.queryByAltText('生成的二维码')).not.toBeInTheDocument();
    expect(screen.getByText('等待生成二维码…')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '生成二维码' }));

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());
    expect(screen.getByLabelText('尺寸')).toHaveDisplayValue('1024');
  });
});
