export default function getAuthWebRedirectUrl(redirectUrl?: string) {
  if (redirectUrl) {
    return `${window.location.protocol}//${window.location.host}${redirectUrl}`;
  }
  return `${window.location.protocol}//${window.location.host}/`;
}
