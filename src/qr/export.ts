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
  const anchor = link instanceof Node ? link : document.createElementNS('http://www.w3.org/1999/xhtml', 'a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  link.click();
  document.body.removeChild(anchor);
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
