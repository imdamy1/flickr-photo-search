// client/netlify/functions/flickr.cjs
exports.handler = async (event) => {
  try {
    const tags =
      (event.queryStringParameters && event.queryStringParameters.tags
        ? String(event.queryStringParameters.tags)
        : "nature").trim();

    const tagmode =
      (event.queryStringParameters && event.queryStringParameters.tagmode
        ? String(event.queryStringParameters.tagmode)
        : "any").trim();

    if (!tags) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ items: [], error: "Missing tags parameter." }),
      };
    }

    const flickrUrl =
      "https://www.flickr.com/services/feeds/photos_public.gne" +
      `?tags=${encodeURIComponent(tags)}` +
      `&tagmode=${encodeURIComponent(tagmode)}` +
      "&format=json" +
      "&nojsoncallback=1";

    const r = await fetch(flickrUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Netlify Function; Flickr Photo Search)",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    const text = await r.text();

    if (!r.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          items: [],
          error: `Flickr error: HTTP ${r.status}`,
          url: flickrUrl,
          preview: text.slice(0, 300),
        }),
      };
    }

    const trimmed = text.trim();
    if (
      trimmed.startsWith("<?xml") ||
      trimmed.startsWith("<rss") ||
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html")
    ) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          items: [],
          error: "Flickr returned XML/HTML instead of JSON.",
          url: flickrUrl,
          preview: trimmed.slice(0, 300),
        }),
      };
    }

    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          items: [],
          error: "Failed to parse Flickr response as JSON.",
          url: flickrUrl,
          preview: trimmed.slice(0, 300),
        }),
      };
    }

    const items = Array.isArray(data.items) ? data.items : [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ ...data, items }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ items: [], error: String(e) }),
    };
  }
};
