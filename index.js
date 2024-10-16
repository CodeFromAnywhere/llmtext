const proxies = {
  "github.com": (url) => url.replace("g", "u"),
  "npmjs.com": (url) => url.replace("js", "jz"),
  "youtube.com": (url) => url.replace("be", "do"),
  // TODO: put serper behind it in the google url structure
  "google.com": (url) => url.replace("e", "lm"),
  // TODO: replace with entire sitemap scrape with firecrawl.dev
  default: (url) => "https://r.jina.ai/" + url,
  /** 
   TODO: x.com, linkedin.com, etc.
   (use user oauth)
   */
};

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const headers = {};
    request.headers.forEach((value, key) => (headers[key] = value));

    // Remove leading slash and decode the URL
    let targetUrl = decodeURIComponent(
      request.url.slice(url.origin.length + 1),
    );

    // If the targetUrl doesn't start with http:// or https://, prepend https://
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    if (targetUrl.startsWith("http") && url.pathname !== "/") {
      try {
        const parsedUrl = new URL(targetUrl);
        const hostname = parsedUrl.hostname.startsWith("www.")
          ? parsedUrl.hostname.toLowerCase().slice(4)
          : parsedUrl.hostname.toLowerCase();

        console.log({ targetUrl, hostname });

        const fetchUrl = (proxies[hostname] || proxies.default)(
          targetUrl.toLowerCase(),
        );
        console.log({ fetchUrl });

        const response = await fetch(fetchUrl, { headers });
        if (!response.ok) {
          const text = await response.text();
          return new Response(
            `Request failed with status ${response.status}: ${text}`,
            { status: response.status },
          );
        }

        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        const text = await response.text();

        return new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }

    return new Response("Path not found", {
      headers: {
        "content-type": "text/html",
      },
    });
  },
};
