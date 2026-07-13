import { fireEvent, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('renders the main QR Studio screen', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'QR Studio' })).toBeInTheDocument();
    expect(screen.getByLabelText('二维码内容')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());
  });

  it('keeps the last valid preview but blocks export for invalid JSON', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: '{"site":' } });

    expect(screen.getByText('JSON 格式无效，请检查括号、引号和逗号。')).toBeInTheDocument();
    expect(screen.getByAltText('生成的二维码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled();
  });

  it('switches to text mode and accepts plain text', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '文本' }));
    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: 'hello world' } });

    expect(screen.getByText('文本有效。')).toBeInTheDocument();
  });

  it('clamps oversized size input to the supported range', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('尺寸'), { target: { value: '99999' } });

    expect(screen.getByText('1024 px')).toBeInTheDocument();
  });
});
