const legacyHtmlRoutes = [
  /^\/work-with-me\/?$/,
  /^\/privacy-policy\/?$/,
  /^\/404_not_found\/?$/,
  /^\/author\/davidr\/?$/
];

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  const pathname = new URL(context.request.url).pathname;
  if (!contentType.includes('text/html') || !legacyHtmlRoutes.some((route) => route.test(pathname))) return response;

  return new HTMLRewriter()
    .on('script', {
      element(element) {
        const src = element.getAttribute('src') || '';
        if (src.includes('googletagmanager.com/gtag/js')) element.remove();
      }
    })
    .on('head', {
      element(element) {
        element.append('<link rel="stylesheet" href="/assets/tib-consent.css"><script defer src="/assets/tib-consent.js"></script>', { html: true });
      }
    })
    .on('footer', {
      element(element) {
        element.append('<a class="tib-consent-settings" href="#tib-cookie-settings">Cookie settings</a>', { html: true });
      }
    })
    .transform(response);
}
