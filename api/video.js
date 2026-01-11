// api/video.js

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const instaUrl = req.query.url;

    if (!instaUrl) {
      return res.status(400).json({
        status: "error",
        message: "URL is required. Example: /api/video?url=INSTAGRAM_LINK",
      });
    }

    // ✅ Read ENV variables from Vercel
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

    if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
      return res.status(500).json({
        status: "error",
        message:
          "Missing env variables. Add RAPIDAPI_KEY and RAPIDAPI_HOST in Vercel → Settings → Environment Variables, then Redeploy.",
        gotKey: !!RAPIDAPI_KEY,
        gotHost: !!RAPIDAPI_HOST,
      });
    }

    // ✅ RapidAPI endpoint (your selected API)
    const apiUrl =
      "https://instagram-reels-downloader-api.p.rapidapi.com/download?url=" +
      encodeURIComponent(instaUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    const data = await response.json();

    // ❌ RapidAPI error case
    if (!response.ok) {
      return res.status(response.status).json({
        status: "error",
        message: "RapidAPI request failed",
        rapidapi_status: response.status,
        rapidapi_response: data,
      });
    }

    // ✅ Extract mp4 link from response (different APIs return different keys)
    let downloadUrl = null;

    if (data?.download_url) downloadUrl = data.download_url;
    else if (data?.mp4) downloadUrl = data.mp4;
    else if (data?.url) downloadUrl = data.url;
    else if (data?.video) downloadUrl = data.video;

    else if (data?.result?.download_url) downloadUrl = data.result.download_url;
    else if (data?.result?.mp4) downloadUrl = data.result.mp4;
    else if (data?.result?.url) downloadUrl = data.result.url;
    else if (data?.result?.video) downloadUrl = data.result.video;

    else if (Array.isArray(data?.links) && data.links.length > 0) {
      downloadUrl = data.links[0]?.url || data.links[0];
    } else if (Array.isArray(data?.result) && data.result.length > 0) {
      downloadUrl = data.result[0]?.url || data.result[0];
    } else if (Array.isArray(data?.medias) && data.medias.length > 0) {
      const videoItem = data.medias.find((m) => m?.url) || data.medias[0];
      downloadUrl = videoItem?.url;
    }

    // ✅ if mp4 not found, return raw response (so we can see real keys)
    if (!downloadUrl) {
      return res.status(200).json({
        status: "success",
        message:
          "RapidAPI response OK but mp4 link not found. See rapidapi_raw keys.",
        input: instaUrl,
        rapidapi_raw: data,
      });
    }

    // ✅ Final response
    return res.status(200).json({
      status: "success",
      input: instaUrl,
      mp4: downloadUrl,
      message: "MP4 link generated ✅",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: String(err),
    });
  }
}
