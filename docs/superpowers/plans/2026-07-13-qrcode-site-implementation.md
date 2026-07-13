# QR Code Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP QR Studio web app from the PRD and design mockup: a Cloudflare Pages-ready site that generates QR codes from plain text or valid JSON.

**Architecture:** Use a static Vite + React + TypeScript app so all QR generation happens in the browser and no user input is sent to a backend. Keep QR/content logic in small pure modules with unit tests, then wire those modules into a single responsive screen matching `docs/design/qrcode-site-main-screen.html`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, `qrcode`, Cloudflare Pages static hosting.

---

## Scope Check

This plan covers one deployable MVP and does not include image upload, accounts, history, analytics, short links, or batch generation. Future Worker/Pages Functions work should be planned separately after the static MVP is working.

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite HTML shell.
- Create `src/main.tsx`: React entrypoint.
- Create `src/App.tsx`: main screen composition and app state.
- Create `src/App.css`: production UI styling based on the approved design.
- Create `src/qr/types.ts`: shared app types.
- Create `src/qr/content.ts`: text/JSON validation and normalization.
- Create `src/qr/content.test.ts`: unit tests for text/JSON behavior.
- Create `src/qr/generator.ts`: QR PNG/SVG generation wrappers around `qrcode`.
- Create `src/qr/generator.test.ts`: unit tests for QR wrapper output.
- Create `src/qr/export.ts`: download and clipboard helpers.
- Create `src/qr/export.test.ts`: unit tests for export helper behavior.
- Create `src/test/setup.ts`: test environment setup.
- Create `vite.config.ts`: Vite and Vitest config.
- Create `tsconfig.json` and `tsconfig.node.json`: TypeScript config.
- Create `docs/deployment-cloudflare-pages.md`: Cloudflare Pages deployment notes.
- Modify `docs/prd/qrcode-site-prd.md`: add a link to the implementation plan after the plan is complete.

---

### Task 1: Scaffold The Vite React App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json`:

```json
{
  "name": "qr-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "qrcode": "^1.5.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: Create the HTML shell**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="QR Studio 是一个文本与 JSON 二维码生成器，支持 PNG 和 SVG 导出。"
    />
    <title>QR Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript configs**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create Vite/Vitest config and test setup**

Create `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Create a minimal React entrypoint**

Create `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="page">
      <h1>QR Studio</h1>
      <p>文本与 JSON 二维码生成器</p>
    </main>
  );
}
```

Create `src/App.css`:

