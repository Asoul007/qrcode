import { useEffect, useMemo, useState } from 'react';
import { getContentState, getDensityWarning } from './qr/content';
import { createQrPngDataUrl, createQrSvg } from './qr/generator';
import { copyText, downloadDataUrl, downloadTextFile } from './qr/export';
import type { ErrorCorrectionLevel, InputMode, QrOptions } from './qr/types';

const defaultJson = JSON.stringify(
  {
    type: 'demo',
    site: 'qr.example.com',
    content: 'hello',
  },
  null,
  2,
);

const defaultOptions: QrOptions = {
  errorCorrectionLevel: 'M',
  size: 512,
  foreground: '#17201B',
  background: '#FFFFFF',
};

function normalizeSize(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultOptions.size;
  }

  const stepped = Math.round(value / 128) * 128;
  return Math.min(1024, Math.max(256, stepped));
}

export default function App() {
  const [mode, setMode] = useState<InputMode>('json');
  const [rawValue, setRawValue] = useState(defaultJson);
  const [options, setOptions] = useState<QrOptions>(defaultOptions);
  const [generationRequest, setGenerationRequest] = useState(0);
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [generatedSignature, setGeneratedSignature] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const contentState = useMemo(() => getContentState(mode, rawValue), [mode, rawValue]);
  const densityWarning = useMemo(
    () => getDensityWarning(contentState.normalizedValue),
    [contentState.normalizedValue],
  );
  const currentSignature = useMemo(() => {
    if (!contentState.canGenerate) {
      return '';
    }

    return [
      contentState.normalizedValue,
      options.errorCorrectionLevel,
      options.size,
      options.foreground,
      options.background,
    ].join('\u0000');
  }, [contentState.canGenerate, contentState.normalizedValue, options]);
  const currentDomain = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://qr.example.com';
    }

    return window.location.origin === 'null' ? 'https://qr.example.com' : window.location.origin;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!contentState.canGenerate) {
        setActionMessage('');
        return;
      }

      const [nextPng, nextSvg] = await Promise.all([
        createQrPngDataUrl(contentState.normalizedValue, options),
        createQrSvg(contentState.normalizedValue, options),
      ]);

      if (!cancelled) {
        setPngDataUrl(nextPng);
        setSvgMarkup(nextSvg);
        setGeneratedSignature(currentSignature);
        setActionMessage('');
      }
    }

    generate().catch(() => {
      if (!cancelled) {
        setActionMessage('二维码生成失败，请缩短内容后重试。');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contentState.canGenerate, contentState.normalizedValue, currentSignature, generationRequest, options]);

  function switchMode(nextMode: InputMode) {
    setMode(nextMode);
    setActionMessage('');
  }

  function formatJson() {
    const nextState = getContentState('json', rawValue);
    if (nextState.canGenerate) {
      setRawValue(nextState.normalizedValue);
      setActionMessage('JSON 已格式化。');
      return;
    }

    setActionMessage(nextState.error ?? 'JSON 格式无效。');
  }

  async function handleCopy() {
    try {
      await copyText(contentState.normalizedValue);
      setActionMessage('内容已复制。');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : '复制失败。');
    }
  }

  function updateOption<K extends keyof QrOptions>(key: K, value: QrOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  function handleSizeChange(value: number) {
    setOptions((current) => ({ ...current, size: normalizeSize(value) }));
  }

  const canExport = contentState.canGenerate && generatedSignature === currentSignature && Boolean(pngDataUrl && svgMarkup);
  const previewLabel = contentState.canGenerate ? '正在生成二维码…' : '等待输入内容';

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">QR</div>
          <div>
            <h1>QR Studio</h1>
            <p>文本与 JSON 二维码生成器</p>
          </div>
        </div>
        <div className="domain">
          <span>当前绑定域名</span>
          <strong>{currentDomain}</strong>
        </div>
      </header>

      <section className="workspace" aria-label="二维码生成工作台">
        <div className="panel editor">
          <h2 className="section-title">输入内容，立即生成二维码</h2>
          <p className="helper">
            MVP 只处理本地输入的文本或 JSON，不上传内容。JSON 模式会先校验，再生成可下载的 PNG 或 SVG。
          </p>

          <div className="segmented" aria-label="输入模式">
            <button className={mode === 'text' ? 'segment active' : 'segment'} onClick={() => switchMode('text')} type="button">
              文本
            </button>
            <button className={mode === 'json' ? 'segment active' : 'segment'} onClick={() => switchMode('json')} type="button">
              JSON
            </button>
          </div>

          <div className="field-row">
            <label htmlFor="content">二维码内容</label>
            <span className="count">{contentState.characterCount} 字符</span>
          </div>

          <textarea
            id="content"
            spellCheck={false}
            value={rawValue}
            onChange={(event) => setRawValue(event.target.value)}
          />

          <div className={contentState.error ? 'status danger' : 'status'}>
            <span>{contentState.error ?? densityWarning ?? contentState.message}</span>
            <span>纠错等级 {options.errorCorrectionLevel}</span>
          </div>

          <div className="secondary-actions">
            <button disabled={mode !== 'json'} onClick={formatJson} type="button">
              格式化 JSON
            </button>
            <button onClick={() => setRawValue('')} type="button">
              清空
            </button>
            <button className="primary" disabled={!contentState.canGenerate} onClick={() => setGenerationRequest((value) => value + 1)} type="button">
              生成二维码
            </button>
          </div>
          {actionMessage ? <p className="action-message">{actionMessage}</p> : null}
        </div>

        <aside className="panel preview" aria-label="二维码预览">
          <div className="preview-head">
            <div>
              <h2>实时预览</h2>
              <p>适合手机摄像头和常见扫码工具。</p>
            </div>
            <span className="quality">{options.size} px</span>
          </div>

          <div className="qr-stage">
            <div className="qr-box">
              {pngDataUrl ? <img alt="生成的二维码" src={pngDataUrl} /> : <span>{previewLabel}</span>}
            </div>
          </div>

          <div className="controls">
            <label>
              纠错
              <select
                value={options.errorCorrectionLevel}
                onChange={(event) => updateOption('errorCorrectionLevel', event.target.value as ErrorCorrectionLevel)}
              >
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="Q">Q</option>
                <option value="H">H</option>
              </select>
            </label>
            <label>
              尺寸
              <input
                min="256"
                max="1024"
                step="128"
                type="number"
                value={options.size}
                onChange={(event) => handleSizeChange(Number(event.target.value))}
              />
            </label>
            <label>
              前景色
              <input
                type="color"
                value={options.foreground}
                onChange={(event) => updateOption('foreground', event.target.value)}
              />
            </label>
            <label>
              背景色
              <input
                type="color"
                value={options.background}
                onChange={(event) => updateOption('background', event.target.value)}
              />
            </label>
          </div>

          <div className="export-actions">
            <button className="primary" disabled={!canExport} onClick={() => downloadDataUrl('qr-code.png', pngDataUrl)} type="button">
              下载 PNG
            </button>
            <button disabled={!canExport} onClick={() => downloadTextFile('qr-code.svg', svgMarkup, 'image/svg+xml')} type="button">
              下载 SVG
            </button>
            <button disabled={!contentState.canGenerate} onClick={handleCopy} type="button">
              复制内容
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
