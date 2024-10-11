import welcome from "./welcome.html";

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log(
      `Hello ${request.headers.get("User-Agent")} at path ${url.pathname}!`,
    );
    const path = url.pathname.slice(1);

    // Remove leading slash and decode the URL
    let targetUrl = decodeURIComponent(path);

    // If the targetUrl doesn't start with http:// or https://, prepend https://
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    if (targetUrl.startsWith("http") && path !== "") {
      try {
        const parsedUrl = new URL(targetUrl);
        const hostname = parsedUrl.hostname.toLowerCase();

        let text;
        if (hostname === "github.com") {
          text = await fetchFromUithub(targetUrl);
        } else if (hostname === "npmjs.com") {
          text = await fetchFromNpmjz(targetUrl);
        } else if (hostname === "youtube.com" || hostname === "youtu.be") {
          text = await fetchFromYoutudo(targetUrl);
        } else {
          text = await fetchFromJina(targetUrl, env.JINA_API_KEY);
        }

        return new Response(text);
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }

    return new Response(welcome, {
      headers: {
        "content-type": "text/html",
      },
    });
  },
};

async function fetchFromUithub(url) {
  const response = await fetch(url.replace("g", "u"));
  if (!response.ok) {
    throw new Error(`Uithub request failed with status ${response.status}`);
  }
  return await response.text();
}

async function fetchFromNpmjz(url) {
  const response = await fetch(url.replace("s", "z"));
  if (!response.ok) {
    throw new Error(`Npmjz request failed with status ${response.status}`);
  }
  return await response.text();
}

async function fetchFromYoutudo(url) {
  const response = await fetch(url.replace("be", "do"));
  if (!response.ok) {
    throw new Error(`Youtudo request failed with status ${response.status}`);
  }
  return await response.text();
}

async function fetchFromJina(url, apiKey) {
  const response = await fetch("https://r.jina.ai/" + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${apiKey}`,
    },
    // body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error(`Jina request failed with status ${response.status}`);
  }
  const text = await response.text();
  return text;
}
