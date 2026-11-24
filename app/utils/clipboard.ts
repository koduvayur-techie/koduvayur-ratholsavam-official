// app/utils/clipboard.ts
export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof window === 'undefined' || !value) return false

  // 1. Modern Async Clipboard API (HTTPS & localhost)
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Proceed to synchronous textarea fallback below
    }
  }

  // 2. Universal Fallback for LAN IP dev testing (http://192.168.x.x:3006) & Android WebViews
  try {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)

    textarea.focus({ preventScroll: true })
    textarea.select()
    textarea.setSelectionRange(0, value.length)

    const succeeded = document.execCommand('copy')
    document.body.removeChild(textarea)
    return succeeded
  } catch {
    return false
  }
}