```css
:root {
  color: #17201b;
  background: #f7f8f5;
  font-family: Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.page {
  min-height: 100vh;
  padding: 28px clamp(18px, 4vw, 48px);
}
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 7: Verify scaffold**

Run:

```bash
npm run build
npm test
```

Expected: build exits with code 0, Vitest reports no failed tests.

- [ ] **Step 8: Commit scaffold**

```bash
git add package.json package-lock.json index.html src vite.config.ts tsconfig.json tsconfig.node.json
git commit -m "chore: scaffold qr studio app"
```

---

### Task 2: Add Content Validation And Normalization

**Files:**
- Create: `src/qr/types.ts`
- Create: `src/qr/content.ts`
- Create: `src/qr/content.test.ts`

- [ ] **Step 1: Write failing content tests**

Create `src/qr/content.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/qr/content.test.ts
```

Expected: FAIL because `src/qr/content.ts` does not exist.

- [ ] **Step 3: Add shared types**

Create `src/qr/types.ts`:

```ts
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
```

- [ ] **Step 4: Implement content logic**

Create `src/qr/content.ts`:

```ts
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
    const normalizedValue = JSON.stringify(parsed, null, 2);

    return {
      canGenerate: true,
      normalizedValue,
      error: null,
      message: 'JSON 有效，已按 2 空格缩进格式化。',
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
```

- [ ] **Step 5: Verify content tests pass**

Run:

```bash
npm test -- src/qr/content.test.ts
```

Expected: PASS for all tests in `content.test.ts`.

- [ ] **Step 6: Commit content logic**

```bash
git add src/qr/types.ts src/qr/content.ts src/qr/content.test.ts
git commit -m "feat: validate qr input content"
```

---

### Task 3: Add QR PNG And SVG Generation

**Files:**
- Create: `src/qr/generator.ts`
- Create: `src/qr/generator.test.ts`

- [ ] **Step 1: Write failing QR generation tests**

Create `src/qr/generator.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/qr/generator.test.ts
```

Expected: FAIL because `src/qr/generator.ts` does not exist.

- [ ] **Step 3: Implement QR generation wrappers**

Create `src/qr/generator.ts`:

```ts
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
```

- [ ] **Step 4: Verify QR generation tests pass**

Run:

```bash
npm test -- src/qr/generator.test.ts
```

Expected: PASS for both QR generation tests.

- [ ] **Step 5: Commit QR generation**

```bash
git add src/qr/generator.ts src/qr/generator.test.ts
git commit -m "feat: generate qr png and svg"
```

---

### Task 4: Add Export And Clipboard Helpers

**Files:**
- Create: `src/qr/export.ts`
- Create: `src/qr/export.test.ts`

- [ ] **Step 1: Write failing export tests**

Create `src/qr/export.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/qr/export.test.ts
```

Expected: FAIL because `src/qr/export.ts` does not exist.

- [ ] **Step 3: Implement export helpers**

Create `src/qr/export.ts`:

```ts
export async function copyText(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前浏览器不支持复制到剪贴板。');
  }

  await navigator.clipboard.writeText(value);
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(filename: string, dataUrl: string): void {
  const link = document.createElement('a');

  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

- [ ] **Step 4: Verify export tests pass**

Run:

```bash
npm test -- src/qr/export.test.ts
```

Expected: PASS for all export tests.

- [ ] **Step 5: Commit export helpers**

```bash
git add src/qr/export.ts src/qr/export.test.ts
git commit -m "feat: add qr export helpers"
```

---

### Task 5: Build The Main QR Studio Screen

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Replace `src/App.tsx` with the full app state and UI**

Use this implementation:

```tsx
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

export default function App() {
  const [mode, setMode] = useState<InputMode>('json');
  const [rawValue, setRawValue] = useState(defaultJson);
  const [options, setOptions] = useState<QrOptions>(defaultOptions);
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const contentState = useMemo(() => getContentState(mode, rawValue), [mode, rawValue]);
  const densityWarning = useMemo(
    () => getDensityWarning(contentState.normalizedValue),
    [contentState.normalizedValue],
  );

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
  }, [contentState.canGenerate, contentState.normalizedValue, options]);

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

  const currentDomain = window.location.origin === 'null' ? 'https://qr.example.com' : window.location.origin;
  const canExport = contentState.canGenerate && Boolean(pngDataUrl && svgMarkup);

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
            <button className={mode === 'text' ? 'segment active' : 'segment'} onClick={() => switchMode('text')}>
              文本
            </button>
            <button className={mode === 'json' ? 'segment active' : 'segment'} onClick={() => switchMode('json')}>
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
            <button disabled={mode !== 'json'} onClick={formatJson}>
              格式化 JSON
            </button>
            <button onClick={() => setRawValue('')}>清空</button>
            <button className="primary" disabled={!contentState.canGenerate}>
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
              {pngDataUrl ? <img src={pngDataUrl} alt="生成的二维码" /> : <span>等待输入内容</span>}
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
                onChange={(event) => updateOption('size', Number(event.target.value))}
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
            <button className="primary" disabled={!canExport} onClick={() => downloadDataUrl('qr-code.png', pngDataUrl)}>
              下载 PNG
            </button>
            <button disabled={!canExport} onClick={() => downloadTextFile('qr-code.svg', svgMarkup, 'image/svg+xml')}>
              下载 SVG
            </button>
            <button disabled={!contentState.canGenerate} onClick={handleCopy}>
              复制内容
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Replace `src/App.css` with production styling**

Use the approved visual style from `docs/design/qrcode-site-main-screen.html`, adapted for real controls:

```css
:root {
  --bg: #f7f8f5;
  --surface: #ffffff;
  --ink: #17201b;
  --muted: #637066;
  --line: #dfe6dc;
  --accent: #0f766e;
  --accent-strong: #0b5f59;
  --json: #8a5b12;
  --danger: #b42318;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}

.primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

.page {
  min-height: 100vh;
  padding: 28px clamp(18px, 4vw, 48px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1180px;
  margin: 0 auto 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--accent);
  font-size: 17px;
  font-weight: 800;
}

.brand h1 {
  margin: 0;
  font-size: 19px;
  line-height: 1.2;
}

.brand p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.domain {
  min-width: 270px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  padding: 10px 12px;
}

.domain span {
  display: block;
  color: var(--muted);
  font-size: 12px;
}

.domain strong {
  display: block;
  margin-top: 3px;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 650;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}

.editor,
.preview {
  padding: 24px;
}

.preview {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.section-title {
  margin: 0;
  font-size: 25px;
  line-height: 1.2;
  letter-spacing: 0;
}

.helper {
  max-width: 620px;
  margin: 8px 0 22px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.segmented {
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #eef3ee;
  padding: 4px;
}

.segment {
  min-width: 94px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
}

.segment.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 1px 2px rgb(23 32 27 / 10%);
}

.field-row,
.status,
.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-row {
  margin-top: 22px;
}

label {
  color: var(--ink);
  font-size: 14px;
  font-weight: 700;
}

.count {
  color: var(--muted);
  font-size: 12px;
}

textarea {
  width: 100%;
  min-height: 310px;
  margin-top: 10px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfa;
  color: var(--ink);
  padding: 16px;
  font-family: "Cascadia Code", Consolas, monospace;
  font-size: 14px;
  line-height: 1.65;
}

.status {
  margin-top: 12px;
  color: var(--json);
  font-size: 13px;
}

.status.danger {
  color: var(--danger);
}

.secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.action-message {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.preview-head {
  align-items: flex-start;
}

.preview-head h2 {
  margin: 0;
  font-size: 18px;
}

.preview-head p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.quality {
  border: 1px solid #cfe0dc;
  border-radius: 999px;
  color: var(--accent);
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.qr-stage {
  display: grid;
  min-height: 360px;
  margin: 28px 0 20px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f9faf7;
}

.qr-box {
  display: grid;
  width: min(72%, 292px);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
  color: var(--muted);
  text-align: center;
}

.qr-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: auto;
}

.controls label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
}

.controls input,
.controls select {
  min-height: 38px;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  padding: 0 10px;
}

.controls input[type="color"] {
  padding: 4px;
}

.export-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 860px) {
  .topbar {
    align-items: stretch;
    flex-direction: column;
  }

  .domain {
    min-width: 0;
  }

  .workspace {
    display: block;
  }

  .preview {
    margin-top: 18px;
  }

  .controls,
  .export-actions {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify the app builds**

Run:

```bash
npm run build
```

Expected: build exits with code 0 and creates `dist/`.

- [ ] **Step 4: Commit the UI**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: build qr studio screen"
```

---

### Task 6: Add App-Level Behavior Tests

**Files:**
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write app behavior tests**

Create `src/App.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main QR Studio screen', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'QR Studio' })).toBeInTheDocument();
    expect(screen.getByLabelText('二维码内容')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByAltText('生成的二维码')).toBeInTheDocument());
  });

  it('shows an error for invalid JSON', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: '{"site":' } });

    expect(screen.getByText('JSON 格式无效，请检查括号、引号和逗号。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled();
  });

  it('switches to text mode and accepts plain text', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '文本' }));
    fireEvent.change(screen.getByLabelText('二维码内容'), { target: { value: 'hello world' } });

    expect(screen.getByText('文本有效。')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run app tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS for all app behavior tests.

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm test
```

Expected: all test files pass.

- [ ] **Step 4: Commit app tests**

```bash
git add src/App.test.tsx
git commit -m "test: cover qr studio app behavior"
```

---

### Task 7: Add Cloudflare Pages Deployment Documentation

**Files:**
- Create: `docs/deployment-cloudflare-pages.md`
- Modify: `docs/prd/qrcode-site-prd.md`

- [ ] **Step 1: Create deployment notes**

Create `docs/deployment-cloudflare-pages.md`:

```md
# Cloudflare Pages Deployment

## Recommended MVP Hosting

Use Cloudflare Pages for the QR Studio MVP because the app is a static Vite build and QR generation runs locally in the browser.

## Build Settings

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: use the current Cloudflare Pages default unless the build requires pinning.

## Custom Domain

1. Open Cloudflare Dashboard.
2. Go to Workers & Pages.
3. Select the QR Studio Pages project.
4. Open Custom domains.
5. Add the target domain or subdomain, for example `qr.example.com`.
6. Follow Cloudflare's DNS prompts until the certificate is active.

For an apex domain, the domain must be in the same Cloudflare account as the Pages project. For a subdomain, configure the CNAME record requested by Cloudflare Pages.

## Runtime Notes

- The MVP does not need Workers, Pages Functions, KV, D1, or R2.
- User-entered text and JSON stay in the browser.
- Add Pages Functions only if future work introduces server-side presets, shared links, saved history, or analytics.
```

- [ ] **Step 2: Link deployment doc from PRD**

Add this line under `## 10. References` in `docs/prd/qrcode-site-prd.md`:

```md
- Deployment plan: ../deployment-cloudflare-pages.md
```

- [ ] **Step 3: Commit deployment docs**

```bash
git add docs/deployment-cloudflare-pages.md docs/prd/qrcode-site-prd.md
git commit -m "docs: add cloudflare pages deployment notes"
```

---

### Task 8: Final Verification And Handoff

**Files:**
- No planned source edits.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 2: Start local preview**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 3: Manually verify the MVP flow in the browser**

Check:

- JSON default input produces a QR preview.
- Invalid JSON shows `JSON 格式无效，请检查括号、引号和逗号。`.
- Text mode accepts `hello world`.
- PNG download button creates `qr-code.png`.
- SVG download button creates `qr-code.svg`.
- Copy content shows `内容已复制。` or a browser-specific clipboard fallback.
- The layout stacks cleanly below `860px` width.

- [ ] **Step 4: Commit any verification-only fixes**

If manual verification reveals a defect, fix only that defect, rerun the relevant test plus `npm run build`, then commit:

```bash
git add src docs package.json package-lock.json
git commit -m "fix: polish qr studio mvp"
```

- [ ] **Step 5: Report completion with evidence**

Include:

- Exact test command and result.
- Exact build command and result.
- Local dev URL.
- Any known limitations, especially clipboard image copy not being part of MVP.

---

## Self-Review

- Spec coverage: the plan covers text mode, JSON validation/formatting, local QR generation, PNG/SVG export, copy content, basic QR options, custom domain deployment notes, and responsive UI.
- Out-of-scope protection: the plan does not add image upload, accounts, history, short links, analytics, or batch generation.
- Placeholder scan: no placeholder markers remain.
- Type consistency: `InputMode`, `ErrorCorrectionLevel`, `ContentState`, and `QrOptions` are defined in Task 2 and reused consistently by later tasks.
