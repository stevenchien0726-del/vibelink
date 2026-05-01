export function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor

  return (
    ua.includes('Instagram') ||
    ua.includes('FBAN') || // Facebook
    ua.includes('FBAV') ||
    ua.includes('Line') ||
    ua.includes('Messenger')
  )
}