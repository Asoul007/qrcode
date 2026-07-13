export async function copyText(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前浏览器不支持复制到剪贴板。');
  }

  await navigator.clipboard.writeText(value);
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a') as HTMLAnchorElement;

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadDataUrl(filename: string, dataUrl: string): void {
  const link = document.createElement('a') as HTMLAnchorElement;

  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
