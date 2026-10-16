import { invoke } from '@tauri-apps/api/core'

export const desktopApi = {
  writeClipboardText: (text: string): Promise<boolean> =>
    invoke('clipboard_write_text', { text }).then(() => true),
}

declare global {
  interface Window {
    api?: typeof desktopApi
  }
}

export function installDesktopApi() {
  window.api = desktopApi
}
